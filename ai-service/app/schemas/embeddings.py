from typing import List
from pydantic import BaseModel, Field


class TextEmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Item text description to embed using SigLIP")


class TextEmbeddingResponse(BaseModel):
    model: str = Field(..., description="SigLIP model identifier")
    dimensions: int = Field(..., description="Vector dimensionality (e.g. 768)")
    embedding: List[float] = Field(..., description="Normalized float vector for Qdrant indexing/retrieval")
    device: str = Field(..., description="Hardware device used for inference (e.g. cuda or cpu)")


class ImageEmbeddingResponse(BaseModel):
    model: str = Field(..., description="SigLIP model identifier")
    dimensions: int = Field(..., description="Vector dimensionality (e.g. 768)")
    embedding: List[float] = Field(..., description="Normalized float vector for Qdrant indexing/retrieval")
    device: str = Field(..., description="Hardware device used for inference (e.g. cuda or cpu)")
