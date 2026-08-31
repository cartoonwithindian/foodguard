#!/usr/bin/env python3
import argparse
from io import BytesIO
import json
import os
from pathlib import Path
import re
import sys
import time
import faiss
import numpy as np
import open_clip
from PIL import Image
import requests
import torch

# ================================================================
# AUTO-DETECT RUNTIME PATH
# ================================================================
SCRIPT_DIR = Path(__file__).resolve().parent

# Check current directory first, then subfolder
if (SCRIPT_DIR / "products_images_faiss_index_v2.bin").exists():
    RUNTIME_DIR = SCRIPT_DIR
elif (SCRIPT_DIR / "FOODGUARD_RUNTIME").exists():
    RUNTIME_DIR = SCRIPT_DIR / "FOODGUARD_RUNTIME"
else:
    RUNTIME_DIR = SCRIPT_DIR

FAISS_FILE = RUNTIME_DIR / "products_images_faiss_index_v2.bin"
FEATURES_FILE = RUNTIME_DIR / "products_images_features_v2.json"
LAYER1_FILE = RUNTIME_DIR / "products_layer1_quality.json"
OUTPUT_FILE = SCRIPT_DIR / "foodguard_search_result.json"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print("=" * 70)
print("FOODGUARD — VISUAL PRODUCT SEARCH RUNTIME")
print("=" * 70)

# Check files
for name, path in [
    ("FAISS", FAISS_FILE),
    ("FEATURES", FEATURES_FILE),
    ("LAYER1", LAYER1_FILE),
]:
    if not path.is_file():
        sys.exit(f"\n❌ Error: Missing file '{path.name}' at: {path}")
    print(f"✅ Found {name:<10} ({path.stat().st_size / (1024*1024):.2f} MB)")

# Load FAISS
print("\nLoading FAISS index...")
index = faiss.read_index(str(FAISS_FILE))
print(f"✅ Loaded {index.ntotal:,} vectors (Dimension: {index.d})")

# Load Metadata
print("Loading product metadata...")
with open(FEATURES_FILE, "r", encoding="utf-8") as f:
    records = json.load(f)
print(f"✅ Loaded {len(records):,} records")

# Load CLIP Model
print(f"\nLoading CLIP model on {DEVICE.upper()}...")
model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="openai"
)
model = model.to(DEVICE)
model.eval()
print("✅ CLIP loaded successfully")


# Image Loader
def load_image(image_input: str) -> Image.Image:
    if image_input.startswith(("http://", "https://")):
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(image_input, headers=headers, timeout=30)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content))
    else:
        path = Path(image_input)
        if not path.is_file():
            sys.exit(f"❌ File not found: {path}")
        img = Image.open(path)
    return img.convert("RGB")


# Product Name Extractor
def get_product_name(rec: dict) -> str:
    pid = str(rec.get("product_id", ""))
    if pid:
        return re.sub(r"_\d+$", "", pid)
    img_p = str(rec.get("image_path", "")).replace("\\", "/")
    parts = img_p.split("/")
    return parts[-2] if len(parts) >= 2 else "Unknown Product"


# Search Function
def search(image_input: str, top_k: int = 5):
    img = load_image(image_input)
    tensor = preprocess(img).unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        features = model.encode_image(tensor).detach().cpu().numpy()

    vector = np.ascontiguousarray(features.astype("float32"))

    distances, indices = index.search(vector, top_k)

    results = []
    for rank, (score, idx) in enumerate(
        zip(distances[0], indices[0]), start=1
    ):
        if idx < 0:
            continue
        rec = records[int(idx)]
        results.append(
            {
                "rank": rank,
                "product_name": get_product_name(rec),
                "product_id": rec.get("product_id"),
                "score": float(score),
                "image_path": rec.get("image_path"),
            }
        )

    # Display results
    print("\n" + "=" * 70)
    print("🏆 TOP MATCHES:")
    print("=" * 70)
    for r in results:
        print(f"#{r['rank']} {r['product_name']}")
        print(
            f"   Score: {r['score']:.4f}  |  ID: {r['product_id']}  |  Image: {r['image_path']}\n"
        )

    # Save output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {"query": image_input, "results": results}, f, indent=2
        )
    print(f"📁 Result saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--image", "-i", type=str, help="Image URL or local image path"
    )
    parser.add_argument(
        "--top-k", "-k", type=int, default=5, help="Number of results"
    )
    args = parser.parse_args()

    img_src = args.image
    if not img_src:
        img_src = input("\nEnter image URL or local path: ").strip()

    if img_src:
        search(img_src, top_k=args.top_k)
