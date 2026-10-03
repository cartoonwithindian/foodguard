"""Entrypoint for the FoodGuard API (uvicorn/gunicorn load this module)."""

from __future__ import annotations

import logging
import os

from foodguard.app import build_app
from foodguard.config import Settings

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

settings = Settings.from_env()
app = build_app(settings)
