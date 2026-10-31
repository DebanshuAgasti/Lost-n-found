# L&F System Overview

## Product
A multimodal Lost & Found platform that intelligently matches lost-item reports with found-item reports using a hybrid AI and rule-based pipeline.

## System Architecture

The platform follows a modular 4-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React Web Frontend                   │
│  (Deferred for later — Backend-First Focus)            │
│  - Photo upload & drag-and-drop                        │
│  - Interactive AI attribute review & edit form         │
│  - Match verification & claim management dashboard     │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST
                            ▼
┌────────────────────────────────────────────────────────┐
│                Spring Boot 3.3.4 Backend               │
│  - Authoritative API, validation & business workflows  │
│  - Custodial verification state machine                │
│  - System orchestrator (PyAI, PostgreSQL, Qdrant)      │
│  - 6-Dimensional composite reranker (MatchingEngine)   │
└─────────────┬──────────────────────────┬───────────────┘
              │                          │
   REST (HTTP)│                          │ Vector Search (gRPC/REST)
              ▼                          ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     Python AI Service     │  │  Qdrant Vector Database │
│     (FastAPI Microservice)│  │                         │
│  - Pretrained vision model│  │  - 512-dim HNSW index   │
│  - Attribute extraction   │  │  - Sub-10ms ANN search  │
│  - Image quality scoring  │  │  - Category/city payload│
│  - Embedding generation   │  │    filtering            │
└───────────────────────────┘  └─────────────────────────┘
              │                          │
              └─────────────┬────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│             PostgreSQL 16 Relational Database          │
│  - Authoritative System of Record (ACID transactions)  │
│  - Users, reports, attributes, locations, claims       │
│  - Audit logs, notifications, and security state       │
└────────────────────────────────────────────────────────┘
```

---

## Component Roles & Responsibilities

### 1. React Web Frontend (Deferred to Phase 4)
- Web client to be built with React.
- **Development Priority Note**: The frontend is a secondary concern deferred to later; current engineering focus is 100% on the backend API, Python AI microservice, Qdrant vector retrieval, and PostgreSQL persistence.
- Once built, it will provide:
  1. Photo upload $\rightarrow$ preview of AI-predicted attributes.
  2. User verification and editing of tags (brand, model, color, marks) before final submission.
  3. Match candidate review with confidence scores.

### 2. Spring Boot Backend (Java 21)
- The core orchestrator and system of record interface.
- Core responsibilities:
  - Authentication and authorization (JWT & Spring Security 6).
  - Report lifecycle and custodial claim state machine (`SUBMITTED -> UNDER_REVIEW -> APPROVED / REJECTED`).
  - Calls Python AI service for image extraction and embeddings.
  - Syncs vector embeddings to Qdrant with report IDs.
  - Executes the final composite 6-D reranking score across candidates.
  - Event-driven notifications via Spring `ApplicationEventPublisher`.

### 3. Python AI Microservice (FastAPI)
- Lightweight inference service running pretrained open-source vision models (e.g. CLIP / Florence-2).
- Responsibilities:
  - Generates 512-dimensional normalized image feature vectors.
  - Zero-shot classification for categories and primary/secondary colors.
  - Brand and text detection with confidence scores.
  - Heuristic image quality assessment (sharpness and visibility).
  - Returns structured prediction JSON to Spring Boot.

### 4. Dual Storage Tier: PostgreSQL + Qdrant
- **PostgreSQL 16 (System of Record)**: Authoritative source for all structured, relational, and transactional data: users, item records, location coordinates, claims, and audit logs.
- **Qdrant (Vector Similarity Engine)**: Specialized vector database optimized for Approximate Nearest Neighbor (ANN) search over high-dimensional image embeddings, with payload-based pre-filtering (by category, city, report type).

---

## Two-Stage Hybrid Matching Concept

Matching operates in two complementary stages:

1. **Stage 1 — Coarse Candidate Retrieval (Qdrant)**:
   - When a new item is submitted, its 512-dim embedding is queried against Qdrant.
   - Filtered by coarse metadata (e.g., `status = 'ACTIVE'`, matching category).
   - Retrieves the top-$K$ visually similar candidate IDs in $< 10\text{ ms}$.

2. **Stage 2 — Precision Composite Reranking (Spring Boot)**:
   - Spring Boot fetches full entity details for the top candidates from PostgreSQL.
   - Runs the in-JVM 6-Dimensional `MatchingEngine`:
     - Visual Similarity (35%)
     - Category (20% — gatekeeper)
     - Attribute Overlap (20% — brand, model, colors, scratches, stickers)
     - Text Description (10% — Jaccard token overlap)
     - Geo Proximity (10% — Haversine spherical distance / city)
     - Temporal Proximity (5% — time-decay curve)
   - Dynamic weight rebalancing ensures fair ranking when photos or coordinates are missing.
   - High-confidence candidates ($\ge 0.70$) trigger user notifications.
