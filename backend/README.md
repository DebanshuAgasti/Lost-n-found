# Lost & Found Platform — Java Spring Boot Backend

A production-grade Spring Boot 3 backend for the Lost & Found platform, implementing the domain model, multimodal candidate matching pipeline, claim verification lifecycle, and RESTful API as specified in the project export documentation.

---

## 🚀 Key Features

1. **Complete Domain Model & Schemas**:
   - `User`, `LostItem`, `FoundItem`, `ItemAttributes`, `ItemImage`, `CandidateMatch`, `Claim`, and `Notification`.
   - PostgreSQL schema with table definitions, indexes, foreign keys, and `pgvector` compatibility in [`schema-postgres.sql`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/resources/schema-postgres.sql).

2. **Multimodal AI & Heuristic Matching Engine**:
   - **Visual Similarity**: Cosine similarity over normalized 512-dimensional image embeddings ([`VectorSimilarityCalculator`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/java/com/lostfound/ml/VectorSimilarityCalculator.java)).
   - **Attribute & Feature Matching**: Brand, model, primary/secondary colors, and distinctive markings (stickers, scratches, damage, accessories).
   - **Text Similarity**: Jaccard similarity and token overlap across titles, descriptions, and user observations.
   - **Geographic Proximity**: Haversine formula calculation with fallback to city match.
   - **Temporal Proximity**: Chronological consistency scoring and temporal decay.
   - **Dynamic Weight Rebalancing**: When images or coordinates are absent, weights automatically redistribute to emphasize manual attributes and descriptions without penalizing the overall score to zero.

3. **Pluggable Image Ingestion & Embedding Generation**:
   - **Local Mode (Default)**: Standalone, deterministic perceptual feature generator requiring no GPU or cloud subscription.
   - **Remote Mode**: Configurable HTTP integration (`lostfound.embedding.mode=remote`) to connect to an external open-source CLIP/OpenCLIP / ViT embedding microservice.

4. **Security & Authentication**:
   - Stateless JWT authentication with Spring Security 6.
   - Password hashing with BCrypt.
   - Role-based authorization (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_STAFF`).

5. **Interactive Documentation & API Explorer**:
   - OpenAPI 3.0 and Swagger UI accessible at `http://localhost:8080/swagger-ui.html`.

6. **Zero-Configuration Local Development**:
   - In-memory H2 database enabled by default on `dev` profile.
   - Auto-seeded with demo users, lost/found items, and matching scores on startup.

---

## 📋 API Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/lost-items` | Search & filter lost item reports | No |
| `GET` | `/api/lost-items/{id}` | Get lost item by ID | No |
| `POST` | `/api/lost-items` | Submit lost item report (JSON) | Yes |
| `POST` | `/api/lost-items/with-images` | Submit lost item report with photos (Multipart) | Yes |
| `PUT` | `/api/lost-items/{id}` | Update lost item report | Yes (Owner/Admin) |
| `DELETE` | `/api/lost-items/{id}` | Delete lost item report | Yes (Owner/Admin) |
| `GET` | `/api/found-items` | Search & filter found items | No |
| `GET` | `/api/found-items/{id}` | Get found item by ID | No |
| `POST` | `/api/found-items` | Submit found item report (JSON) | Yes |
| `POST` | `/api/found-items/with-images` | Submit found item report with photos (Multipart) | Yes |
| `GET` | `/api/matches/lost/{lostItemId}` | Get ranked candidate matches for a lost item | Yes |
| `GET` | `/api/matches/found/{foundItemId}`| Get ranked candidate matches for a found item | Yes |
| `PATCH`| `/api/matches/{matchId}/status` | Update match status (CONFIRMED, REJECTED) | Yes |
| `POST` | `/api/claims` | Submit ownership claim for a found item | Yes |
| `GET` | `/api/claims/my` | View claimant's submitted claims | Yes |
| `PATCH`| `/api/claims/{claimId}/review` | Approve/reject ownership claim | Yes (Custodian/Admin) |
| `GET` | `/api/notifications` | View user notifications & match alerts | Yes |
| `GET` | `/api/images/{filename}` | Serve stored image asset | No |

---

## 🧪 Default Test Accounts (Dev Profile)

| Email | Password | Role | Description |
|---|---|---|---|
| `alex@example.com` | `password123` | `ROLE_USER` | Lost iPhone reporter & wallet owner |
| `sarah@example.com` | `password123` | `ROLE_USER` | Found item finder |
| `admin@example.com` | `admin123` | `ROLE_ADMIN` | Platform administrator |

---

## 🛠️ How to Run

### Requirements
- **Java**: 21+
- **Maven**: 3.9+

### 1. Run with In-Memory Database (Default)
```bash
cd backend
mvn spring-boot:run
```
The server will start at `http://localhost:8080`.
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification: `http://localhost:8080/v3/api-docs`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:lostfounddb`, user: `sa`, password: blank)

### 2. Run with PostgreSQL
Ensure PostgreSQL is running and database `lostfound_db` is created:
```bash
SPRING_PROFILES_ACTIVE=postgres \
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=lostfound_db \
DB_USER=postgres \
DB_PASSWORD=your_password \
mvn spring-boot:run
```

### 3. Run Automated Tests
```bash
mvn clean test
```
All unit and integration tests execute against the isolated `test` profile using H2.
