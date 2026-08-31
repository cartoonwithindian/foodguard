from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from .. import config
from ..auth import require_api_key
from ..search_runtime import get_runtime

router = APIRouter(prefix="/api/v1")


@router.post("/search", summary="Top-K visually similar products for an uploaded image",
             dependencies=[Depends(require_api_key)])
async def search(
    image: UploadFile = File(..., description="Image file (JPEG/PNG/WEBP)"),
    top_k: int = Form(5),
):
    if image.size and image.size > config.MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the maximum allowed size")
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty image upload")
    rt = get_runtime()
    try:
        results = rt.search_bytes(data, top_k=top_k)
    except Exception as exc:  # image decode / model errors -> 422
        raise HTTPException(status_code=422, detail=f"Could not process image: {exc}") from exc
    return {"query": image.filename, "results": results}


@router.get("/search-url", summary="Top-K visually similar products for a remote image URL",
            dependencies=[Depends(require_api_key)])
def search_url(url: str, top_k: int = 5):
    if not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=400, detail="url must be http(s)")
    rt = get_runtime()
    try:
        results = rt.search_url(url, top_k=top_k)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not process image: {exc}") from exc
    return {"query": url, "results": results}
