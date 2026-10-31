from pydantic import BaseModel, Field
from typing import List, Optional

class BrandPrediction(BaseModel):
    value: str = Field(..., description="Detected brand name, or 'unknown'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")

class ImageQualityMetrics(BaseModel):
    sharpness: float = Field(..., ge=0.0, le=1.0, description="Normalized sharpness score (Laplacian variance)")
    visibility: float = Field(..., ge=0.0, le=1.0, description="Estimated visibility / lighting balance")
    is_usable: bool = Field(True, description="True if image meets minimum quality for reliable matching")

class ExtractionResponse(BaseModel):
    category: str = Field(..., description="Zero-shot predicted item category (e.g. backpack, electronics, keys)")
    color: str = Field(..., description="Predicted primary color")
    brand: BrandPrediction = Field(..., description="Brand prediction with confidence score")
    image_quality: ImageQualityMetrics = Field(..., description="Image sharpness and visibility heuristics")
    embedding: List[float] = Field(..., description="512-dimensional normalized float embedding vector")

class HealthResponse(BaseModel):
    status: str
    version: str
    device: str
    cuda_available: bool
    gpu_name: Optional[str] = None
    embedding_dimension: int
