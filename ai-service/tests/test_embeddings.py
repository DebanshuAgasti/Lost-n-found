import io
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.models.siglip_model import SigLIPOOMError


class TestEmbeddingEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def _create_sample_jpeg_bytes(self) -> bytes:
        img = Image.new("RGB", (64, 64), color="blue")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    @patch("app.api.routes.embeddings.embedding_service.generate_image_embedding")
    def test_image_embedding_success(self, mock_embed):
        # Mock 768-dim normalized embedding
        fake_vector = [0.03] * 768
        mock_embed.return_value = (fake_vector, 768, "cuda")

        img_bytes = self._create_sample_jpeg_bytes()
        response = self.client.post(
            "/v1/embeddings/image",
            files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["dimensions"], 768)
        self.assertEqual(len(data["embedding"]), 768)
        self.assertEqual(data["model"], "google/siglip-base-patch16-224")
        self.assertEqual(data["device"], "cuda")
        mock_embed.assert_called_once()

    @patch("app.api.routes.embeddings.embedding_service.generate_text_embedding")
    def test_text_embedding_success(self, mock_embed):
        # Mock 768-dim normalized embedding
        fake_vector = [0.02] * 768
        mock_embed.return_value = (fake_vector, 768, "cuda")

        response = self.client.post(
            "/v1/embeddings/text",
            json={"text": "Lost navy blue Herschel backpack with silver zipper"},
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["dimensions"], 768)
        self.assertEqual(len(data["embedding"]), 768)
        self.assertEqual(data["model"], "google/siglip-base-patch16-224")
        self.assertEqual(data["device"], "cuda")
        mock_embed.assert_called_once_with("Lost navy blue Herschel backpack with silver zipper")

    def test_text_embedding_empty_payload(self):
        response = self.client.post(
            "/v1/embeddings/text",
            json={"text": ""},
        )
        self.assertEqual(response.status_code, 422)

    def test_text_embedding_whitespace_only(self):
        response = self.client.post(
            "/v1/embeddings/text",
            json={"text": "     "},
        )
        self.assertEqual(response.status_code, 422)

    def test_image_embedding_unsupported_mime(self):
        img_bytes = self._create_sample_jpeg_bytes()
        response = self.client.post(
            "/v1/embeddings/image",
            files={"file": ("test.gif", img_bytes, "image/gif")},
        )
        self.assertEqual(response.status_code, 415)

    def test_image_embedding_corrupted_bytes(self):
        corrupted = b"\xFF\xD8\xFF\xE0invalid_payload"
        response = self.client.post(
            "/v1/embeddings/image",
            files={"file": ("test.jpg", corrupted, "image/jpeg")},
        )
        self.assertEqual(response.status_code, 400)

    @patch("app.api.routes.embeddings.embedding_service.generate_image_embedding")
    def test_image_embedding_cuda_oom_handling(self, mock_embed):
        mock_embed.side_effect = SigLIPOOMError("CUDA out of memory")

        img_bytes = self._create_sample_jpeg_bytes()
        response = self.client.post(
            "/v1/embeddings/image",
            files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        )
        self.assertEqual(response.status_code, 503)
        self.assertIn("GPU memory limit reached", response.json()["detail"])

    @patch("app.api.routes.embeddings.embedding_service.generate_text_embedding")
    def test_text_embedding_cuda_oom_handling(self, mock_embed):
        mock_embed.side_effect = SigLIPOOMError("CUDA out of memory")

        response = self.client.post(
            "/v1/embeddings/text",
            json={"text": "Lost red umbrella"},
        )
        self.assertEqual(response.status_code, 503)
        self.assertIn("GPU memory limit reached", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()

