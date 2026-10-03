# Lost & Found Platform — Agent & Development Guidelines

This project is a full-featured Lost & Found management platform built on **Java 21**, **Spring Boot 3.3.4**, and **PostgreSQL** with an in-memory **H2** fallback for development and testing.

---

## 1. Architectural Standards & Design Patterns

1. **Layered Architecture**:
   - `controller/`: REST endpoints conforming to the unified `ApiResponse<T>` envelope.
   - `service/`: Transactional business logic, event publishers (`ApplicationEventPublisher`), and external integrations.
   - `ml/`: Composite matching engine, scorers, vector cosine similarity calculators, and JPA converters.
   - `service/llm/`: Universal pluggable LLM provider layer (`LlmClientRouter`, `GeminiLlmClient`, `OpenAiLlmClient`, `OllamaLlmClient`, `MockLlmClient`).
   - `model/entity/`: Normalized JPA entities with clean cascading and optimistic locking.
   - `repository/`: Spring Data JPA repositories with index-backed query methods.

2. **Multimodal Matching Rules**:
   - Evaluate item pairs across **6 independent dimensions**: Category (20%), Visual (35%), Attributes (20%), Text (10%), Geo (10%), Temporal (5%).
   - Always apply **Dynamic Weight Rebalancing**: when visual embeddings or coordinates are missing, re-normalize remaining weights to 100% rather than disqualifying items.
   - Category incompatibility (`0.0`) must immediately short-circuit further scoring.

3. **LLM & AI Assistance Guidelines**:
   - All AI features (`extract-attributes`, `parse-report`, `verify-claim`, `explain-match`) must route through `LlmClientRouter`.
   - Never hardcode API keys. Rely on environment variables `GEMINI_API_KEY` and `OPENAI_API_KEY`.
   - Always support graceful degradation: if an external model call fails or credentials are unset, fallback to `MockLlmClient` to maintain service availability.
   - All prompt outputs must enforce and parse strict JSON format.

4. **Testing Standards**:
   - Tests execute against the `test` profile using in-memory H2.
   - All REST controllers must have integration tests using `@SpringBootTest` and `@AutoConfigureMockMvc`.
