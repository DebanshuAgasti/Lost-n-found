"""
Dual-modality embedding service using Google SigLIP (google/siglip-base-patch16-224).
Provides normalized float vectors for both images and text descriptions,
projected into the exact same shared metric space for Qdrant ANN search.
"""

from typing import List, Optional, Tuple
from PIL import Image

from app.config import settings
from app.models.model_manager import get_model_manager
from app.utils.logging import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    def __init__(self, model_id: Optional[str] = None):
        self.model_id = model_id or settings.siglip_model_id
        self._model_manager = get_model_manager()

    def generate_image_embedding(self, image: Image.Image) -> Tuple[List[float], int, str]:
        """
        Generates normalized embedding vector from an uploaded item image.
        Returns: (embedding_vector, verified_dimensions, device)
        """
        siglip = self._model_manager.get_siglip()
        vector, dim = siglip.embed_image(image)

        if len(vector) != dim or dim <= 0:
            raise ValueError(f"Embedding dimension mismatch: expected positive dimension, got {len(vector)}")

        return vector, dim, siglip.device

    def generate_text_embedding(self, text: str) -> Tuple[List[float], int, str]:
        """
        Generates normalized embedding vector from a lost item query text description.
        Guarantees mathematical alignment with image embeddings from the same SigLIP checkpoint.
        Returns: (embedding_vector, verified_dimensions, device)
        """
        if not text or not text.strip():
            raise ValueError("Text payload cannot be empty")

        siglip = self._model_manager.get_siglip()
        vector, dim = siglip.embed_text(text.strip())

        if len(vector) != dim or dim <= 0:
            raise ValueError(f"Embedding dimension mismatch: expected positive dimension, got {len(vector)}")

        return vector, dim, siglip.device
