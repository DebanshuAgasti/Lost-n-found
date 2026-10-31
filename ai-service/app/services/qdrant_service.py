"""
Qdrant vector database integration service for L&F item retrieval.

ARCHITECTURAL PRINCIPLE:
Cross-modal search in Lost & Found relies on projecting both found-item images
and lost-item text descriptions into the EXACT same 768-dimensional metric space
governed by Google SigLIP (google/siglip-base-patch16-224).
Any mismatch in model checkpoints, normalizations, or dimensions between image vectors
and text query vectors will result in degraded or invalid similarity ranking in Qdrant.
"""

from typing import Any, Dict, Optional
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class QdrantService:
    """
    Client factory and health-check abstraction for Qdrant vector database.
    Does not assume Qdrant is running or that Docker containers exist.
    """

    def __init__(self, url: Optional[str] = None):
        self.url = url or settings.qdrant_url
        self._client = None

    def get_client(self):
        """
        Lazily creates and returns a QdrantClient instance.
        Gracefully handles missing 'qdrant-client' package.
        """
        if self._client is None:
            try:
                from qdrant_client import QdrantClient
                self._client = QdrantClient(url=self.url, timeout=3.0, check_compatibility=False)
            except ImportError:
                logger.warning("qdrant-client package is not installed.")
                return None
            except Exception as e:
                logger.warning(f"Failed to connect to Qdrant at {self.url}: {e}")
                return None
        return self._client

    def health_check(self) -> Dict[str, Any]:
        """
        Checks connectivity to Qdrant without creating collections or altering state.
        Reports status cleanly as 'connected', 'unreachable', or 'client_not_installed'.
        """
        try:
            import qdrant_client  # noqa: F401
        except ImportError:
            return {
                "status": "client_not_installed",
                "available": False,
                "url": self.url,
                "detail": "qdrant-client distribution is not installed in the active environment",
            }

        client = self.get_client()
        if client is None:
            return {
                "status": "unreachable",
                "available": False,
                "url": self.url,
                "detail": "Could not establish connection to Qdrant service",
            }

        try:
            # Query server cluster status or collections list to verify health
            collections = client.get_collections()
            return {
                "status": "connected",
                "available": True,
                "url": self.url,
                "collections_count": len(collections.collections),
            }
        except Exception as e:
            return {
                "status": "unreachable",
                "available": False,
                "url": self.url,
                "detail": str(e),
            }

