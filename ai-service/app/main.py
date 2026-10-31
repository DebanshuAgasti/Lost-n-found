import io
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from app.api.routes.attributes import router as attributes_router
from app.api.routes.embeddings import router as embeddings_router
from app.api.routes.health import router as health_router
from app.config import settings
from app.registry import get_registry
from app.schemas import (
    BrandPrediction,
    CategoryResult,
    ClassificationResponse,
    DetectionResponse,
    EmbeddingResponse,
    ExtractionResponse,
    ImageQualityMetrics,
    MultiTaskResponse,
    OCRResponse,
    OCRResult,
)
from app.services.image_preprocessing import ImagePreprocessingError, ImagePreprocessingService
from app.services.quality_service import ImageQualityService
from app.utils.logging import configure_logging, get_logger

configure_logging()
logger = get_logger("ai-service")

# Services
image_preprocessing_service = ImagePreprocessingService()
quality_service = ImageQualityService()

# Common categories and colors for zero-shot classification
DEFAULT_LABELS = [
    "backpack", "wallet", "mobile phone", "laptop",
    "water bottle", "keys", "headphones", "watch",
    "handbag", "book", "umbrella", "other personal item"
]

DEFAULT_COLORS = [
    "black", "white", "silver", "grey", "blue",
    "red", "green", "yellow", "brown", "orange", "purple", "pink"
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup model registry without loading heavy model checkpoints eagerly
    app.state.registry = get_registry()
    logger.info("Application initialized. Model checkpoints deferred to lazy demand.")
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Python inference service for Lost & Found item image embedding, classification, and attribute extraction using SigLIP and Florence-2.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount primary modular routers
app.include_router(health_router)
app.include_router(attributes_router)
app.include_router(embeddings_router)


# Helper for legacy endpoints
async def parse_upload(file: UploadFile) -> Image.Image:
    try:
        data = await file.read()
        return image_preprocessing_service.decode_and_validate(data, content_type=file.content_type)
    except ImagePreprocessingError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image decoding failed: {e}")


# Legacy & Multi-task endpoints preserved for backward compatibility
@app.get("/v1/models", tags=["Models"])
def models():
    return {
        "available": ["siglip", "florence-2"],
        "planned": ["ocr", "grounding-dino"],
    }


@app.post("/v1/embeddings", response_model=EmbeddingResponse, tags=["Embeddings (Legacy)"])
async def embeddings(file: UploadFile = File(...)):
    image = await parse_upload(file)
    model = app.state.registry.siglip
    vector = model.embed(image)

    return {
        "model": model.model_id,
        "dimensions": len(vector),
        "embedding": vector,
    }


@app.post("/v1/classify", response_model=ClassificationResponse, tags=["Classification (Legacy)"])
async def classify(file: UploadFile = File(...)):
    image = await parse_upload(file)
    results = app.state.registry.siglip.classify(image, DEFAULT_LABELS)

    return {
        "model": app.state.registry.siglip.model_id,
        "results": results,
    }


@app.post("/v1/ocr", tags=["OCR (Scaffold)"])
async def ocr(file: UploadFile = File(...)):
    image = await parse_upload(file)
    try:
        result = app.state.registry.ocr.extract(image)
        return {"model": "paddleocr", "text": result}
    except NotImplementedError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))


@app.post("/v1/detect", tags=["Detection (Scaffold)"])
async def detect(
    file: UploadFile = File(...),
    prompt: str = Form(..., min_length=1, max_length=300),
):
    image = await parse_upload(file)
    try:
        result = app.state.registry.grounding_dino.detect(image, prompt)
        return {"model": "grounding-dino", "objects": result}
    except NotImplementedError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))


@app.post("/v1/analyze", response_model=MultiTaskResponse, tags=["Orchestration (Legacy)"])
async def analyze(
    file: UploadFile = File(...),
    tasks: str = Form("embedding,classification", description="Comma-separated tasks: embedding,classification,ocr,detect"),
    prompt: Optional[str] = Form(None, description="Detection prompt if detect task is requested"),
):
    requested_tasks = {t.strip().lower() for t in tasks.split(",")}
    image = await parse_upload(file)
    response = MultiTaskResponse()

    if "embedding" in requested_tasks:
        vector = app.state.registry.siglip.embed(image)
        response.embedding = EmbeddingResponse(
            model=app.state.registry.siglip.model_id,
            dimensions=len(vector),
            embedding=vector,
        )

    if "classification" in requested_tasks:
        results = app.state.registry.siglip.classify(image, DEFAULT_LABELS)
        response.classification = [CategoryResult(**r) for r in results]

    if "ocr" in requested_tasks:
        try:
            ocr_results = app.state.registry.ocr.extract(image)
            response.ocr = [OCRResult(**r) for r in ocr_results]
        except NotImplementedError:
            response.ocr = []

    if "detect" in requested_tasks:
        if prompt:
            try:
                detections = app.state.registry.grounding_dino.detect(image, prompt)
                response.detections = detections
            except NotImplementedError:
                response.detections = []

    return response


# Backward compatibility endpoint for Spring Boot backend contract
@app.post("/api/v1/extract", response_model=ExtractionResponse, tags=["Backend Integration"])
async def extract(image: UploadFile = File(...)):
    pil_image = await parse_upload(image)
    quality = quality_service.evaluate_quality(pil_image)

    # SigLIP category ranking
    cat_results = app.state.registry.siglip.classify(pil_image, DEFAULT_LABELS)
    top_cat = cat_results[0]["label"] if cat_results else "other personal item"

    # SigLIP color ranking
    color_results = app.state.registry.siglip.classify(pil_image, DEFAULT_COLORS)
    top_color = color_results[0]["label"] if color_results else "black"

    # 768-dim normalized embedding
    vector = app.state.registry.siglip.embed(pil_image)

    return ExtractionResponse(
        category=top_cat,
        color=top_color,
        brand=BrandPrediction(value="unknown", confidence=0.5),
        image_quality=quality,
        embedding=vector,
    )
