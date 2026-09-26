import math
from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, HTTPException

from .. import config
from ..auth import require_api_key
from ..search_runtime import get_runtime

router = APIRouter(prefix="/api/v1")


@router.post(
    "/search_by_vector",
    summary="Top-K visually similar products for an embedding vector",
    dependencies=[Depends(require_api_key)],
)
def search_by_vector(
    payload: Annotated[
        dict[str, Any],
        Body(
            ...,
            description=(
                'JSON body: {"vector": [512 floats], "top_k": 5}. The vector is '
                "a raw (non-normalized) CLIP ViT-B-32 image embedding produced "
                "client-side."
            ),
            examples=[{"vector": [0.0] * config.EMBED_DIM, "top_k": 5}],
        ),
    ],
):
    vector = payload.get("vector")
    if not isinstance(vector, (list, tuple)):
        raise HTTPException(status_code=422, detail="'vector' must be an array of numbers")

    if len(vector) != config.EMBED_DIM:
        raise HTTPException(
            status_code=422,
            detail=f"'vector' must contain exactly {config.EMBED_DIM} numbers "
            f"(got {len(vector)})",
        )

    # All values must be finite real numbers.
    try:
        for v in vector:
            if not isinstance(v, (int, float)) or isinstance(v, bool) or not math.isfinite(v):
                raise ValueError
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="'vector' must contain only finite numeric values",
        ) from None

    top_k = payload.get("top_k", 5)
    try:
        top_k = int(top_k)
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail="'top_k' must be an integer") from None
    if top_k < 1:
        raise HTTPException(status_code=422, detail="'top_k' must be >= 1")

    rt = get_runtime()
    try:
        results = rt.search_vector(vector, top_k=top_k)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # runtime not loaded / index errors
        raise HTTPException(status_code=503, detail=f"Search unavailable: {exc}") from exc

    return {"query": "vector_search", "results": results}
