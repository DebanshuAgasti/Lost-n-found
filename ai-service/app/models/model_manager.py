"""
Model Manager for managing AI model lifecycles and devices.
Ensures models are only loaded on demand (lazy loading) rather than on import or application startup.
Guarantees Florence-2 and SigLIP are never loaded simultaneously to conserve the 4 GB VRAM budget.
"""

from typing import Optional
import torch
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class ModelManager:
    def __init__(self):
        self._device = "cuda" if torch.cuda.is_available() and settings.device == "cuda" else "cpu"
        self._siglip = None
        self._florence = None
        logger.info(f"ModelManager initialized. Target compute device: {self._device}")

    @property
    def device(self) -> str:
        return self._device

    def get_siglip(self):
        """
        Returns singleton SigLIPModel instance.
        Lazy-loads model weights on first inference request.
        """
        if self._siglip is None:
            # Enforce 4GB VRAM constraint: do not load Florence-2 simultaneously
            if self._florence is not None and getattr(self._florence, "is_loaded", False):
                logger.warning("Unloading Florence-2 before initializing SigLIP to preserve VRAM.")
                self._florence = None
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

            from app.models.siglip_model import SigLIPModel
            self._siglip = SigLIPModel(model_id=settings.siglip_model_id, device=self._device)
        return self._siglip

    def get_florence(self):
        """
        Florence-2 placeholder. Reserved for future visual attribute pipeline.
        Not loaded in the current phase.
        """
        if self._florence is None:
            # Enforce VRAM constraint
            if self._siglip is not None and getattr(self._siglip, "is_loaded", False):
                logger.warning("Unloading SigLIP before initializing Florence-2 to preserve VRAM.")
                self._siglip = None
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()

            from app.models.florence_model import FlorenceModel
            self._florence = FlorenceModel(model_id=settings.florence_model_id, device=self._device)
        return self._florence


_model_manager = ModelManager()


def get_model_manager() -> ModelManager:
    return _model_manager
