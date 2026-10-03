"""Runtime configuration for the FoodGuard visual search API.

Every value can be overridden through a ``FOODGUARD_*`` environment variable so
the same image/commit behaves identically locally and on Render.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

ENV_PREFIX = "FOODGUARD_"


def _env(name: str, default: str) -> str:
    return os.getenv(ENV_PREFIX + name, default)


def _env_bool(name: str, default: bool) -> bool:
    raw = _env(name, str(default)).strip().lower()
    return raw in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    try:
        return int(_env(name, str(default)))
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    try:
        return float(_env(name, str(default)))
    except ValueError:
        return default


_BASE_DIR = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class Settings:
    # ------------------------------------------------------------------ #
    # Asset paths (relative to the api/ root unless made absolute)
    # ------------------------------------------------------------------ #
    base_dir: Path = _BASE_DIR
    feature_file: Path = field(default=Path("products_images_features_v2.json"))
    faiss_file: Path = field(default=Path("products_images_faiss_index_v2.bin"))
    quality_file: Path = field(default=Path("products_layer1_quality.json"))

    # ------------------------------------------------------------------ #
    # CLIP model
    # ------------------------------------------------------------------ #
    model_name: str = field(default_factory=lambda: _env("MODEL_NAME", "ViT-B-32"))
    pretrained: str = field(default_factory=lambda: _env("PRETRAINED", "openai"))
    device: str = field(default_factory=lambda: _env("DEVICE", ""))

    # ------------------------------------------------------------------ #
    # Retrieval
    # ------------------------------------------------------------------ #
    top_k: int = field(default_factory=lambda: _env_int("TOP_K", 20))
    final_k: int = field(default_factory=lambda: _env_int("FINAL_K", 10))

    # ------------------------------------------------------------------ #
    # Layer 5 documented configuration (source of truth)
    # ------------------------------------------------------------------ #
    visual_weight: float = field(default_factory=lambda: _env_float("VISUAL_WEIGHT", 0.55))
    product_weight: float = field(default_factory=lambda: _env_float("PRODUCT_WEIGHT", 0.20))
    brand_weight: float = field(default_factory=lambda: _env_float("BRAND_WEIGHT", 0.10))
    variant_weight: float = field(default_factory=lambda: _env_float("VARIANT_WEIGHT", 0.15))
    exact_variant_bonus: float = field(default_factory=lambda: _env_float("EXACT_VARIANT_BONUS", 0.30))
    variant_mismatch_penalty: float = field(default_factory=lambda: _env_float("VARIANT_MISMATCH_PENALTY", 0.18))
    variant_neutral: float = field(default_factory=lambda: _env_float("VARIANT_NEUTRAL", 0.50))

    # ------------------------------------------------------------------ #
    # URL fetch / SSRF protection
    # ------------------------------------------------------------------ #
    max_image_mb: float = field(default_factory=lambda: _env_float("MAX_IMAGE_MB", 8.0))
    url_timeout_s: int = field(default_factory=lambda: _env_int("URL_TIMEOUT_S", 30))
    url_max_redirects: int = field(default_factory=lambda: _env_int("URL_MAX_REDIRECTS", 3))
    block_private: bool = field(default_factory=lambda: _env_bool("BLOCK_PRIVATE", True))

    # ------------------------------------------------------------------ #
    # CORS
    # ------------------------------------------------------------------ #
    allowed_origins: tuple[str, ...] = field(default_factory=tuple)

    @classmethod
    def from_env(cls) -> "Settings":
        raw = _env("ALLOWED_ORIGINS", "").strip()
        origins = tuple(
            o.strip()
            for o in raw.split(",")
            if o.strip()
        ) or ("*",)
        return cls(allowed_origins=origins)

    # ------------------------------------------------------------------ #
    # Derived helpers
    # ------------------------------------------------------------------ #
    def resolve(self, p: Path) -> Path:
        return p if p.is_absolute() else self.base_dir / p

    @property
    def resolved_feature_file(self) -> Path:
        return self.resolve(self.feature_file)

    @property
    def resolved_faiss_file(self) -> Path:
        return self.resolve(self.faiss_file)

    @property
    def resolved_quality_file(self) -> Path:
        return self.resolve(self.quality_file)

    @property
    def resolved_device(self) -> str:
        if self.device:
            return self.device
        try:
            import torch

            return "cuda" if torch.cuda.is_available() else "cpu"
        except Exception:
            return "cpu"

    @property
    def match_quality_thresholds(self) -> dict[str, float]:
        # overall confidence thresholds for match_quality classification
        return {
            "excellent": 0.80,
            "good": 0.65,
            "fair": 0.45,
        }
