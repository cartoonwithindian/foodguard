"""Gunicorn config for the FoodGuard API on a CPU-only host."""

import multiprocessing
import os

bind = f"0.0.0.0:{os.getenv('PORT', '10000')}"
workers = int(os.getenv("WEB_CONCURRENCY", max(1, (multiprocessing.cpu_count() or 1) // 2)))
worker_class = "uvicorn.workers.UvicornWorker"
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
graceful_timeout = 30
keepalive = 5
accesslog = "-"
errorlog = "-"
preload_app = True
