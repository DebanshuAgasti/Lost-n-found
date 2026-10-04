# Contributing to Lost & Found Platform

Thank you for your interest in contributing to the **Lost & Found Management Platform**! We welcome contributions to both our backend Spring Boot architecture and our React client.

This guide outlines our development workflow, architectural standards, testing procedures, and submission guidelines to ensure a smooth contribution experience.

---

## 1. Quick Start & Prerequisites

- **Java**: Version 21 (Temurin / OpenJDK 21)
- **Maven**: Version 3.8+ (or use `./mvnw`)
- **Node.js**: Version 18+ or 20+
- **Database**: In-memory H2 runs automatically for dev/tests. PostgreSQL 16+ is used in production.

---

## 2. Running & Testing Locally

### Backend (Spring Boot 3.3.4)
```bash
# Navigate to backend directory
cd backend

# Run all unit and integration tests (uses in-memory H2 database)
./mvnw test

# Run a specific test class
./mvnw test -Dtest=FoundItemControllerTest

# Start local backend server (default: port 8080)
./mvnw spring-boot:run
```

### Frontend (React 18 + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run Vitest component and API tests
npm test

# Run tests in UI / watch mode
npm run test:ui

# Verify production bundle build
npm run build

# Start local dev server (default: port 3000)
npm run dev
```

---

## 3. Architecture & Code Guidelines

### Backend Guidelines
1. **Layered Architecture**:
   - `controller/`: REST endpoints returning the unified `ApiResponse<T>` envelope.
   - `service/`: Transactional business logic, event publishers (`ApplicationEventPublisher`), and external integrations.
   - `ml/`: Composite matching engine, scorers, vector cosine similarity calculators, and JPA converters.
   - `service/llm/`: Universal pluggable LLM provider layer (`LlmClientRouter`, `GeminiLlmClient`, `OpenAiLlmClient`, `OllamaLlmClient`, `MockLlmClient`).
   - `model/entity/`: Normalized JPA entities with optimistic locking (`@Version`).
   - `repository/`: Spring Data JPA repositories with indexed queries.

2. **Multimodal Matching Rules**:
   - Matches are evaluated across **6 independent dimensions**: Category (20%), Visual (35%), Attributes (20%), Text (10%), Geo (10%), Temporal (5%).
   - Always apply **Dynamic Weight Rebalancing**: when visual embeddings or coordinates are missing, re-normalize remaining weights to 100% rather than disqualifying items.
   - Category incompatibility (`0.0`) must immediately short-circuit further scoring.

3. **LLM & AI Assistance Guidelines**:
   - All AI features (`extract-attributes`, `parse-report`, `verify-claim`, `explain-match`) must route through `LlmClientRouter`.
   - Never hardcode API keys. Rely on environment variables `GEMINI_API_KEY` and `OPENAI_API_KEY`.
   - Always support graceful degradation: if an external model call fails or credentials are unset, fallback to `MockLlmClient` to maintain service availability.
   - All prompt outputs must enforce and parse strict JSON format.

### Frontend Guidelines
1. **Routing**: Real navigation via `react-router-dom` (pages in `src/pages/`, components in `src/components/`).
2. **Context**: Global state managed via `AppContext.jsx`.
3. **Resilience**: The frontend gracefully falls back to mock seeds when the backend server is offline.
4. **Testing**: Every new page or interactive feature must include a Vitest test under `src/tests/`.

---

## 4. Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Ensure all tests pass:
   ```bash
   cd backend && ./mvnw test
   cd ../frontend && npm test && npm run build
   ```
3. Commit with semantic messages (e.g., `feat:`, `fix:`, `test:`, `docs:`):
   ```bash
   git commit -m "feat: add automated match dispute resolution"
   ```
4. Push and open a Pull Request against `master`. Our GitHub Actions CI will automatically test your changes.
