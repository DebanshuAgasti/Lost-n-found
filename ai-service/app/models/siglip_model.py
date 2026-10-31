"""
SigLIP model adapter for multimodal image and text embeddings.
Targets google/siglip-base-patch16-224 producing normalized float vectors
projected into the same shared metric space for Qdrant ANN search.
"""

import threading
from typing import Any, Dict, List, Optional, Tuple
from PIL import Image
import torch
import torch.nn.functional as F
from transformers import AutoModel, AutoProcessor

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class SigLIPOOMError(RuntimeError):
    """Raised when CUDA encounters an out-of-memory error during inference."""
    pass


class SigLIPModel:
    """
    Lazy-loading, thread-safe SigLIP model wrapper for dual-modality embeddings.
    Only loads model weights when explicitly invoked, and reuses the loaded instance.
    """

    def __init__(self, model_id: Optional[str] = None, device: Optional[str] = None):
        self.model_id = model_id or settings.siglip_model_id
        # Select device: use cuda if available and configured, else cpu
        if device is not None:
            self.device = device
        elif torch.cuda.is_available() and settings.device == "cuda":
            self.device = "cuda"
        else:
            self.device = "cpu"

        self._lock = threading.Lock()
        self._loaded = False
        self.processor: Optional[AutoProcessor] = None
        self.model: Optional[AutoModel] = None
        self._dimension: Optional[int] = None

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def dimension(self) -> int:
        if not self._loaded:
            self.load()
        return self._dimension or 768

    def _extract_pooled_tensor(self, raw_features: Any) -> torch.Tensor:
        """
        Extracts pooled tensor representation from BaseModelOutputWithPooling or Tensor.
        """
        if hasattr(raw_features, "pooler_output") and raw_features.pooler_output is not None:
            return raw_features.pooler_output
        elif isinstance(raw_features, torch.Tensor):
            return raw_features
        elif hasattr(raw_features, "last_hidden_state") and raw_features.last_hidden_state is not None:
            return raw_features.last_hidden_state[:, 0]
        elif isinstance(raw_features, (list, tuple)):
            return raw_features[0]
        return raw_features

    def load(self) -> None:
        """
        Thread-safe lazy loading of SigLIP model and processor using Hugging Face Transformers.
        Only executed once; subsequent calls return immediately.
        """
        if self._loaded:
            return

        with self._lock:
            if self._loaded:
                return

            logger.info(f"Lazy-loading SigLIP '{self.model_id}' on compute device '{self.device}'...")

            # Precision strategy: float16 on CUDA (fits comfortably in 4GB VRAM, ~411 MB allocated),
            # float32 on CPU for standard compatibility.
            dtype = torch.float16 if self.device == "cuda" else torch.float32

            # Try loading from local Hugging Face cache first to prevent blocking/hanging in restricted networks
            try:
                self.processor = AutoProcessor.from_pretrained(self.model_id, local_files_only=True)
            except Exception:
                logger.info(f"Local cache miss for processor '{self.model_id}', downloading...")
                self.processor = AutoProcessor.from_pretrained(self.model_id)

            try:
                self.model = AutoModel.from_pretrained(self.model_id, dtype=dtype, local_files_only=True)
            except Exception:
                logger.info(f"Local cache miss for model weights '{self.model_id}', downloading...")
                self.model = AutoModel.from_pretrained(self.model_id, dtype=dtype)

            self.model.to(self.device)
            self.model.eval()

            # Dynamically verify actual embedding dimension from model config instead of hardcoding
            if hasattr(self.model.config, "vision_config") and hasattr(self.model.config.vision_config, "hidden_size"):
                self._dimension = self.model.config.vision_config.hidden_size
            elif hasattr(self.model.config, "text_config") and hasattr(self.model.config.text_config, "hidden_size"):
                self._dimension = self.model.config.text_config.hidden_size
            else:
                self._dimension = 768

            self._loaded = True
            logger.info(
                f"SigLIP '{self.model_id}' loaded successfully on {self.device}. "
                f"Verified embedding dimension: {self._dimension}."
            )

    @torch.inference_mode()
    def embed_image(self, image: Image.Image) -> Tuple[List[float], int]:
        """
        Generates a normalized float embedding vector from a PIL Image.
        Returns: (embedding_vector, dimension)
        """
        self.load()

        try:
            inputs = self.processor(
                images=image.convert("RGB"),
                return_tensors="pt",
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            raw_features = self.model.get_image_features(**inputs)
            pooled_features = self._extract_pooled_tensor(raw_features)

            # Consistently normalize to unit sphere (L2 norm) using float32 precision
            normalized_features = F.normalize(pooled_features.float(), p=2, dim=-1)
            vector = normalized_features[0].cpu().tolist()

            actual_dim = len(vector)
            return vector, actual_dim

        except (torch.cuda.OutOfMemoryError, RuntimeError) as e:
            if "out of memory" in str(e).lower() or isinstance(e, torch.cuda.OutOfMemoryError):
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                logger.error(f"CUDA OutOfMemoryError encountered during image embedding: {e}")
                raise SigLIPOOMError("CUDA out of memory while computing image embedding.") from e
            raise

    @torch.inference_mode()
    def embed_text(self, text: str) -> Tuple[List[float], int]:
        """
        Generates a normalized float embedding vector from query text.
        Guarantees projection into the exact same vector space as embed_image.
        Returns: (embedding_vector, dimension)
        """
        self.load()

        try:
            # SigLIP standard text sequence length is 64 tokens with max_length padding
            inputs = self.processor(
                text=[text],
                padding="max_length",
                max_length=64,
                truncation=True,
                return_tensors="pt",
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            raw_features = self.model.get_text_features(**inputs)
            pooled_features = self._extract_pooled_tensor(raw_features)

            # Consistently normalize to unit sphere (L2 norm) using float32 precision
            normalized_features = F.normalize(pooled_features.float(), p=2, dim=-1)
            vector = normalized_features[0].cpu().tolist()

            actual_dim = len(vector)
            return vector, actual_dim

        except (torch.cuda.OutOfMemoryError, RuntimeError) as e:
            if "out of memory" in str(e).lower() or isinstance(e, torch.cuda.OutOfMemoryError):
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                logger.error(f"CUDA OutOfMemoryError encountered during text embedding: {e}")
                raise SigLIPOOMError("CUDA out of memory while computing text embedding.") from e
            raise

    @torch.inference_mode()
    def classify(self, image: Image.Image, labels: List[str]) -> List[Dict[str, Any]]:
        """
        Zero-shot image classification ranking using SigLIP image-text cosine similarity.
        Maintains backward compatibility for /v1/classify and /api/v1/extract.
        """
        self.load()

        if not labels or len(labels) > 100:
            raise ValueError("Provide between 1 and 100 labels")

        try:
            texts = [f"This is a photo of {label}." for label in labels]
            inputs = self.processor(
                text=texts,
                images=image.convert("RGB"),
                padding="max_length",
                max_length=64,
                truncation=True,
                return_tensors="pt",
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            outputs = self.model(**inputs)
            scores = outputs.logits_per_image[0].sigmoid().cpu().tolist()

            results = [
                {"label": label, "score": float(score)}
                for label, score in zip(labels, scores)
            ]
            return sorted(results, key=lambda item: item["score"], reverse=True)

        except (torch.cuda.OutOfMemoryError, RuntimeError) as e:
            if "out of memory" in str(e).lower() or isinstance(e, torch.cuda.OutOfMemoryError):
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                raise SigLIPOOMError("CUDA out of memory while running zero-shot classification.") from e
            raise
