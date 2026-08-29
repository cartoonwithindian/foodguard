"""Text-normalisation and lexical scoring helpers.

These mirror the strategy used in the verified FoodGuard pipeline: candidate
product names are normalised (lowercase, punctuation stripped) and compared with
a fuzzy overlap that rewards token matches while tolerating size/variant wording.
"""

from __future__ import annotations

import html
import re
from difflib import SequenceMatcher

_SPLIT_RE = re.compile(r"[^a-z0-9]+")


def unescape(value) -> str:
    """Decode HTML entities and coerce to lowercase-agnostic clean text."""
    if value is None:
        return ""
    return html.unescape(str(value))


def normalise(name) -> str:
    """Lower-case, strip non-alphanumerics, collapse whitespace."""
    text = _SPLIT_RE.sub(" ", unescape(name).lower())
    return re.sub(r"\s+", " ", text).strip()


def tokens(name) -> set[str]:
    return set(normalise(name).split())


def token_overlap(a: str, b: str) -> float:
    """Fraction of ``b``'s tokens present in ``a`` (with || b || = 0 guard)."""
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(tb)


def fuzzy_product_score(candidate: str, reference: str) -> float:
    """Blend of token overlap and subsequence similarity for product scoring."""
    ov = token_overlap(reference, candidate)
    sm = SequenceMatcher(None, normalise(candidate), normalise(reference)).ratio()
    return round(0.6 * ov + 0.4 * sm, 4)


def fuzzy_brand_score(candidate_brand: str, reference_brand: str) -> float:
    """Brand match is simpler: exact-ish overlap of the brand tokens."""
    a = tokens(candidate_brand)
    b = tokens(reference_brand)
    if not a or not b:
        return 0.0
    inter = len(a & b)
    return round(inter / max(len(a), len(b)), 4)


# --------------------------------------------------------------------------- #
# Variant / size extraction
# --------------------------------------------------------------------------- #

_VARIANT_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*("
    r"g|kg|ml|l|gm|ml|ltr|ltrs|liter|litres|mg|cl|oz|lb|pack|pcs|piece|pieces|"
    r"tablets|tab|capsules|caps|sheets|pkt|pkts|rolls|bar|bars|sachet|sachets"
    r")\b",
    re.IGNORECASE,
)

_VARIANT_WORDS = {
    "g", "kg", "ml", "l", "gm", "ml", "ltr", "ltrs", "liter", "litres", "mg",
    "cl", "oz", "lb", "pack", "pcs", "piece", "pieces", "tablets", "tab",
    "capsules", "caps", "sheets", "pkt", "pkts", "rolls", "bar", "bars",
    "sachet", "sachets",
}


def extract_variants(name) -> list[str]:
    """Return normalised variant tokens (e.g. ['35gm'], ['1kg']) for a name."""
    if not name:
        return []
    found = []
    for num, unit in _VARIANT_RE.findall(normalise(name)):
        found.append(f"{num}{unit}")
    # Drop the last word if it is a bare unit (e.g. "... 500 g")
    if found:
        return sorted(set(found))
    return []


def strip_variants(name) -> str:
    """Name with variant/size tokens removed (kept as the product core)."""
    norm = normalise(name)
    for token in extract_variants(name):
        norm = norm.replace(token, " ")
    return re.sub(r"\s+", " ", norm).strip()


def extract_brands(name) -> set[str]:
    """Best-effort brand tokens: the first 1-2 capitalised words of a name."""
    # Heuristic only; this is intentionally conservative.
    words = normalise(name).split()
    if not words:
        return set()
    return set(words[:2])
