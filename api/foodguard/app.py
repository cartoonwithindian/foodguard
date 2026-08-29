"""FoodGuard FastAPI application.

Exposes:

    GET  /health                       liveness/readiness
    POST /search                       multipart image upload  (field: image)
    POST /search/url                   JSON { "url": "..." }   (SSRF-safe fetch)

The pipeline (model + FAISS + feature index) is loaded once at startup and
reused for every request. Responses use a stable, frontend-friendly schema.
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import __version__
from .config import Settings
from .engine import FoodGuardEngine, PipelineError
from .schemas import HealthResponse, SearchResponseOk, UrlSearchRequest
from .security import ImageFetcher

log = logging.getLogger("foodguard")


def _error_payload(message: str, request_id: str, debug: str | None = None) -> dict:
    payload = {
        "success": False,
        "request_id": request_id,
        "error": {"message": message, "status": 400},
    }
    if debug:
        payload["error"]["debug"] = debug
    return payload


def build_app(
    settings: Settings | None = None,
    engine: FoodGuardEngine | None = None,
    fetcher: ImageFetcher | None = None,
) -> FastAPI:
    settings = settings or Settings.from_env()

    engine = engine or FoodGuardEngine(settings)
    fetcher = fetcher or ImageFetcher(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Load model + assets in a thread so we don't block the event loop.
        # Injected engines are considered already-loaded (tests/mocks).
        if engine.model is None or engine.index is None:
            await asyncio.to_thread(engine.load)
        yield

    app = FastAPI(
        title="FoodGuard Visual Search API",
        version=__version__,
        description="CLIP + FAISS visual product identification (5-layer pipeline).",
        lifespan=lifespan,
        docs_url="/docs",
        openapi_url="/openapi.json",
    )

    # CORS -----------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.allowed_origins),
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception mapping -----------------------------------------------------
    @app.exception_handler(PipelineError)
    async def pipeline_error_handler(request, exc: PipelineError):
        rid = request.state.request_id
        return JSONResponse(
            status_code=exc.status,
            content=_error_payload(str(exc), rid),
        )

    @app.exception_handler(HTTPException)
    async def http_exc_handler(request, exc: HTTPException):
        rid = request.state.request_id
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_payload(str(exc.detail), rid),
        )

    @app.middleware("http")
    async def request_id_middleware(request, call_next):
        from .engine import _request_id

        request.state.request_id = _request_id()
        return await call_next(request)

    # Routes ----------------------------------------------------------------
    @app.get("/health", response_model=HealthResponse, tags=["health"])
    async def health():
        ready = engine.index is not None and engine.model is not None
        if not ready:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "starting",
                    "service": "foodguard-api",
                    "version": __version__,
                    "model": settings.model_name,
                    "database_images": len(engine.records),
                    "embedding_dimension": engine.index.d if engine.index else 0,
                    "device": engine.device,
                    "ready": False,
                },
            )
        return HealthResponse(
            status="ok",
            service="foodguard-api",
            version=__version__,
            model=settings.model_name,
            database_images=len(engine.records),
            embedding_dimension=engine.index.d,
            device=engine.device,
            ready=True,
        )

    @app.post("/search", response_model=SearchResponseOk, tags=["search"])
    async def search_image(image: UploadFile = File(..., description="image file")):
        data = await _read_upload(image)
        img = await asyncio.to_thread(engine.open_image, data)
        result = await asyncio.to_thread(engine.search_image, img)
        return result

    @app.post("/search/url", response_model=SearchResponseOk, tags=["search"])
    async def search_by_url(payload: UrlSearchRequest):
        data, _ct = await asyncio.to_thread(fetcher.fetch, payload.url)
        img = await asyncio.to_thread(engine.open_image, data)
        result = await asyncio.to_thread(engine.search_image, img)
        result["query"] = {"source": "url", "url": payload.url}
        return result

    async def _read_upload(upload: UploadFile) -> bytes:
        import io

        max_bytes = settings.max_image_mb * 1024 * 1024
        data = await upload.read()
        if not data:
            raise HTTPException(status_code=422, detail="Uploaded file is empty")
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"Image exceeds {settings.max_image_mb:.0f} MB limit",
            )
        return data

    return app
