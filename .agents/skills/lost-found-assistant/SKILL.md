---
name: lost-found-assistant
description: Operational runbook and troubleshooting workflows for the Lost & Found backend platform, including the Multimodal Matching Engine and AI Assistance Service.
---

# Lost & Found Platform Assistant Skill

Use this skill when developing, testing, querying, or troubleshooting the Lost & Found backend service, the multimodal candidate matching engine, or the LLM integration layer.

---

## 1. Quick Verification & Run Commands

### Start Backend Locally (Dev Profile / In-Memory H2)
```bash
cd backend
mvn spring-boot:run
```
- API Base: `http://localhost:8080`
- Swagger UI Explorer: `http://localhost:8080/swagger-ui.html`
- OpenAPI Spec: `http://localhost:8080/v3/api-docs`
- H2 Web Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:lostfounddb`, User: `sa`, Blank Password)

---

## 2. Testing the AI & LLM Endpoints

### A. Extract Attributes from Image (VLM)
```bash
curl -X POST http://localhost:8080/api/ai/extract-attributes \
  -F "image=@/path/to/item.jpg" \
  -F "context=Found black Apple phone near library"
```

### B. Parse Conversational Text into Report
```bash
curl -X POST http://localhost:8080/api/ai/parse-report \
  -H "Content-Type: application/json" \
  -d '{"text": "I lost my blue Apple iPhone 15 Pro with a clear case near the campus library yesterday."}'
```

### C. Verify Claim Answers vs Secret Question
```bash
curl -X POST http://localhost:8080/api/ai/verify-claim/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### D. Generate Match Explanation
```bash
curl -X GET http://localhost:8080/api/ai/explain-match/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 3. Switching LLM Providers

In `backend/src/main/resources/application.yml`:
* **Mock Fallback (Zero Config)**: `lostfound.llm.provider: mock`
* **Google Gemini**:
  ```yaml
  lostfound.llm.provider: gemini
  lostfound.llm.model: gemini-1.5-flash
  # Set env: GEMINI_API_KEY=your_key
  ```
* **OpenAI**:
  ```yaml
  lostfound.llm.provider: openai
  lostfound.llm.model: gpt-4o-mini
  # Set env: OPENAI_API_KEY=your_key
  ```
* **Local Ollama**:
  ```yaml
  lostfound.llm.provider: ollama
  lostfound.llm.model: llama3
  lostfound.llm.base-url: http://localhost:11434
  ```

---

## 4. Verification Checkpoints

1. **Entity Attributes**: In `LostItem` and `FoundItem`, attributes are embedded via `@Embedded ItemAttributes attributes`. Always access attributes via `item.getAttributes().getBrand()`.
2. **Dynamic Rebalancing**: Missing image or location embeddings must return `null` from scorers to trigger dynamic weight normalization in `MatchingEngine.java`.
3. **Security Matchers**: `/api/ai/parse-report` and `/api/ai/extract-attributes` are public; `/api/ai/verify-claim/**` and `/api/ai/explain-match/**` require JWT authentication.
