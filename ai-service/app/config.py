import os
from typing import List
from pydantic_settings import BaseSettings
import torch

class Settings(BaseSettings):
    app_name: str = "Lost & Found AI Vision Service"
    app_version: str = "1.0.0"
    app_env: str = "development"
    host: str = "127.0.0.1"
    port: int = 8000

    # Vector database
    qdrant_url: str = "http://localhost:6333"

    # Model identifiers & local cache
    model_cache_dir: str = "./models/cache"
    siglip_model_id: str = "google/siglip-base-patch16-224"
    florence_model_id: str = "microsoft/Florence-2-base"

    # Backward compatibility / legacy fields
    clip_model_name: str = "ViT-B-32"
    clip_pretrained: str = "laion2b_s34b_b79k"

    # Preferred device: auto-detect CUDA, fallback to CPU
    device: str = "cuda" if torch.cuda.is_available() else "cpu"

    # Image quality heuristics
    sharpness_threshold: float = 100.0

    # CORS
    cors_origins: List[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
