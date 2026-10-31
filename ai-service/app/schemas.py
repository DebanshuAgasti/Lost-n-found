from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EmbeddingResponse(BaseModel):
    model: str = Field(..., description="Model identifier used for embedding")
    dimensions: int = Field(..., description="Embedding dimension")
    embedding: List[float] = Field(..., description="Normalized vector embedding")

class CategoryResult(BaseModel):
    label: str = Field(..., description="Class label")
    score: float = Field(..., description="Classification score (sigmoid)")

class ClassificationResponse(BaseModel):
    model: str = Field(..., description="Model identifier")
    results: List[CategoryResult] = Field(..., description="Ranked category results")

class OCRResult(BaseModel):
    text: str = Field(..., description="Extracted text")
    confidence: float = Field(..., description="OCR recognition confidence")

class OCRResponse(BaseModel):
    model: str = "paddleocr"
    text: List[OCRResult]

class DetectionResult(BaseModel):
    label: str
    confidence: float
    box: List[float]

class DetectionResponse(BaseModel):
    model: str = "grounding-dino"
    objects: List[DetectionResult]

class MultiTaskResponse(BaseModel):
    embedding: Optional[EmbeddingResponse] = None
    classification: Optional[List[CategoryResult]] = None
    ocr: Optional[List[OCRResult]] = None
    detections: Optional[List[DetectionResult]] = None

# Backward compatibility contract for Spring Boot backend
class BrandPrediction(BaseModel):
    value: str
    confidence: float

class ImageQualityMetrics(BaseModel):
    sharpness: float
    visibility: float
    is_usable: bool

class ExtractionResponse(BaseModel):
    category: str
    color: str
    brand: BrandPrediction
    image_quality: ImageQualityMetrics
    embedding: List[float]
