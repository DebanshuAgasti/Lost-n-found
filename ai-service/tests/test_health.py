import io
import unittest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app


class TestHealthEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def _create_sample_jpeg_bytes(self) -> bytes:
        img = Image.new("RGB", (64, 64), color="blue")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertIn("app_name", data)
        self.assertIn("version", data)
        self.assertIn("environment", data)
        self.assertIn("cuda", data)
        self.assertIn("qdrant", data)
        self.assertIn("models", data)

    def test_readiness_endpoint(self):
        response = self.client.get("/health/ready")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ready")
        self.assertTrue(data.get("ready"))
        self.assertIsInstance(data.get("checked_modules"), list)

    def test_attributes_preview_reserved_returns_501(self):
        img_bytes = self._create_sample_jpeg_bytes()
        response = self.client.post(
            "/v1/attributes/preview",
            files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        )
        self.assertEqual(response.status_code, 501)
        self.assertIn("not yet initialized", response.json().get("detail", ""))


if __name__ == "__main__":
    unittest.main()
