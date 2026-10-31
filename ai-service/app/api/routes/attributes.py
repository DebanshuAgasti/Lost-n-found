from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.schemas.attributes import AttributePreviewResponse
from app.services.attribute_service import AttributeService
from app.services.image_preprocessing import ImagePreprocessingService, ImagePreprocessingError
from app.utils.logging import get_logger

router = APIRouter(prefix="/v1/attributes", tags=["Attributes"])
logger = get_logger(__name__)

image_service = ImagePreprocessingService()
attribute_service = AttributeService()


@router.post(
    "/preview",
    response_model=AttributePreviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Preview item attributes using vision-language model",
)
async def preview_attributes(file: UploadFile = File(...)):
    """
    Reserved endpoint for upload-time image understanding.
    Decodes the uploaded image and extracts item attributes and captions using Florence-2.
    Returns HTTP 501 if model inference is not yet initialized.
    """
    try:
        data = await file.read()
        pil_image = image_service.decode_and_validate(data, content_type=file.content_type)
    except ImagePreprocessingError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"Failed to process uploaded image: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to decode image.")

    try:
        # Delegate to AttributeService (Florence-2 pipeline)
        return attribute_service.extract_attributes_preview(pil_image)
    except NotImplementedError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(e),
        )

