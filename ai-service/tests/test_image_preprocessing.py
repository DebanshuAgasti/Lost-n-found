import io
import unittest
from PIL import Image
from app.services.image_preprocessing import ImagePreprocessingService, ImagePreprocessingError


class TestImagePreprocessing(unittest.TestCase):
    def setUp(self):
        self.service = ImagePreprocessingService()

    def _generate_synthetic_image_bytes(self, fmt: str = "JPEG", size=(100, 100), color="red") -> bytes:
        img = Image.new("RGB", size, color=color)
        buf = io.BytesIO()
        img.save(buf, format=fmt)
        return buf.getvalue()

    def test_valid_jpeg_decoding(self):
        raw = self._generate_synthetic_image_bytes(fmt="JPEG", size=(120, 80))
        img = self.service.decode_and_validate(raw, content_type="image/jpeg")
        self.assertEqual(img.size, (120, 80))
        self.assertEqual(img.mode, "RGB")

    def test_valid_png_decoding(self):
        raw = self._generate_synthetic_image_bytes(fmt="PNG", size=(60, 60))
        img = self.service.decode_and_validate(raw, content_type="image/png")
        self.assertEqual(img.size, (60, 60))
        self.assertEqual(img.mode, "RGB")

    def test_unsupported_mime_type(self):
        raw = self._generate_synthetic_image_bytes(fmt="JPEG")
        with self.assertRaises(ImagePreprocessingError) as ctx:
            self.service.decode_and_validate(raw, content_type="image/gif")
        self.assertEqual(ctx.exception.status_code, 415)

    def test_empty_payload(self):
        with self.assertRaises(ImagePreprocessingError) as ctx:
            self.service.decode_and_validate(b"", content_type="image/jpeg")
        self.assertEqual(ctx.exception.status_code, 400)

    def test_corrupted_payload(self):
        corrupted = b"\xFF\xD8\xFF\xE0invalid_jpeg_data"
        with self.assertRaises(ImagePreprocessingError) as ctx:
            self.service.decode_and_validate(corrupted, content_type="image/jpeg")
        self.assertEqual(ctx.exception.status_code, 400)

    def test_max_bytes_exceeded(self):
        with self.assertRaises(ImagePreprocessingError) as ctx:
            self.service.validate_file_metadata("image/jpeg", 11 * 1024 * 1024)
        self.assertEqual(ctx.exception.status_code, 413)

    def test_quality_metrics_evaluation(self):
        img = Image.new("RGB", (200, 200), color="blue")
        sharpness, visibility, is_usable = self.service.evaluate_quality(img)
        self.assertTrue(0.0 <= sharpness <= 1.0)
        self.assertTrue(0.0 <= visibility <= 1.0)
        self.assertIsInstance(is_usable, bool)


if __name__ == "__main__":
    unittest.main()

