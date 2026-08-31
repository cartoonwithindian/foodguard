"""Gunicorn config for the FoodGuard API on a CPU-only host."""

import os

bind = f"0.0.0.0:{os.getenv('PORT', '10000')}"
# Single worker: the CLIP model + FAISS index are large and must not be
# duplicated across processes on a memory-constrained (CPU) host.
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
timeout = int(os.getenv("GUNICORN_TIMEOUT", "180"))
graceful_timeout = 30
keepalive = 5
accesslog = "-"
errorlog = "-"
preload_app = True
