# Image Matching & Python AI Service Pipeline

## 1. Do You Need to Train a Custom Model?

A common question in early-stage development is whether to train a bespoke deep learning model for Lost & Found items.

The initial architecture establishes a clear rule: **Start with strong pretrained open-source vision models and avoid custom training initially.**

| Capability | Custom Training Needed Initially? | Rationale & Initial Solution |
| :--- | :--- | :--- |
| **Common Object Categories** | **No** | Pretrained models (CLIP, SigLIP, Florence-2) categorize everyday objects (bags, phones, keys, wallets, jackets) zero-shot with high accuracy. |
| **Basic Color Extraction** | **No** | Color histogram analysis, K-Means clustering, or zero-shot color prompts easily identify primary and secondary colors. |
| **General Visual Similarity** | **No** | Pretrained 512-dim embedding spaces cluster visually similar shapes, textures, and items without retraining. |
| **Reading Visible Brand Text** | **Usually Not** | Modern vision-language models (VLMs) or lightweight OCR (PaddleOCR, Tesseract, Florence-2) extract visible text out-of-the-box. |
| **Recognizing Specific Brand Logos Reliably** | **Possibly Later** | Niche or partially obscured logos can be difficult zero-shot; evaluate on real data first before deciding on a logo detector. |
| **Identifying Exact Product Models** | **Possibly Later** | Distinguishing iPhone 14 vs 15 or specific laptop variants can be deferred until user scale justifies fine-tuning. |
| **Matching Two Photos of the Same Physical Object** | **May Benefit Later** | Two photos of the same lost item vary wildly due to lighting, angles, wear, or camera quality. Generic embeddings provide a baseline, but specialized metric learning / Siamese fine-tuning may help later. |

---

## 2. Python AI Service Architecture (FastAPI)

Instead of running mock hash generators or heavy ML inside the Java JVM, image understanding is encapsulated inside a dedicated **Python AI Microservice (`ai-service/`)**:

### Tech Stack
- **Framework**: FastAPI (async Python 3.11+, Uvicorn).
- **Vision Models**: Pretrained Hugging Face / OpenCLIP models (`open-clip-torch`, `transformers`, `torch`).
- **Quality Heuristics**: OpenCV Laplacian variance for blur/sharpness detection.

### Standardized Prediction Contract
When an image is submitted to `POST /api/v1/extract`, the service returns structured JSON:

```json
{
  "category": "backpack",
  "color": "black",
  "brand": {
    "value": "nike",
    "confidence": 0.85
  },
  "image_quality": {
    "sharpness": 0.78,
    "visibility": 0.85
  },
  "embedding": [
    0.0241,
    -0.0512,
    0.0189,
    "..."
  ]
}
```

---

## 3. Human-in-the-Loop Design Principles

1. **Editable & Optional AI Predictions**:
   - In the React frontend (when implemented), AI predictions are presented as **editable suggestions**, not rigid truths.
   - The user can review, confirm, or override the predicted brand, model, and color before submitting.

2. **Conservative Uncertainty Handling**:
   - When an image is blurry, dark, or low-resolution (`sharpness < 0.50` or low brand confidence), the AI service returns `"unknown"` rather than hallucinating a guess.

3. **Multi-Feature Fallback**:
   - Because real-world photos are noisy, the system never relies on image embeddings alone.
   - Visual similarity acts as a coarse filter in Qdrant (top 50 candidates), while Spring Boot's `MatchingEngine` applies the 6-D composite score (brand, model, scratches, stickers, geo proximity, and elapsed time).

---

## 4. Evaluation & Fine-Tuning Strategy

1. **Phase 1 (Zero-Shot Baseline)**: Deploy pretrained models (e.g. CLIP ViT-B/32 or Florence-2-base).
2. **Phase 2 (Realistic Evaluation)**: Benchmark against a curated dataset of real-world lost-and-found images (blurry photos, dim indoor lighting, angled shots).
3. **Phase 3 (Selective Fine-Tuning)**: Fine-tune only specific capabilities that demonstrably fail on real user submissions (e.g., distinguishing scratched/worn physical items or small brand logos).
