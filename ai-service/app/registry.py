from app.models.siglip import SigLIPService

class ModelRegistry:
    def __init__(self):
        self._siglip = None
        self._ocr = None
        self._grounding_dino = None

    @property
    def siglip(self) -> SigLIPService:
        if self._siglip is None:
            self._siglip = SigLIPService()
        return self._siglip

    @property
    def ocr(self):
        if self._ocr is None:
            from app.models.ocr import OCRService
            self._ocr = OCRService()
        return self._ocr

    @property
    def grounding_dino(self):
        if self._grounding_dino is None:
            from app.models.grounding_dino import GroundingDINOService
            self._grounding_dino = GroundingDINOService()
        return self._grounding_dino

_registry = ModelRegistry()

def get_registry() -> ModelRegistry:
    return _registry
