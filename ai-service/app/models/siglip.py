"""
SigLIPService backward compatibility wrapper.
Delegates directly to the unified SigLIPModel managed by ModelManager.
"""

from typing import Any, Dict, List, Optional
from PIL import Image
from app.models.model_manager import get_model_manager


class SigLIPService:
    def __init__(self, model_id: Optional[str] = None):
        self._model = get_model_manager().get_siglip()
        if model_id and model_id != self._model.model_id:
            from app.models.siglip_model import SigLIPModel
            self._model = SigLIPModel(model_id=model_id, device=get_model_manager().device)

    @property
    def model_id(self) -> str:
        return self._model.model_id

    @property
    def device(self) -> str:
        return self._model.device

    def embed(self, image: Image.Image) -> List[float]:
        vector, _ = self._model.embed_image(image)
        return vector

    def classify(self, image: Image.Image, labels: List[str]) -> List[Dict[str, Any]]:
        return self._model.classify(image, labels)
