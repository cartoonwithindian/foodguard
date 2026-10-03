"""Pydantic request models for the FoodGuard API."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class UrlSearchRequest(BaseModel):
    """Body for ``POST /search/url``."""

    url: str = Field(..., min_length=1, max_length=2048)

    @field_validator("url")
    @classmethod
    def _validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("url must not be empty")
        return v


class SearchResponseOk(BaseModel):
    success: bool = True
    request_id: str
    processing_time_ms: float
    query: dict
    match: dict
    alternatives: list
    visual: dict
    variant: dict
    pipeline: dict
    image_quality: dict
    metadata: dict


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model: str
    database_images: int
    embedding_dimension: int
    device: str
    ready: bool
