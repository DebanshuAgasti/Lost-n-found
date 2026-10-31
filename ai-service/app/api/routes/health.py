import importlib
import sys
from typing import Any, Dict
from fastapi import APIRouter, status
import torch
from app.config import settings
from app.services.qdrant_service import QdrantService

router = APIRouter(tags=["Health"])

qdrant_service = QdrantService()

REQUIRED_IMPORTS = [
    "fastapi",
    "torch",
    "torchvision",
    "transformers",
    "PIL",
    "cv2",
    "numpy",
]


@router.get("/health", status_code=status.HTTP_200_OK)
def get_health() -> Dict[str, Any]:
    """
    Returns service health status and safe runtime information.
    Does not allocate GPU tensors or download checkpoints.
    """
    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU"
    cuda_version = getattr(torch.version, "cuda", None) if cuda_available else None

    # Safe Qdrant connectivity probe (cleanly reports unavailable if offline)
    qdrant_status = qdrant_service.health_check()

    return {
        "status": "ok",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
        "python_version": sys.version.splitlines()[0],
        "torch_version": torch.__version__,
        "device": settings.device,
        "cuda": {
            "available": cuda_available,
            "version": cuda_version,
            "device_name": device_name,
        },
        "qdrant": qdrant_status,
        "models": {
            "siglip": settings.siglip_model_id,
            "florence": settings.florence_model_id,
        },
    }


@router.get("/health/ready", status_code=status.HTTP_200_OK)
def get_readiness() -> Dict[str, Any]:
    """
    Checks that all required Python dependencies are present and importable,
    without executing heavy model weight loading or GPU allocations.
    """
    missing = []
    for module_name in REQUIRED_IMPORTS:
        try:
            importlib.import_module(module_name)
        except Exception as e:
            missing.append({"module": module_name, "error": str(e)})

    if missing:
        return {
            "status": "unhealthy",
            "ready": False,
            "missing_dependencies": missing,
        }

    return {
        "status": "ready",
        "ready": True,
        "checked_modules": REQUIRED_IMPORTS,
    }

