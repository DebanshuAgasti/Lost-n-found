"""
Attribute extraction service for Lost & Found items using vision-language models (e.g. Florence-2).
"""

from typing import Optional
from PIL import Image
from app.config import settings
from app.schemas.attributes import AttributePreviewResponse
from app.utils.logging import get_logger

logger = get_logger(__name__)


class AttributeService:
    def __init__(self, model_id: Optional[str] = None):
        self.model_id = model_id or settings.florence_model_id
        self._model = None
        self._processor = None

    # TODO: Implement lazy-loading of Florence-2 checkpoint (microsoft/Florence-2-base)
    # in conjunction with ModelManager. Model weights MUST NOT be loaded at import time
    # or eagerly on startup, and must be downloaded to settings.model_cache_dir only when
    # explicitly invoked.
    def extract_attributes_preview(self, image: Image.Image) -> AttributePreviewResponse:
        """
        Extracts structured attributes and captions from an uploaded item image.
        Raises NotImplementedError until Florence-2 weights and prompt pipelines are wired.
        """
        # TODO: Wire prompt '<MORE_DETAILED_CAPTION>' or '<OD>' with Florence-2 processor.
        # Ensure 'einops' is available before attempting tensor execution.
        raise NotImplementedError(
            f"Visual attribute extraction with model '{self.model_id}' is not yet initialized. "
            "Model inference is planned for a later integration phase."
        )

