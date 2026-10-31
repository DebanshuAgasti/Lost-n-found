# L&F Planning & Architectural Blueprints

This directory contains the authoritative architecture blueprints, design decisions, and planning documents for the **Lost & Found (L&F)** platform.

---

## 1. System Architecture Overview

The system is designed around a modern **4-Tier Modular Microservice / ML Architecture**:

1. **React Web Frontend (`frontend/`)**: Modern web UI (React JS) featuring photo upload with interactive, editable AI attribute preview forms (deferred to later phase; backend-first focus).
2. **Spring Boot Backend (`backend/`)**: Java 21 / Spring Boot 3.3.4 authoritative orchestrator, transactional domain service, and custodial verification state machine.
3. **Python AI Service (`ai-service/`)**: Dedicated FastAPI microservice running pretrained open-source vision models (CLIP, Florence-2) for attribute extraction, quality checking, and embedding generation.
4. **Dual Storage Tier**:
   - **PostgreSQL 16**: Authoritative System of Record for users, reports, claims, locations, and audit logs.
   - **Qdrant**: Dedicated Rust vector database for sub-10ms Approximate Nearest Neighbor (ANN) search over 512-dim embeddings.

---

## 2. Directory Navigation

| File | Description |
| :--- | :--- |
| **[architecture/system-overview.md](file:///mnt/01DC03F70F167E10/Codes/project/L&F/planning/architecture/system-overview.md)** | End-to-end system architecture diagram, component roles, and two-stage matching pipeline. |
| **[database/postgresql-vs-vector-db.md](file:///mnt/01DC03F70F167E10/Codes/project/L&F/planning/database/postgresql-vs-vector-db.md)** | PostgreSQL vs Qdrant responsibilities, write/read synchronization paths, and dual-store design. |
| **[ml/image-matching.md](file:///mnt/01DC03F70F167E10/Codes/project/L&F/planning/ml/image-matching.md)** | Pretrained models vs custom training analysis, Python AI service API contract, and human-in-the-loop UX. |
| **[decisions/current-direction.md](file:///mnt/01DC03F70F167E10/Codes/project/L&F/planning/decisions/current-direction.md)** | Summary matrix of approved architectural decisions, tech stacks, and rationale. |
| **[chats/PROJECT_CONTEXT.md](file:///mnt/01DC03F70F167E10/Codes/project/L&F/planning/chats/PROJECT_CONTEXT.md)** | Historical decision log and chronological evolution of the system design. |

---

## 3. Engineering Implementation Milestones

1. **Phase 1: Python AI Microservice (`ai-service/`)**
   - Implement FastAPI service with pretrained OpenCLIP / VLM models.
   - Expose `POST /api/v1/extract` returning category, color, brand, image quality, and 512-dim embedding.
2. **Phase 2: Qdrant Integration (`backend/`)**
   - Add Qdrant container to `docker-compose.yml`.
   - Implement Spring Boot Qdrant client for collection management, upserts, and ANN queries.
3. **Phase 3: Two-Stage Hybrid Matching Pipeline (`backend/`)**
   - Replace in-memory full table scans with Stage 1 Qdrant candidate search (top 50).
   - Pass retrieved candidates to Spring Boot's in-JVM 6-D `MatchingEngine` for precision reranking.
4. **Phase 4: React Web Frontend (`frontend/` — Deferred)**
   - Implement React JS web UI for lost & found submission and claim workflows once backend is complete.
   - Build photo dropzone with editable AI prediction review form.
