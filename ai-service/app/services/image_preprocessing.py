import io
from typing import Optional, Tuple
import cv2
import numpy as np
from PIL import Image, ImageFile, UnidentifiedImageError

ImageFile.LOAD_TRUNCATED_IMAGES = False

MAX_BYTES: int = 10 * 1024 * 1024       # 10 MB limit
MAX_PIXELS: int = 20_000_000            # 20 Megapixel safety limit
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


class ImagePreprocessingError(ValueError):
    """Base exception for image validation and processing failures."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class ImagePreprocessingService:
    def __init__(self, sharpness_threshold: float = 80.0):
        self.sharpness_threshold = sharpness_threshold

    def validate_file_metadata(self, content_type: Optional[str], size: int) -> None:
        if content_type and content_type.lower() not in ALLOWED_TYPES:
            raise ImagePreprocessingError(
                f"Unsupported image type '{content_type}'. Allowed: JPEG, PNG, WebP",
                status_code=415,
            )
        if size > MAX_BYTES:
            raise ImagePreprocessingError(
                f"Image size exceeds maximum limit of 10 MB ({size} bytes received)",
                status_code=413,
            )
        if size == 0:
            raise ImagePreprocessingError("Empty image payload received", status_code=400)

    def decode_and_validate(self, data: bytes, content_type: Optional[str] = None) -> Image.Image:
        """
        Validates byte length, content type, decodes safely, checks dimensions,
        and converts to RGB.
        """
        self.validate_file_metadata(content_type, len(data))

        try:
            with Image.open(io.BytesIO(data)) as img:
                total_pixels = img.width * img.height
                if total_pixels > MAX_PIXELS:
                    raise ImagePreprocessingError(
                        f"Image dimensions ({img.width}x{img.height} = {total_pixels} px) exceed 20 MP limit",
                        status_code=413,
                    )
                img.load()
                return img.convert("RGB")
        except ImagePreprocessingError:
            raise
        except (UnidentifiedImageError, OSError, ValueError) as e:
            raise ImagePreprocessingError(f"Corrupted or invalid image data: {e}", status_code=400)

    def evaluate_quality(self, pil_image: Image.Image) -> Tuple[float, float, bool]:
        """
        Calculates sharpness via Laplacian variance and visibility via luminosity distribution.
        Returns: (sharpness [0.0 - 1.0], visibility [0.0 - 1.0], is_usable [bool])
        """
        rgb_arr = np.array(pil_image.convert("RGB"))
        gray = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2GRAY)

        # 1. Laplacian variance for sharpness
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        normalized_sharpness = float(min(1.0, max(0.0, laplacian_var / (laplacian_var + 150.0))))

        # 2. Visibility / Lighting balance
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

        return normalized_sharpness, visibility, is_usable

