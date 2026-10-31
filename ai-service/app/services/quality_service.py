import cv2
import numpy as np
from PIL import Image
from app.schemas import ImageQualityMetrics

class ImageQualityService:
    def __init__(self, sharpness_threshold: float = 80.0):
        self.sharpness_threshold = sharpness_threshold

    def evaluate_quality(self, pil_image: Image.Image) -> ImageQualityMetrics:
        """
        Analyzes sharpness using Laplacian variance and visibility using grayscale luminosity distribution.
        """
        # Convert PIL to OpenCV grayscale
        rgb_arr = np.array(pil_image.convert("RGB"))
        gray = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2GRAY)

        # 1. Laplacian variance for sharpness
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        # Normalize sharpness to [0.0, 1.0] using a smooth sigmoid-like transfer
        # 100+ is generally considered sharp for web photos
        normalized_sharpness = float(min(1.0, max(0.0, laplacian_var / (laplacian_var + 150.0))))

        # 2. Visibility / Lighting balance
        # Check mean brightness (under-exposed < 40, over-exposed > 220)
        mean_brightness = float(np.mean(gray))
        if mean_brightness < 40.0:
            visibility = max(0.1, mean_brightness / 40.0 * 0.5)
        elif mean_brightness > 220.0:
            visibility = max(0.1, (255.0 - mean_brightness) / 35.0 * 0.5)
        else:
            visibility = 0.85 + 0.15 * (1.0 - abs(mean_brightness - 128.0) / 128.0)

        visibility = float(round(min(1.0, max(0.0, visibility)), 2))
        normalized_sharpness = float(round(normalized_sharpness, 2))

        is_usable = (normalized_sharpness >= 0.35) and (visibility >= 0.30)

        return ImageQualityMetrics(
            sharpness=normalized_sharpness,
            visibility=visibility,
            is_usable=is_usable
        )
