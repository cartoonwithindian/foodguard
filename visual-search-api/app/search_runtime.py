"""CLIP + FAISS visual search runtime, loaded once at startup."""
from __future__ import annotations

import logging
import re
from io import BytesIO
from pathlib import Path

import faiss
import numpy as np
import open_clip
import requests
import torch
from PIL import Image

from . import config

logger = logging.getLogger("foodguard.visualsearch")


class SearchRuntime:
    """Loads the CLIP model and FAISS index once, then serves searches."""

    def __init__(self) -> None:
        self.device = config.DEVICE
        self._index: faiss.Index | None = None
        self._records: list[dict] = []
        self._model = None
        self._preprocess = None

    @property
    def ready(self) -> bool:
        return self._index is not None

    def load(self) -> None:
        for name, path in [
            ("FAISS", config.FAISS_FILE),
            ("FEATURES", config.FEATURES_FILE),
            ("LAYER1", config.LAYER1_FILE),
        ]:
            if not path.is_file():
                raise RuntimeError(f"Missing visual search file '{path.name}' at: {path}")
            logger.info("Found %s (%s MB)", name, round(path.stat().st_size / (1024 * 1024), 2))

        logger.info("Loading FAISS index from %s", config.FAISS_FILE)
        self._index = faiss.read_index(str(config.FAISS_FILE))
        logger.info("Loaded %s vectors (dim %s)", self._index.ntotal, self._index.d)

        with open(config.FEATURES_FILE, "r", encoding="utf-8") as f:
            self._records = list(__import__("json").load(f))
        logger.info("Loaded %s product records", len(self._records))

        logger.info("Loading CLIP model (%s) on %s", "ViT-B-32", self.device.upper())
        self._model, _, self._preprocess = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained="openai"
        )
        self._model = self._model.to(self.device)
        self._model.eval()
        logger.info("CLIP loaded successfully")

    # ── Image loading ──────────────────────────────────────────────────────

    @staticmethod
    def load_image_bytes(data: bytes) -> Image.Image:
        img = Image.open(BytesIO(data))
        return img.convert("RGB")

    @staticmethod
    def load_image_url(url: str) -> Image.Image:
        headers = {"User-Agent": "Mozilla/5.0"}
        with requests.get(url, headers=headers, timeout=30) as resp:
            resp.raise_for_status()
            return SearchRuntime.load_image_bytes(resp.content)

    # ── Product names ──────────────────────────────────────────────────────

    @staticmethod
    def product_name(rec: dict) -> str:
        pid = str(rec.get("product_id", ""))
        if pid:
            return re.sub(r"_\d+$", "", pid)
        img_p = str(rec.get("image_path", "")).replace("\\", "/")
        parts = img_p.split("/")
        return parts[-2] if len(parts) >= 2 else "Unknown Product"

    # ── Search ─────────────────────────────────────────────────────────────

    def search_bytes(self, data: bytes, top_k: int = 5) -> list[dict]:
        if not self.ready:
            raise RuntimeError("visual search runtime not loaded")
        return self._search(self.load_image_bytes(data), top_k)

    def search_url(self, url: str, top_k: int = 5) -> list[dict]:
        if not self.ready:
            raise RuntimeError("visual search runtime not loaded")
        return self._search(self.load_image_url(url), top_k)

    def _search(self, img: Image.Image, top_k: int) -> list[dict]:
        assert self._model is not None and self._preprocess is not None and self._index is not None
        tensor = self._preprocess(img).unsqueeze(0).to(self.device)

        with torch.inference_mode():
            features = self._model.encode_image(tensor).detach().cpu().numpy()

        vector = np.ascontiguousarray(features.astype("float32"))
        distances, indices = self._index.search(vector, top_k)

        results = []
        for rank, (score, idx) in enumerate(zip(distances[0], indices[0]), start=1):
            if int(idx) < 0:
                continue
            rec = self._records[int(idx)]
            results.append(
                {
                    "rank": rank,
                    "product_name": self.product_name(rec),
                    "product_id": rec.get("product_id"),
                    "score": float(score),
                    "image_path": rec.get("image_path"),
                }
            )
        return results


_runtime: SearchRuntime | None = None


def get_runtime() -> SearchRuntime:
    global _runtime
    if _runtime is None:
        _runtime = SearchRuntime()
    return _runtime
