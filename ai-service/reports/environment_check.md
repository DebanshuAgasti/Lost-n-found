# L&F AI Service — Environment & Architecture Verification Report

**Date**: 2026-10-31  
**Project**: Lost & Found Platform AI Inference Microservice (`ai-service`)  

---

## 1. Project Root & Virtual Environment

- **Project Root**: `<PROJECT_ROOT>/ai-service`
- **Virtual Environment Path**: `<PROJECT_ROOT>/ai-service/.venv`
- **Python Interpreter**: `<PROJECT_ROOT>/ai-service/.venv/Scripts/python.exe`
- **Python Version**: `3.12.15 (main, Oct 1 2026, 21:00:48) [MSC v.1944 64 bit (AMD64)]`
- **Host OS & Architecture**: `Windows 11 (AMD64), 64-bit`
- **Environment Manager**: Created originally via `uv 0.12.22` without `pip` seed package.

---

## 2. Created & Organized Structure

The required modular architecture has been scaffolded and integrated with existing files preserved:

```text
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py                     [UPDATED: lazy startup lifespan, mounted routers, legacy preserved]
│   ├── config.py                   [UPDATED: safe defaults, Qdrant URL, Florence & SigLIP IDs]
│   ├── api/
│   │   ├── __init__.py             [CREATED]
│   │   └── routes/
│   │       ├── __init__.py         [CREATED]
│   │       ├── health.py           [CREATED: GET /health, GET /health/ready]
│   │       ├── attributes.py       [CREATED: POST /v1/attributes/preview (501 reserved)]
│   │       └── embeddings.py       [CREATED: POST /v1/embeddings/image, POST /v1/embeddings/text (501 reserved)]
│   ├── schemas/
│   │   ├── __init__.py             [CREATED: unified exports]
│   │   ├── attributes.py           [CREATED: attribute preview schemas]
│   │   ├── embeddings.py           [CREATED: SigLIP 768-dim embedding schemas]
│   │   └── legacy.py               [CREATED: Spring Boot extraction schemas]
│   ├── services/
│   │   ├── __init__.py             [UPDATED: modular exports]
│   │   ├── image_preprocessing.py  [CREATED: 10MB/20MP limits, JPEG/PNG/WebP, quality heuristics]
│   │   ├── attribute_service.py    [CREATED: Florence-2 service abstraction with TODOs]
│   │   ├── embedding_service.py    [CREATED: SigLIP 768-dim dual-embedding service with TODOs]
│   │   ├── qdrant_service.py       [CREATED: Qdrant client factory & safe offline health check]
│   │   ├── quality_service.py      [PRESERVED]
│   │   └── vision_service.py       [PRESERVED]
│   ├── models/
│   │   ├── __init__.py             [UPDATED: exports manager & model adapters]
│   │   ├── model_manager.py        [CREATED: lazy model lifecycle manager]
│   │   ├── siglip_model.py         [CREATED: SigLIP model adapter scaffold]
│   │   ├── florence_model.py       [CREATED: Florence-2 model adapter scaffold]
│   │   ├── siglip.py               [PRESERVED]
│   │   ├── ocr.py                  [PRESERVED]
│   │   └── grounding_dino.py       [PRESERVED]
│   └── utils/
│       ├── __init__.py             [CREATED]
│       └── logging.py              [CREATED: privacy-preserving logger]
├── scripts/
│   ├── check_environment.py        [CREATED: environment & dependency verification script]
│   └── check_model_imports.py      [CREATED: Hugging Face model classes import verifier]
├── tests/
│   ├── __init__.py                 [CREATED]
│   ├── test_health.py              [CREATED: 5 integration tests for /health, /health/ready, 501 routes]
│   └── test_image_preprocessing.py [CREATED: 7 unit tests for decoding, limits, and quality heuristics]
├── reports/
│   └── environment_check.md        [CREATED: this verification report]
├── .env.example                    [UPDATED: local safe defaults, no live secrets]
├── .gitignore                      [CREATED: ignores .env, .venv, uploads, weights, logs]
├── requirements.in                 [CREATED: direct runtime dependencies without hard pins]
├── requirements-dev.in             [CREATED: test and development dependencies (pytest)]
└── requirements.txt                [PRESERVED: legacy dependencies]
```

---

## 3. Package Verification & Module Importability

### Verified & Importable Core Packages

| Distribution | Version | Import Module | Import Status |
| :--- | :--- | :--- | :--- |
| `fastapi` | 0.162.0 | `fastapi` | **OK** |
| `uvicorn` | 0.54.0 | `uvicorn` | **OK** |
| `starlette` | 1.10.0 | `starlette` | **OK** |
| `pydantic` | 2.14.1 | `pydantic` | **OK** |
| `pydantic-settings` | 2.16.1 | `pydantic_settings` | **OK** |
| `python-multipart` | 0.0.32 | `multipart` | **OK** |
| `python-dotenv` | 1.2.4 | `dotenv` | **OK** |
| `torch` | 2.6.0+cu124 | `torch` | **OK** |
| `torchvision` | 0.21.0+cu124 | `torchvision` | **OK** |
| `transformers` | 5.21.0 | `transformers` | **OK** |
| `timm` | 1.0.30 | `timm` | **OK** |
| `pillow` | 12.3.0 | `PIL` | **OK** |
| `opencv-python-headless` | 5.0.0.93 | `cv2` | **OK** |
| `numpy` | 2.5.2 | `numpy` | **OK** |
| `safetensors` | 0.8.0 | `safetensors` | **OK** |
| `huggingface_hub` | 2.3.0 | `huggingface_hub` | **OK** |
| `tokenizers` | 0.23.3 | `tokenizers` | **OK** |
| `sentencepiece` | 0.2.2 | `sentencepiece` | **OK** |
| `open_clip_torch` | 3.3.0 | `open_clip` | **OK** |

### Missing Packages

| Package | Role | Current Status | Impact / Notes |
| :--- | :--- | :--- | :--- |
| `qdrant-client` | Vector DB search | **Not Installed** | `QdrantService` gracefully returns `client_not_installed` during health checks. |
| `einops` | Florence-2 tensor operations | **Not Installed** | Required by Florence-2 for dynamic spatial feature reshaping. |
| `httpx` | HTTP client / standard import | **Not Installed** (only `httpx2 2.16.0` present) | `from fastapi.testclient import TestClient` functions via Starlette's `httpx2` aliasing, but direct `import httpx` fails. |
| `pytest` | Test runner | **Not Installed** | All unit/integration tests run via built-in `unittest` without external dependency. |

### Optional / Future Dependencies (Excluded from Current Task)

- **PaddleOCR / PaddlePaddle**: Excluded per instruction. Adapters in `app/models/ocr.py` remain cleanly isolated.
- **Grounding DINO**: Excluded per instruction. Adapters in `app/models/grounding_dino.py` remain cleanly isolated.

---

## 4. Hardware & CUDA Acceleration

- **CUDA Available**: `True`
- **PyTorch CUDA Build**: `12.4` (`torch 2.6.0+cu124`)
- **GPU Devices Detected**: `1`
- **GPU Model**: `NVIDIA GeForce RTX 3050 Laptop GPU`
- **Safety Compliance**: Zero large tensor allocations or weight downloads were executed during verification.

---

## 5. Pip Consistency Check (`pip check`)

- **Standard `python -m pip check`**:
  - Exit code: `1`
  - Output: `No module named pip` (The virtual environment was provisioned using `uv` without the standard pip bootstrap).
- **`uv pip check --python <interpreter>`**:
  - Exit code: `0`
  - Output: `Checked 58 packages in 10ms. All installed packages are compatible.`

---

## 6. Hugging Face Model Import Check

Executed via `scripts/check_model_imports.py` without downloading model checkpoints:

- `AutoProcessor`: Available (`transformers.models.auto.processing_auto.AutoProcessor`)
- `AutoModel`: Available (`transformers.models.auto.modeling_auto.AutoModel`)
- `AutoModelForCausalLM`: Available (`transformers.models.auto.modeling_auto.AutoModelForCausalLM`)
- `AutoTokenizer`: Available (`transformers.models.auto.tokenization_auto.AutoTokenizer`)
- **SigLIP Architecture**: `SiglipModel`, `SiglipProcessor`, `SiglipConfig`, `SiglipVisionModel`, `SiglipTextModel` are all natively present in `transformers 5.21.0`.
- **Florence-2 Architecture**: `Florence2ForConditionalGeneration`, `Florence2Config`, and `Florence2Processor` are present in `transformers 5.21.0`.
- **Crucial Warning**: Import checks confirm symbol presence only. Checkpoint loading and forward-pass inference will require runtime validation and `einops`.

---

## 7. Test Results

Executed with `unittest discover tests`:

```text
Ran 12 tests in 0.175s: OK
```

### Breakdown:

1. **`test_health.py`** (5 tests):
   - `test_health_endpoint`: Verified `GET /health` returns status `200` with app metadata, CUDA status, and Qdrant connectivity.
   - `test_readiness_endpoint`: Verified `GET /health/ready` returns status `200` and `ready: true` checking core dependencies without loading models.
   - `test_attributes_preview_reserved_returns_501`: Verified `POST /v1/attributes/preview` returns `501 Not Implemented` with informative error message.
   - `test_embedding_image_reserved_returns_501`: Verified `POST /v1/embeddings/image` returns `501 Not Implemented`.
   - `test_embedding_text_reserved_returns_501`: Verified `POST /v1/embeddings/text` returns `501 Not Implemented`.

2. **`test_image_preprocessing.py`** (7 tests):
   - `test_valid_jpeg_decoding`: Successfully decoded and converted to RGB.
   - `test_valid_png_decoding`: Successfully decoded and converted to RGB.
   - `test_unsupported_mime_type`: Correctly rejected invalid MIME with HTTP `415`.
   - `test_empty_payload`: Correctly rejected empty bytes with HTTP `400`.
   - `test_corrupted_payload`: Correctly rejected damaged byte payload with HTTP `400`.
   - `test_max_bytes_exceeded`: Correctly rejected file size > 10MB with HTTP `413`.
   - `test_quality_metrics_evaluation`: Verified Laplacian variance sharpness and brightness visibility heuristics produce valid normalized metrics in `[0.0, 1.0]`.

---

## 8. FastAPI Live Endpoint Probe

`GET /health` verified via test client:

```json
{
  "status": "ok",
  "app_name": "Lost & Found AI Vision Service",
  "version": "1.0.0",
  "environment": "development",
  "python_version": "3.12.15 (main, Oct  1 2026, 21:00:48) [MSC v.1944 64 bit (AMD64)]",
  "torch_version": "2.6.0+cu124",
  "device": "cuda",
  "cuda": {
    "available": true,
    "version": "12.4",
    "device_name": "NVIDIA GeForce RTX 3050 Laptop GPU"
  },
  "qdrant": {
    "status": "client_not_installed",
    "available": false,
    "url": "http://localhost:6333",
    "detail": "qdrant-client distribution is not installed in the active environment"
  },
  "models": {
    "siglip": "google/siglip-base-patch16-224",
    "florence": "microsoft/Florence-2-base"
  }
}
```

---

## 9. Identified Compatibility Risks

1. **Transformers 5.21.0 & Florence-2**:
   - `transformers 5.21.0` has native `Florence2ForConditionalGeneration`, but official Microsoft checkpoints (`microsoft/Florence-2-base`) historically relied on custom modeling code (`trust_remote_code=True`) that may have syntax conflicts with newer Transformers internal APIs.
   - Florence-2 dynamic vision embeddings require the `einops` package, which is currently missing.
2. **Nonstandard `httpx2` / `httpcore2` Package Names**:
   - The virtual environment contains distributions named `httpx2 (2.16.0)` and `httpcore2 (2.16.0)`.
   - Third-party libraries that explicitly execute `import httpx` will fail with `ModuleNotFoundError: No module named 'httpx'`.
   - While Starlette's `TestClient` works with `httpx2` in this environment, any external code expecting standard `httpx` will need the official `httpx` package installed.
3. **NumPy 2.5.2 & OpenCV 5.0.0.93**:
   - Both NumPy 2.x and OpenCV 5.x are bleeding-edge versions. While standard `cv2.Laplacian` and `cv2.cvtColor` executed cleanly in our tests, certain PyTorch/torchvision C-extensions or external vision libraries may occasionally have C-ABI mismatches with NumPy 2.x.

---

## 10. Recommended Next Actions

1. **Obtain User Approval for Missing Runtime Dependencies**:
   Install targeted missing packages using `uv pip install` into the existing virtual environment:
   ```powershell
   uv pip install --python .\ai-service\.venv\Scripts\python.exe einops qdrant-client httpx pytest
   ```
2. **Implement Florence-2 Attribute Inference**:
   Wire `app/services/attribute_service.py` to `app/models/florence_model.py` with lazy checkpoint loading on first request to `POST /v1/attributes/preview`.
3. **Implement SigLIP Multimodal Text and Image Embeddings**:
   Wire `app/services/embedding_service.py` to generate 768-dimensional normalized vectors for `POST /v1/embeddings/image` and `POST /v1/embeddings/text`.
4. **Deploy Qdrant Vector Collection**:
   Configure a local Qdrant instance (e.g. via Docker) at `http://localhost:6333` with a 768-dimensional Cosine distance collection.

