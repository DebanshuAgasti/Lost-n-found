from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import settings
from app.models.siglip_model import SigLIPOOMError
from app.schemas.embeddings import ImageEmbeddingResponse, TextEmbeddingRequest, TextEmbeddingResponse
from app.services.embedding_service import EmbeddingService
from app.services.image_preprocessing import ImagePreprocessingError, ImagePreprocessingService
from app.utils.logging import get_logger

router = APIRouter(prefix="/v1/embeddings", tags=["Embeddings"])
logger = get_logger(__name__)

image_service = ImagePreprocessingService()
embedding_service = EmbeddingService()


@router.post(
    "/image",
    response_model=ImageEmbeddingResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate SigLIP image embedding for cross-modal retrieval",
)
async def generate_image_embedding(file: UploadFile = File(...)):
    """
    Generates a normalized float vector from an uploaded found-item image using Google SigLIP.
    Vector dimensionality and device used are dynamically reported.
    """
    try:
        data = await file.read()
        pil_image = image_service.decode_and_validate(data, content_type=file.content_type)
    except ImagePreprocessingError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"Image decode error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to decode image.")

    try:
        vector, dim, device = embedding_service.generate_image_embedding(pil_image)
        return ImageEmbeddingResponse(
            model=settings.siglip_model_id,
            dimensions=dim,
            embedding=vector,
            device=device,
        )
    except SigLIPOOMError as e:
        logger.error(f"OOM during image embedding: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GPU memory limit reached during image embedding. Please retry shortly.",
        )
    except NotImplementedError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected image embedding failure: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Image embedding failed: {e}")


@router.post(
    "/text",
    response_model=TextEmbeddingResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate SigLIP text embedding for cross-modal retrieval",
)
async def generate_text_embedding(payload: TextEmbeddingRequest):
    """
    Generates a normalized float vector from a lost-item text description using Google SigLIP.
    Cross-modal invariant: Projections share the same metric space as image embeddings.
    """
    status_422 = getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", status.HTTP_422_UNPROCESSABLE_ENTITY)
    cleaned_text = payload.text.strip() if payload.text else ""
    if not cleaned_text:
        raise HTTPException(
            status_code=status_422,
            detail="Text query cannot be empty or whitespace.",
        )

    try:
        vector, dim, device = embedding_service.generate_text_embedding(cleaned_text)
        return TextEmbeddingResponse(
            model=settings.siglip_model_id,
            dimensions=dim,
            embedding=vector,
            device=device,
        )
    except SigLIPOOMError as e:
        logger.error(f"OOM during text embedding: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GPU memory limit reached during text embedding. Please retry shortly.",
        )
    except NotImplementedError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected text embedding failure: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Text embedding failed: {e}")
