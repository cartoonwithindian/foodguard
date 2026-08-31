# FoodGuard Visual Search API

A standalone FastAPI service that wraps the verified FoodGuard **5-layer** CLIP +
FAISS visual product identification pipeline (13,671 products, 512-dim).

It owns no UI — it exposes a small, stable HTTP surface that a frontend (or the
`foodguard` web app) can call:

| Method | Path            | Purpose                                            |
|--------|-----------------|----------------------------------------------------|
| GET    | `/health`       | Liveness / readiness (used by Render health check) |
| POST   | `/search`       | Multipart upload of an image (`image` field)       |
| POST   | `/search/url`   | JSON `{ "url": "..." }` — SSRF-safe image fetch    |
| GET    | `/docs`         | Swagger UI                                         |

## Pipeline

```
layer_1  image preprocessing & quality      (PIL -> RGB, resize, quality tag)
layer_2  CLIP feature extraction            (ViT-B-32 / openai, 512-d)
layer_3  FAISS visual retrieval             (IndexFlatL2, normalise_L2, top_k=20)
layer_4  visual / product / brand ranking
layer_5  variant / size disambiguation
```

Scoring uses the **documented Layer 5 configuration** (visual 0.55, product
0.20, brand 0.10, variant 0.15) and the **verified** visual mapping
`visual = 1 / (1 + distance / 20)`.

Runtime assets (shipped with the API, raw images excluded):

- `products_images_faiss_index_v2.bin`  (13,671 × 512 FLAT-L2 index)
- `products_images_features_v2.json`    (product metadata aligned to the index)
- `products_layer1_quality.json`        (per-image quality map)

## Run locally

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Optional: pre-download ViT-B-32.pt and set FOODGUARD_LOCAL_WEIGHTS to skip
# the network fetch of model weights.
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Example requests

```bash
# Health
curl -s localhost:8000/health

# Upload an image
curl -s -X POST localhost:8000/search -F "image=@/path/to/product.jpg"

# Search by URL (SSRF-protected)
curl -s -X POST localhost:8000/search/url \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com/product.jpg"}'
```

## Response

A single stable envelope with `success`, `request_id`, `processing_time_ms`,
`match` (product, brand, variant, confidence breakdown, match_quality),
`alternatives[]`, `visual`, `variant`, `image_quality`, and `metadata`.

## Configuration

All settings are overridable via `FOODGUARD_*` environment variables; see
`.env.example`. CORS is controlled by `FOODGUARD_ALLOWED_ORIGINS` (comma
separated, or `*`).

## Deploy (Render)

`render.yaml` defines a Python web service (`foodguard-api`). It downloads the
CLIP weights at startup and loads the FAISS index + feature JSON once; the
`/health` endpoint only reports OK once the pipeline is fully loaded.
