from .health import router as health_router
from .attributes import router as attributes_router
from .embeddings import router as embeddings_router

__all__ = ["health_router", "attributes_router", "embeddings_router"]

