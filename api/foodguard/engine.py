"""FoodGuard visual product identification pipeline (Layers 1-5).

Implements the verified 5-layer pipeline over a 512-dim CLIP + FAISS database:

    layer_1  image preprocessing & quality      (PIL -> RGB, resize)
    layer_2  CLIP feature extraction            (ViT-B-32 / openai)
    layer_3  FAISS visual retrieval             (IndexFlatL2, normalise_L2)
    layer_4  visual / product / brand ranking
    layer_5  variant / size disambiguation

Scoring is anchored on the documented Layer 5 configuration and the verified
``visual = 1 / (1 + distance / 20)`` mapping. All heavy resources (model, FAISS
index, feature list, quality map) are loaded exactly once at startup and reused.
"""

from __future__ import annotations

import json
import logging
import os
import re
import threading
import time
from pathlib import Path
from typing import Any
from uuid import uuid4

import faiss
import numpy as np

from .lexical import (
    extract_variants,
    fuzzy_brand_score,
    fuzzy_product_score,
    strip_variants,
)

log = logging.getLogger("foodguard.engine")


class PipelineError(Exception):
    """Raised when a required runtime asset is missing or incompatible."""

    def __init__(self, message: str, *, status: int = 503):
        super().__init__(message)
        self.status = status


# --------------------------------------------------------------------------- #
# Layer 4 / 5 helpers
# --------------------------------------------------------------------------- #

def visual_score(distance: float) -> float:
    """Verified mapping from L2 distance to a 0..1 visual confidence."""
    return round(1.0 / (1.0 + distance / 20.0), 6)


def _strip_index_suffix(product_id: str | None) -> str:
    """'Maggi X 70g_8410' -> 'Maggi X 70g'."""
    return re.sub(r"_\d+$", "", product_id or "")


def _base_from_path(image_path: str | None) -> str:
    """'products_images/X/image_1.jpg' -> 'X'."""
    p = (image_path or "").replace("\\", "/")
    parts = [x for x in p.split("/") if x]
    if len(parts) >= 2:
        return parts[-2]
    return parts[-1] if parts else ""


def _first_word(name: str) -> str:
    core = strip_variants(name)
    words = core.split()
    return words[0] if words else ""


def _request_id() -> str:
    return f"fg_{time.strftime('%Y%m%d_%H%M%S')}_{uuid4().hex[:8]}"


class FoodGuardEngine:
    """Loaded-once pipeline. Not safe to instantiate more than needed."""

    def __init__(self, settings):
        self.settings = settings
        self.device = settings.resolved_device
        self.model = None
        self.preprocess = None
        self.index: Any = None
        self.records: list[dict[str, Any]] = []
        self.quality: dict[str, Any] = {}
        self._products_cache: list[str] = []
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ #
    # Loading
    # ------------------------------------------------------------------ #
    def load(self) -> None:
        started = time.time()
        self._load_assets()
        self._load_model()
        log.info(
            "pipeline ready in %.2fs (device=%s, records=%d, dim=%d)",
            time.time() - started,
            self.device,
            len(self.records),
            self.index.d if self.index is not None else 0,
        )

    def _load_assets(self) -> None:
        feat = self.settings.resolved_feature_file
        faiss_file = self.settings.resolved_faiss_file
        quality = self.settings.resolved_quality_file

        for label, path in (("feature", feat), ("faiss", faiss_file)):
            if not path.exists():
                raise PipelineError(f"Missing {label} asset: {path}")

        with open(feat, "r", encoding="utf-8") as f:
            self.records = json.load(f)
        self.index = faiss.read_index(str(faiss_file))
        if quality.exists():
            with open(quality, "r", encoding="utf-8") as f:
                self.quality = json.load(f)

        n = len(self.records)
        if self.index.ntotal != n:
            raise PipelineError(
                f"FAISS count ({self.index.ntotal}) != feature count ({n})"
            )
        if self.index.d != 512:
            raise PipelineError(f"FAISS dimension {self.index.d} != expected 512")

        self._products_cache = [
            _strip_index_suffix(r.get("product_id") or "") for r in self.records
        ]

    def _load_model(self) -> None:
        try:
            import open_clip
            import torch
        except ImportError as exc:  # pragma: no cover - defensive
            raise PipelineError(f"ML dependencies missing: {exc}")

        # Memory-conservative CPU configuration: cap intra-/inter-op threads so
        # torch does not spawn per-core runtime workers on a RAM-limited host.
        if not torch.cuda.is_available():
            torch.set_num_threads(1)
            torch.set_num_interop_threads(1)

        local_weights = os.getenv("FOODGUARD_LOCAL_WEIGHTS", "").strip()
        model_source = "HUGGINGFACE_RUNTIME_DOWNLOAD"
        if local_weights:
            weights_path = Path(local_weights)
            if not weights_path.is_absolute():
                weights_path = self.settings.base_dir / weights_path
            self._patch_openai_download(weights_path)
            model_source = "LOCAL"

        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            self.settings.model_name, pretrained=self.settings.pretrained
        )
        self.model = self.model.to(self.device)
        self.model.eval()

        log.info(
            "FoodGuard visual search starting...\n"
            "Model: %s / %s\n"
            "Embedding dimension: %d\n"
            "FAISS vectors: %d\n"
            "FAISS metric: IndexFlatL2 (query normalised_L2)\n"
            "Model source: %s\n"
            "Hugging Face runtime download: %s",
            self.settings.model_name,
            self.settings.pretrained,
            self.model.visual.output_dim,
            self.index.ntotal if self.index is not None else 0,
            model_source,
            "DISABLED" if local_weights else "ENABLED",
        )

    @staticmethod
    def _patch_openai_download(weights: Path):  # pragma: no cover - local only
        """Prefer a local OpenAI ``ViT-B-32.pt`` checkpoint for local testing."""
        if not weights.exists():
            raise PipelineError(f"FOODGUARD_LOCAL_WEIGHTS not found: {weights}")
        import open_clip.pretrained as pret

        orig = pret.download_pretrained

        def patched(cfg, *args, **kwargs):
            if cfg.get("url", "").endswith("ViT-B-32.pt"):
                return weights
            return orig(cfg, *args, **kwargs)

        pret.download_pretrained = patched
        # Rebinding into the package namespace so callers see the patch.
        import open_clip.pretrained as pret_mod

        pret_mod.download_pretrained = patched

    # ------------------------------------------------------------------ #
    # Layer 1
    # ------------------------------------------------------------------ #
    @staticmethod
    def open_image(data: bytes):
        from PIL import Image

        try:
            from io import BytesIO

            img = Image.open(BytesIO(data))
        except Exception as exc:
            raise PipelineError(f"Invalid image data: {exc}", status=422)
        return img.convert("RGB")

    @staticmethod
    def _quality_summary(img) -> dict[str, Any]:
        width, height = img.size
        area = width * height
        if area >= 600 * 600:
            status, score = "excellent", 1.0
        elif area >= 224 * 224:
            status, score = "good", 0.85
        elif area >= 96 * 96:
            status, score = "fair", 0.6
        else:
            status, score = "poor", 0.4
        return {"width": width, "height": height, "score": score, "status": status}

    # ------------------------------------------------------------------ #
    # Layer 2
    # ------------------------------------------------------------------ #
    def _embedding(self, img) -> np.ndarray:
        import torch

        tensor = self.preprocess(img).unsqueeze(0).to(self.device)
        with torch.inference_mode():
            emb = self.model.encode_image(tensor)
        emb = emb.cpu().numpy().astype("float32")
        faiss.normalize_L2(emb)
        return emb

    # ------------------------------------------------------------------ #
    # Search (Layers 1-5)
    # ------------------------------------------------------------------ #
    def search_image(self, img) -> dict[str, Any]:
        """Run the full 5-layer pipeline on an already-open PIL image."""
        if self.model is None or self.index is None:
            raise PipelineError("Pipeline not loaded", status=503)

        t0 = time.time()
        layers_used = [
            "image_quality",
            "clip",
            "faiss",
            "visual_ranking",
            "variant_disambiguation",
        ]

        quality = self._quality_summary(img)

        emb = self._embedding(img)
        distances, indices = self.index.search(emb, self.settings.top_k)

        candidates: list[dict[str, Any]] = []
        for distance, idx in zip(
            np.asarray(distances[0]), np.asarray(indices[0])
        ):
            idx = int(idx)
            if idx < 0 or idx >= len(self.records):
                continue
            rec = self.records[idx]
            product = self._products_cache[idx]
            candidates.append(
                {
                    "product": product,
                    "product_id": rec.get("product_id"),
                    "image_path": rec.get("image_path"),
                    "base": _base_from_path(rec.get("image_path") or ""),
                    "distance": float(distance),
                    "visual": visual_score(float(distance)),
                }
            )
            if len(candidates) >= self.settings.top_k:
                break

        if not candidates:
            raise PipelineError("No FAISS candidates found", status=404)

        # ----- Layer 4/5: lexical rerank + variant disambiguation -----
        # Text-free API: anchor the product/brand/variant reference on the
        # top-1 visual candidate, then score remaining candidates against it.
        anchor = candidates[0]
        ref_product = anchor["product"]
        ref_core = strip_variants(ref_product)
        ref_brand = _first_word(ref_product)
        ref_variants = extract_variants(ref_product)

        for cand in candidates:
            cand["visual"] = round(cand["visual"], 6)

        ranked = list(candidates)
        ranked[0].update(
            product_score=1.0,
            brand_score=1.0,
            variant_score=1.0,
            exact_variant=True,
        )

        for cand in ranked[1:]:
            cand_core = strip_variants(cand["product"])
            product_s = fuzzy_product_score(cand_core, ref_core) if ref_core else 0.0
            brand_s = (
                fuzzy_brand_score(_first_word(cand["product"]), ref_brand)
                if ref_brand
                else 0.0
            )
            cand_variants = extract_variants(cand["product"])
            if ref_variants and cand_variants:
                exact = bool(set(ref_variants) & set(cand_variants))
                variant_s = 1.0 if exact else max(
                    0.0,
                    self.settings.variant_neutral
                    - self.settings.variant_mismatch_penalty,
                )
            else:
                exact = False
                variant_s = self.settings.variant_neutral
            cand["product_score"] = round(product_s, 6)
            cand["brand_score"] = round(brand_s, 6)
            cand["variant_score"] = round(variant_s, 6)
            cand["exact_variant"] = bool(exact)

        for cand in ranked:
            cand["final_score"] = round(
                self.settings.visual_weight * cand["visual"]
                + self.settings.product_weight * cand["product_score"]
                + self.settings.brand_weight * cand["brand_score"]
                + self.settings.variant_weight * cand["variant_score"],
                6,
            )

        ranked.sort(key=lambda c: c["final_score"], reverse=True)
        for i, cand in enumerate(ranked, start=1):
            cand["rank"] = i

        best = ranked[0]
        overall = round(best["final_score"], 6)

        # Internal sub-confidence breakdown for the best match
        best["confidence"] = {
            "overall": overall,
            "visual": best["visual"],
            "product": best["product_score"],
            "brand": best["brand_score"],
            "variant": best["variant_score"],
        }

        thresholds = self.settings.match_quality_thresholds
        if overall >= thresholds["excellent"]:
            match_quality = "excellent"
        elif overall >= thresholds["good"]:
            match_quality = "good"
        elif overall >= thresholds["fair"]:
            match_quality = "fair"
        else:
            match_quality = "poor"

        candidates_variants = extract_variants(best["product"])
        query_variants = ref_variants

        return {
            "success": True,
            "request_id": _request_id(),
            "processing_time_ms": round((time.time() - t0) * 1000.0, 3),
            "query": {"source": "image"},
            "match": {
                "product_id": best["product_id"],
                "product_name": best["product"],
                "brand": _first_word(best["product"]),
                "variant": candidates_variants[0] if candidates_variants else "",
                "variant_detected": bool(candidates_variants),
                "exact_variant": best["exact_variant"],
                "image": {"url": best["image_path"]},
                "confidence": best["confidence"],
                "match_quality": match_quality,
            },
            "alternatives": [
                {
                    "rank": c["rank"],
                    "product_id": c["product_id"],
                    "product_name": c["product"],
                    "image": {"url": c["image_path"]},
                    "confidence": {
                        "overall": c["final_score"],
                        "visual": c["visual"],
                        "product": c["product_score"],
                        "brand": c["brand_score"],
                        "variant": c["variant_score"],
                    },
                    "exact_variant": c["exact_variant"],
                }
                for c in ranked[1 : self.settings.final_k]
            ],
            "visual": {
                "rank": best["rank"],
                "distance": best["distance"],
                "score": best["visual"],
            },
            "variant": {
                "detected": bool(candidates_variants),
                "query_variants": query_variants,
                "candidate_variants": candidates_variants,
                "exact_match": best["exact_variant"],
                "score": best["variant_score"],
            },
            "pipeline": {
                "layers": layers_used,
                "method": "visual",
                "status": "identified"
                if match_quality in ("good", "excellent")
                else "partial"
                if match_quality == "fair"
                else "not_identified",
            },
            "image_quality": quality,
            "metadata": {
                "database": "FoodGuard",
                "database_images": len(self.records),
                "model_version": "foodguard-visual-v1",
                "pipeline_version": "5-layer",
            },
        }
