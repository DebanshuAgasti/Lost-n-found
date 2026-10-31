# L&F Project Context & Architecture Log

## 2026-10-11 — Architecture Consensus: 4-Tier Stack, Pretrained Models & Qdrant

### Key Decisions Finalized:
1. **Four Core Tiers**:
   - **Frontend**: React JS (Deferred to later phases; backend-first focus).
   - **Backend**: Spring Boot 3.3.4 (Java 21) as authoritative API, orchestrator, and transactional state machine.
   - **AI Service**: Dedicated Python AI service (FastAPI) running pretrained open-source vision models (CLIP / Florence-2).
   - **Dual Storage**: PostgreSQL 16 (authoritative System of Record) + Qdrant (dedicated vector database).

2. **Model Training Decision**:
   - **No custom model training initially**.
   - Pretrained models handle everyday object categories, color extraction, general visual similarity, and visible brand text zero-shot.
   - Fine-tuning only deferred to later phases if evaluation on real-world datasets reveals demonstrable domain gaps.

3. **Standardized AI Extraction Contract**:
   - Python AI service returns structured JSON containing:
     - `category`: string
     - `color`: string
     - `brand`: `{ value, confidence }`
     - `image_quality`: `{ sharpness, visibility }`
     - `embedding`: 512-dim float vector
   - Unclear/blurry images yield `"unknown"` rather than guessing.

4. **Two-Stage Matching Pipeline**:
   - **Stage 1 (Coarse Retrieval)**: Qdrant searches 512-dim embeddings with metadata payload pre-filtering (status, category) returning the top 50 candidates.
   - **Stage 2 (Precision Reranking)**: Spring Boot hydrates candidate entities from PostgreSQL and applies the 6-D composite score (Category, Visual, Attributes, Text, Geo, Temporal).

---

## 2026-09-04 — Choose Open Source Model
- Explored open-source model options for image matching.
- Discussed whether models can be hosted on cloud vs local containers.
- Considered whether custom training on lost-item images is needed early on.
- Confirmed website first (React JS) and mobile application later against the same API.
- Emphasized building and testing backend independent of frontend.

---

## 2026-08-31 — Open Source Model & Architecture
- Evaluated open-source model selection and cloud deployment.
- Outlined shared API approach for multi-client ecosystem.

---

## 2026-08-25 — Vector Databases & Distinguishing Features
- Discussed optional feature entry (brand, color, scratches, stickers) by users to assist ambiguous photos.
- Recognized that blurry, occluded, or low-light images degrade pure visual search, making multimodal attributes essential.

---

## 2026-09-04 — PostgreSQL vs Vector Database
- Clarified that vector databases and relational databases have complementary roles: PostgreSQL is authoritative for users, transactions, and state; vector databases are specialized for nearest-neighbor vector search.
