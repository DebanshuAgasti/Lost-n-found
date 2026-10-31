# Current Direction & Working Architecture Decisions

| Area | Decision & Architecture Choice | Rationale |
| :--- | :--- | :--- |
| **Product** | Multimodal Lost & Found platform | Matches lost-item reports with found-item reports across images, metadata, location, and time. |
| **Web Frontend** | **React JS (Deferred)** | React web client; deferred to later phase. Current engineering priority is 100% on the backend. |
| **Mobile App** | Planned for Phase 2 | Will consume the identical Spring Boot REST API used by the web client. |
| **Backend Core** | **Spring Boot 3.3.4 (Java 21)** | Robust transactional orchestrator, custodial state machine, and domain security layer. |
| **AI / Vision Service** | **Python AI Service (FastAPI)** | Dedicated microservice running pretrained open-source models for attribute extraction and embedding generation. |
| **Custom Model Training** | **Pretrained models initially (No custom training)** | Pretrained models (CLIP, Florence-2) handle everyday object categorization, colors, and visual similarity out-of-the-box. |
| **Primary Database** | **PostgreSQL 16** | Authoritative System of Record for users, reports, claims, coordinates, and ACID state management. |
| **Vector Database** | **Qdrant** | Specialized Rust vector engine for high-throughput sub-10ms ANN nearest-neighbor search with payload pre-filtering. |
| **Matching Strategy** | **Two-Stage Hybrid Pipeline** | **Stage 1**: Qdrant coarse candidate retrieval (top 50) $\rightarrow$ **Stage 2**: Spring Boot 6-D composite precision reranker. |
| **Human-in-the-Loop UX** | **Editable & Optional Predictions** | AI predictions are suggestions; users can edit or override them. Blurry images yield `"unknown"` rather than hallucinations. |
| **Deployment / Dev** | **Docker Compose Monorepo** | Single `docker-compose.yml` orchestrates PostgreSQL, Qdrant, Spring Boot, and Python AI service for seamless local dev. |
