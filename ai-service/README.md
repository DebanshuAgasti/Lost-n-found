# Lost & Found — Python AI Vision Microservice (`ai-service`)

A self-hosted Python inference microservice for the **Lost & Found (L&F)** platform matching the multi-modal image-recognition architecture.

## 1. AI System Pipelines

The service powers two core AI pipelines:

1. **Upload-Time Image Understanding**:
   - Uploaded item image → Dense visual captioning and granular attribute extraction (via **Microsoft Florence-2-base**).
   - Uploader reviews and confirms/edits extracted attributes in the UI.
   - Verified attributes are persisted by the Spring Boot backend in PostgreSQL.

2. **Multimodal Text-to-Image Cross-Modal Retrieval**:
   - **Found Item Image**: Passed to **Google SigLIP** (`google/siglip-base-patch16-224`) to generate a **768-dimensional normalized float vector** stored in **Qdrant**.
   - **Lost Item Query**: User's free-form natural language query is converted to a 768-dim vector using the **same SigLIP text encoder** and projected into the identical metric space.
   - **Similarity Search**: Qdrant executes Cosine/Dot-product Approximate Nearest Neighbor (ANN) search to rank matching found-item candidate images.

---

## 2. Directory Structure & File Mapping

```text
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entrypoint with route mounting & lifespan
│   ├── config.py                   # Pydantic Settings (env vars, device auto-detect, model IDs)
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py           # GET /health and GET /health/ready endpoints
│   │       ├── attributes.py       # POST /v1/attributes/preview (Florence-2 pipeline)
│   │       └── embeddings.py       # POST /v1/embeddings/image and POST /v1/embeddings/text (SigLIP)
│   ├── schemas/
│   │   ├── __init__.py             # Unified schema exports
│   │   ├── attributes.py           # Attribute preview schemas
│   │   ├── embeddings.py           # Image & text embedding schemas
│   │   └── legacy.py               # Legacy / Spring Boot extraction schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── image_preprocessing.py  # Image validation (10MB, 20MP, JPEG/PNG/WebP, quality heuristics)
│   │   ├── attribute_service.py    # Florence-2 visual attribute extraction service
│   │   ├── embedding_service.py    # SigLIP multimodal dual-embedding service (768-dim)
│   │   ├── qdrant_service.py       # Qdrant client factory and safe health check
│   │   ├── quality_service.py      # Laplacian variance sharpness & visibility analysis
│   │   └── vision_service.py       # OpenCLIP legacy adapter
│   ├── models/
│   │   ├── __init__.py
│   │   ├── model_manager.py        # Lazy model lifecycle manager (no eager imports/downloads)
│   │   ├── siglip_model.py         # Google SigLIP adapter (FP16 on CUDA, L2 normalized, OOM safe)
│   │   ├── florence_model.py       # Microsoft Florence-2 adapter scaffold
│   │   ├── siglip.py               # SigLIP backward compatibility service
│   │   ├── ocr.py                  # PaddleOCR Phase 2 adapter scaffold
│   │   └── grounding_dino.py       # Grounding DINO Phase 3 adapter scaffold
│   └── utils/
│       ├── __init__.py
│       └── logging.py              # Structured logging (privacy-preserving: no raw images/PII logged)
├── scripts/
│   ├── check_environment.py        # Environment, CUDA, distribution & import verifier
│   ├── check_model_imports.py      # Hugging Face model class import verifier
│   └── smoke_test_siglip.py        # Manual SigLIP smoke test (image & text embeddings, norm, similarity)
├── tests/
│   ├── __init__.py
│   ├── test_health.py              # Health, readiness, and 501 reserved route integration tests
│   ├── test_embeddings.py          # Mocked integration tests for image and text embedding routes
│   └── test_image_preprocessing.py # Image validation, dimension limits, and quality tests
├── reports/
│   └── environment_check.md        # Detailed environment verification report
├── .env.example                    # Safe local configuration template
├── .gitignore                      # Git ignore rules for venv, cache, uploads, logs, weights
├── requirements.in                 # Direct project dependencies (unpinned logical requirements)
├── requirements-dev.in             # Development dependencies (pytest)
├── requirements.txt                # Legacy pinned requirements
└── [existing .venv]                # Preserved virtual environment (Python 3.12, PyTorch 2.6 CUDA 12.4)
```

---

## 3. Quickstart & Verification Commands

Always run Python commands explicitly through the project's virtual environment interpreter:

```powershell
# From the project root (ai-service):
cd ai-service

# 1. Verify environment, installed distributions, imports, and CUDA:
.\.venv\Scripts\python.exe scripts/check_environment.py

# 2. Verify Hugging Face model classes for SigLIP and Florence-2:
.\.venv\Scripts\python.exe scripts/check_model_imports.py

# 3. Run automated tests (18 unit tests using mocks):
.\.venv\Scripts\python.exe -m unittest discover tests

# 4. Run manual SigLIP inference smoke test (generates live image & text vectors on CUDA):
.\.venv\Scripts\python.exe scripts/smoke_test_siglip.py

# 5. Start the FastAPI development server:
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Interactive OpenAPI / Swagger UI: `http://127.0.0.1:8000/docs`

---

## 4. API Endpoints

| Method | Path | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status, environment, CUDA details, Qdrant status | **Active** (HTTP 200) |
| `GET` | `/health/ready` | Verifies required Python modules without loading checkpoints | **Active** (HTTP 200) |
| `POST` | `/v1/embeddings/image` | Found-item image → 768-dim normalized SigLIP vector | **Active** (HTTP 200) |
| `POST` | `/v1/embeddings/text` | Lost-item query text → 768-dim normalized SigLIP vector | **Active** (HTTP 200) |
| `POST` | `/v1/attributes/preview` | Upload item image → Visual attributes & captions (Florence-2) | **Reserved** (HTTP 501 until model loading wired) |
| `POST` | `/api/v1/extract` | Spring Boot composite matching engine backward compatibility | **Active** (SigLIP zero-shot) |
| `POST` | `/v1/classify` | SigLIP zero-shot item category & color classification | **Active** |
| `GET` | `/v1/models` | List of available and planned model architectures | **Active** |

---

## 5. Dependency Management & Hardware Notes

- **PyTorch with CUDA**: `torch 2.6.0+cu124` and `torchvision 0.21.0+cu124` are installed and accelerated by the local **NVIDIA RTX 3050 Laptop GPU**.
- **VRAM Footprint**: Under FP16 precision, SigLIP inference consumes **~402 MB VRAM**, well within the 4 GB GPU capacity.
- **Dynamic Dimension Discovery**: Vector length is dynamically verified from the loaded model (`768`) and cross-checked against image and text outputs.
