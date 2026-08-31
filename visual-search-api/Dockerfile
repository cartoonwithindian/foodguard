FROM python:3.12-slim

WORKDIR /srv/app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FOODGUARD_RUNTIME=/srv/app/assets \
    ALLOWED_ORIGINS="" \
    PORT=8001

# System libs required by torch / faiss / Pillow / CLIP image decoding.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libgl1 \
    libglib2.0-0 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first so rebuilds reuse the layer cache.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download the CLIP + FAISS runtime assets once at build time so the image is
# self-contained and boots without a network round-trip. Assets mirror the
# ones hosted at https://huggingface.co/nazimtovo/foodguard-assets.
RUN mkdir -p /srv/app/assets && \
    wget -q -O /srv/app/assets/products_images_faiss_index_v2.bin \
        https://huggingface.co/nazimtovo/foodguard-assets/resolve/main/products_images_faiss_index_v2.bin && \
    wget -q -O /srv/app/assets/products_images_features_v2.json \
        https://huggingface.co/nazimtovo/foodguard-assets/resolve/main/products_images_features_v2.json && \
    wget -q -O /srv/app/assets/products_layer1_quality.json \
        https://huggingface.co/nazimtovo/foodguard-assets/resolve/main/products_layer1_quality.json && \
    ls -la /srv/app/assets

# Copy the application code.
COPY app ./app

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0) if urllib.request.urlopen('http://127.0.0.1:8001/health', timeout=5).status==200 else sys.exit(1)" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}"]
