#!/usr/bin/env bash
# Download the EXACT OpenAI CLIP ViT-B-32 checkpoint during the Render build so
# that runtime loads it from local files (no Hugging Face / Azure download at
# startup). This preserves byte-for-byte the checkpoint that produced the
# existing 13,671-vector FAISS database.
#
#   source: open_clip pretrained "openai" ViT-B-32
#   url:    https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt
#
# If the file is already present (cached from a prior build, or pre-committed),
# this step is a no-op.
set -euo pipefail

MODEL_URL="https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt"
DEST="$(dirname "$0")/models/ViT-B-32.pt"
mkdir -p "$(dirname "$DEST")"

if [ -f "$DEST" ] && [ -s "$DEST" ]; then
    echo "Model already present locally: $DEST ($(du -h "$DEST" | cut -f1))"
    exit 0
fi

echo "Downloading exact CLIP ViT-B-32 (openai) checkpoint..."
curl -fL --retry 5 --retry-delay 5 -o "$DEST" "$MODEL_URL"
echo "Downloaded to $DEST ($(du -h "$DEST" | cut -f1))"
