import torch
from PIL import Image
from typing import List, Tuple
import open_clip
from app.config import settings
from app.models.schemas import BrandPrediction

# Standard Lost & Found candidate categories
CANDIDATE_CATEGORIES = [
    "backpack",
    "handbag",
    "wallet",
    "smartphone",
    "laptop",
    "headphones",
    "keys",
    "water bottle",
    "jacket",
    "watch",
    "glasses",
    "umbrella",
    "book",
    "credit card",
    "id card",
    "other item"
]

CANDIDATE_COLORS = [
    "black",
    "white",
    "silver",
    "grey",
    "blue",
    "navy",
    "red",
    "green",
    "yellow",
    "brown",
    "orange",
    "purple",
    "pink",
    "beige"
]

CANDIDATE_BRANDS = [
    "apple",
    "samsung",
    "sony",
    "nike",
    "adidas",
    "dell",
    "hp",
    "lenovo",
    "bose",
    "jbl",
    "north face",
    "fossil",
    "casio",
    "stanley",
    "yeti",
    "ray-ban",
    "unknown"
]

class VisionInferenceService:
    def __init__(self):
        self.device = torch.device(settings.device if torch.cuda.is_available() and settings.device == "cuda" else "cpu")
        print(f"[VisionService] Loading OpenCLIP {settings.clip_model_name} ({settings.clip_pretrained}) on {self.device}...")
        
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            settings.clip_model_name,
            pretrained=settings.clip_pretrained,
            device=self.device
        )
        self.model.eval()
        self.tokenizer = open_clip.get_tokenizer(settings.clip_model_name)
        
        # Precompute zero-shot text features for fast inference
        self._category_tokens = self.tokenizer([f"a photo of a {cat}" for cat in CANDIDATE_CATEGORIES]).to(self.device)
        self._color_tokens = self.tokenizer([f"a photo of a {c} object" for c in CANDIDATE_COLORS]).to(self.device)
        self._brand_tokens = self.tokenizer([f"a product made by {b}" for b in CANDIDATE_BRANDS]).to(self.device)
        
        with torch.no_grad():
            self._category_embeddings = self._encode_text_normalized(self._category_tokens)
            self._color_embeddings = self._encode_text_normalized(self._color_tokens)
            self._brand_embeddings = self._encode_text_normalized(self._brand_tokens)

        print(f"[VisionService] Loaded successfully. Embedding dim: {self.model.visual.output_dim}")

    def _encode_text_normalized(self, tokens: torch.Tensor) -> torch.Tensor:
        text_features = self.model.encode_text(tokens)
        text_features /= text_features.norm(dim=-1, keepdim=True)
        return text_features

    def extract_all(self, pil_image: Image.Image) -> Tuple[str, str, BrandPrediction, List[float]]:
        """
        Extracts 512-dim embedding, zero-shot category, zero-shot color, and brand prediction.
        """
        image_input = self.preprocess(pil_image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            image_features = self.model.encode_image(image_input)
            image_features /= image_features.norm(dim=-1, keepdim=True)

            # Cosine similarities
            cat_logits = (100.0 * image_features @ self._category_embeddings.T).softmax(dim=-1)[0]
            color_logits = (100.0 * image_features @ self._color_embeddings.T).softmax(dim=-1)[0]
            brand_logits = (100.0 * image_features @ self._brand_embeddings.T).softmax(dim=-1)[0]

        # Top Category
        top_cat_idx = int(torch.argmax(cat_logits).item())
        predicted_category = CANDIDATE_CATEGORIES[top_cat_idx]

        # Top Color
        top_color_idx = int(torch.argmax(color_logits).item())
        predicted_color = CANDIDATE_COLORS[top_color_idx]

        # Top Brand
        top_brand_idx = int(torch.argmax(brand_logits).item())
        brand_name = CANDIDATE_BRANDS[top_brand_idx]
        brand_conf = float(round(brand_logits[top_brand_idx].item(), 3))

        # If brand confidence is low (< 0.40), mark as unknown
        if brand_name == "unknown" or brand_conf < 0.40:
            brand_pred = BrandPrediction(value="unknown", confidence=round(1.0 - brand_conf, 2))
        else:
            brand_pred = BrandPrediction(value=brand_name, confidence=brand_conf)

        # 512-dim normalized embedding
        embedding = image_features.cpu().numpy()[0].tolist()

        return predicted_category, predicted_color, brand_pred, embedding
