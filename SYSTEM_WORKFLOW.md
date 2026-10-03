# Lost & Found Platform — Complete System Workflow & Architecture Guide

**Project Version**: `1.0.0-SNAPSHOT`  
**Platform**: Java 21 / Spring Boot 3.3.4  
**Persistence**: PostgreSQL (Production) / In-Memory H2 (Dev & Test)  
**Security**: Stateless JWT / Spring Security 6  
**Documentation**: SpringDoc OpenAPI 3.0 / Swagger UI  

---

## 1. Executive Summary & System Purpose

The **Lost & Found (L&F) Platform** is a full-featured backend application built to solve the core challenges of item recovery across campuses, airports, transit systems, and communities. Traditional lost-and-found systems suffer from:
* Incomplete or vague user descriptions.
* Low-resolution, occluded, or missing photos.
* Fragmented custodial records with no cryptographic or verifiable ownership proof.

This platform solves these problems using:
1. **Multimodal AI & Heuristic Matching Engine**: Evaluates item candidates across **6 independent dimensions** (visual embeddings, categories, fine-grained attributes, text descriptions, geographical distance, and chronological alignment).
2. **Dynamic Weight Rebalancing**: Automatically recalculates weights when images or coordinates are absent, preventing arbitrary score disqualification.
3. **Custodial Verification Workflow**: Implements a strict state machine with verification questions, proof images, and approval handovers.
4. **Event-Driven Architecture**: Uses Spring internal application events to decouple item submission from matching calculations.

---

## 2. High-Level System Architecture

The backend follows a layered architectural design with event-driven coupling:

```mermaid
graph TB
    subgraph "Clients"
        WEB["Next.js Web Client"]
        MOBILE["Mobile App"]
        SWAGGER["Swagger UI Explorer"]
    end

    subgraph "Security & API Gateway"
        SEC_FILTER["Spring Security 6 Filter Chain"]
        JWT_FILTER["JwtAuthenticationFilter"]
        ROUTING["REST Controllers\n(Auth, Lost, Found, Match, Claim, Notification, Image)"]
    end

    subgraph "Domain Service Layer"
        AUTH_SVC["AuthService"]
        LOST_SVC["LostItemService"]
        FOUND_SVC["FoundItemService"]
        CLAIM_SVC["ClaimService"]
        NOTIF_SVC["NotificationService"]
        EVENT_BUS["Spring ApplicationEventPublisher"]
    end

    subgraph "AI & Multimodal Matching Engine"
        MATCH_SVC["CandidateMatchService"]
        MATCH_ENG["MatchingEngine"]
        EMBED_SVC["ImageEmbeddingService\n(Local Deterministic / Remote CLIP)"]
        VEC_CALC["VectorSimilarityCalculator"]
        subgraph "6 Multimodal Scorers"
            SC_CAT["CategoryScorer"]
            SC_VIS["ImageSimilarityScorer"]
            SC_ATTR["AttributeScorer"]
            SC_TXT["TextSimilarityScorer"]
            SC_GEO["GeoProximityScorer"]
            SC_TIME["TemporalProximityScorer"]
        end
    end

    subgraph "Persistence & File Storage"
        STORAGE["ImageStorageService (Local FS / S3 Ready)"]
        JPA["Spring Data JPA Repositories"]
        DB[("PostgreSQL / H2 Database")]
    end

    WEB --> SEC_FILTER
    MOBILE --> SEC_FILTER
    SWAGGER --> SEC_FILTER

    SEC_FILTER --> JWT_FILTER --> ROUTING

    ROUTING --> AUTH_SVC
    ROUTING --> LOST_SVC
    ROUTING --> FOUND_SVC
    ROUTING --> CLAIM_SVC
    ROUTING --> NOTIF_SVC
    ROUTING --> MATCH_SVC

    LOST_SVC --> STORAGE
    LOST_SVC --> EMBED_SVC
    LOST_SVC --> EVENT_BUS

    FOUND_SVC --> STORAGE
    FOUND_SVC --> EMBED_SVC
    FOUND_SVC --> EVENT_BUS

    EVENT_BUS -.->|LostItemCreatedEvent| MATCH_SVC
    EVENT_BUS -.->|FoundItemCreatedEvent| MATCH_SVC

    MATCH_SVC --> MATCH_ENG
    MATCH_ENG --> SC_CAT
    MATCH_ENG --> SC_VIS
    MATCH_ENG --> SC_ATTR
    MATCH_ENG --> SC_TXT
    MATCH_ENG --> SC_GEO
    MATCH_ENG --> SC_TIME
    SC_VIS --> VEC_CALC

    MATCH_SVC --> NOTIF_SVC

    AUTH_SVC & LOST_SVC & FOUND_SVC & CLAIM_SVC & MATCH_SVC & NOTIF_SVC --> JPA
    JPA --> DB
```

---

## 3. Database Schema & Domain Entity Relationships (ERD)

The relational schema implements clean normalization, foreign key constraints, cascading rules, and index optimization:

```mermaid
erDiagram
    USERS ||--o{ LOST_ITEMS : "reports"
    USERS ||--o{ FOUND_ITEMS : "discovers"
    USERS ||--o{ CLAIMS : "submits"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    LOST_ITEMS ||--o{ ITEM_IMAGES : "has photos"
    FOUND_ITEMS ||--o{ ITEM_IMAGES : "has photos"
    
    LOST_ITEMS ||--o{ CANDIDATE_MATCHES : "candidate match"
    FOUND_ITEMS ||--o{ CANDIDATE_MATCHES : "candidate match"
    
    FOUND_ITEMS ||--o{ CLAIMS : "target of claim"
    LOST_ITEMS ||--o{ CLAIMS : "linked reference"

    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar phone_number
        varchar role
        timestamp created_at
    }

    LOST_ITEMS {
        bigint id PK
        bigint user_id FK
        varchar title
        text description
        varchar category
        varchar status
        date lost_date
        time lost_time
        varchar location_name
        varchar address
        varchar city
        double latitude
        double longitude
        numeric reward_amount
        varchar contact_preference
        varchar contact_phone
        varchar contact_email
        timestamp created_at
    }

    FOUND_ITEMS {
        bigint id PK
        bigint user_id FK
        varchar title
        text description
        varchar category
        varchar status
        date found_date
        time found_time
        varchar location_name
        varchar address
        varchar city
        double latitude
        double longitude
        varchar storage_location
        varchar current_custodian
        varchar verification_question
        timestamp created_at
    }

    ITEM_IMAGES {
        bigint id PK
        bigint lost_item_id FK
        bigint found_item_id FK
        varchar image_url
        varchar file_path
        varchar file_name
        bigint file_size
        varchar mime_type
        boolean is_primary
        text embedding
        timestamp created_at
    }

    CANDIDATE_MATCHES {
        bigint id PK
        bigint lost_item_id FK
        bigint found_item_id FK
        double overall_score
        double visual_score
        double category_score
        double attributes_score
        double text_score
        double location_score
        double temporal_score
        varchar status
        text reviewer_notes
        timestamp created_at
    }

    CLAIMS {
        bigint id PK
        bigint found_item_id FK
        bigint lost_item_id FK
        bigint claimant_id FK
        varchar status
        text proof_description
        varchar verification_answers
        varchar proof_image_urls
        bigint reviewer_id FK
        text reviewer_notes
        timestamp created_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK
        varchar type
        varchar title
        text message
        bigint reference_id
        varchar reference_type
        boolean is_read
        timestamp created_at
    }
```

---

## 4. End-to-End Operational Workflows

### 4.1 Authentication & Stateless JWT Lifecycle
1. **User Registration** (`POST /api/auth/register`):
   - Accepts email, password, full name, phone number.
   - Enforces unique email check (case-insensitive).
   - Hashes raw password via `BCryptPasswordEncoder`.
   - Issues a signed JWT bearer token valid for 24 hours.
2. **User Login** (`POST /api/auth/login`):
   - Authenticates through Spring Security's `AuthenticationManager`.
   - Returns signed JWT containing user ID, email, and authority claims.
3. **Stateless Request Interception**:
   - `JwtAuthenticationFilter` intercepts requests.
   - Parses the `Authorization: Bearer <token>` header.
   - Validates HMAC signature via `JwtTokenProvider`.
   - Injects the authenticated `UserPrincipal` into Spring's `SecurityContextHolder`.

---

### 4.2 Lost Item Ingestion Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Lost Item Owner
    participant Controller as LostItemController
    participant Service as LostItemService
    participant Storage as ImageStorageService
    participant Embedding as ImageEmbeddingService
    participant EventBus as ApplicationEventPublisher
    participant MatchService as CandidateMatchService

    Owner->>Controller: POST /api/lost-items (or /with-images)
    Controller->>Service: createLostItem(request, files, currentUser)
    Service->>Service: Persist LostItem (Title, Category, Dates, GPS, Attributes)
    opt When Images are Attached
        Service->>Storage: storeFile(file) -> writes to ./uploads/images/
        Service->>Embedding: generateEmbedding(bytes) -> computes 512-dim vector
        Service->>Service: Create ItemImage entity with vector & link to LostItem
    end
    Service->>Service: Save entity to DB
    Service->>EventBus: publishEvent(new LostItemCreatedEvent(lostItem))
    Service-->>Controller: Return LostItemResponse
    Controller-->>Owner: 201 Created JSON
    EventBus-)MatchService: handleLostItemCreated(event) [Asynchronous Matching]
```

---

### 4.3 Found Item Ingestion Pipeline
1. Discoverer / Campus Security submits report via `POST /api/found-items`.
2. Includes item category, location coordinates, custodian name, and storage location.
3. Includes a **custodial verification question** (e.g., *"What is the lockscreen photo or secret engraving?"*).
4. Generates embeddings for uploaded images and persists records.
5. Emits `FoundItemCreatedEvent`, which triggers the matching engine against all active lost items.

---

### 4.4 The Multimodal AI & Heuristic Matching Engine

The core matching logic resides in `MatchingEngine.java` and `CandidateMatchService.java`. It computes a weighted composite similarity score from 6 specialized scorers:

```mermaid
flowchart TD
    START(["New Item Created"]) --> OPPOSITE["Fetch All Active Opposite-Side Items"]
    OPPOSITE --> EVAL["Evaluate Item Pair (Lost, Found)"]
    
    EVAL --> CAT["1. CategoryScorer (Weight: 20%)"]
    CAT --> CAT_DECISION{"Categories Compatible?"}
    CAT_DECISION -- "Incompatible (Score = 0.0)" --> ZERO["Total Score = 0.0 (Immediate Discard)"]
    CAT_DECISION -- "Exact Match (1.0) or Partial (OTHER = 0.4)" --> SCORERS["Run Remaining 5 Scorers"]

    SCORERS --> VIS["2. ImageSimilarityScorer (Weight: 35%)\nCosine Similarity on 512-dim Normalized Vectors"]
    SCORERS --> ATTR["3. AttributeScorer (Weight: 20%)\nBrand (0.35), Model (0.25), Color (0.20), Markings (0.20)"]
    SCORERS --> TXT["4. TextSimilarityScorer (Weight: 10%)\nTitle & Description Token Jaccard"]
    SCORERS --> GEO["5. GeoProximityScorer (Weight: 10%)\nHaversine Distance Decay / City Fallback"]
    SCORERS --> TIME["6. TemporalProximityScorer (Weight: 5%)\nTimeline Consistency & Decay Curve"]

    VIS & ATTR & TXT & GEO & TIME --> REBALANCE["Dynamic Weight Normalization\nScore = Sum(Weight_i * Score_i) / Sum(Active_Weights)"]
    
    REBALANCE --> THRESHOLD{"Score >= 0.40?"}
    THRESHOLD -- "No" --> IGNORE["Ignore Low Relevance"]
    THRESHOLD -- "Yes" --> PERSIST["Save CandidateMatch Record with Full Breakdown"]
    
    PERSIST --> HIGH_CONF{"Score >= 0.70?"}
    HIGH_CONF -- "Yes" --> STATUS_SUGG["Status: SUGGESTED\nAuto-Dispatch Push/In-App Notification"]
    HIGH_CONF -- "No" --> STATUS_POT["Status: POTENTIAL"]
```

#### Detailed Breakdown of the 6 Scorers:
1. **Category Scorer (`CategoryScorer.java`)**:
   - Exact match = `1.0`.
   - Either item is categorized as `OTHER` = `0.4` (graceful degradation).
   - Incompatible categories (e.g., `PETS` vs `ELECTRONICS`) = `0.0` (immediate disqualification).
2. **Visual Cosine Scorer (`ImageSimilarityScorer.java`)**:
   - Calculates pairwise cosine similarity between all images of both items.
   - Normalized result lies in $[0.0, 1.0]$.
   - Returns `null` if either item lacks valid photos, triggering weight rebalancing.
3. **Attribute Scorer (`AttributeScorer.java`)**:
   - **Brand** (weight 0.35): exact match = `1.0`, substring match = `0.70`.
   - **Model** (weight 0.25): exact match = `1.0`, substring match = `0.72`.
   - **Colors** (weight 0.20): primary-to-primary = `1.0`, cross-match with secondary color = `0.70`.
   - **Distinctive Markings & Stickers** (weight 0.20): tokenizes distinctive marks, scratches, stickers (>2 chars), computing Jaccard set intersection.
4. **Text Similarity Scorer (`TextSimilarityScorer.java`)**:
   - Merges title + description, strips punctuation, removes common English stop words (`the`, `with`, `lost`, `found`, etc.), and calculates token overlap.
5. **Geographical Proximity Scorer (`GeoProximityScorer.java`)**:
   - Uses Haversine spherical formula on GPS coordinates.
   - Distance $\le 0.5\text{ km} \implies 1.0$.
   - Distance between $0.5\text{ km}$ and $25\text{ km} \implies$ linear decay to $0.0$.
   - Fallback if GPS is absent: same city = `0.85`, different city = `0.10`.
6. **Temporal Proximity Scorer (`TemporalProximityScorer.java`)**:
   - If found item date is $> 2$ days before reported lost date $\implies 0.05$ (temporal contradiction penalty).
   - Within $[-2, +2]$ days $\implies 1.0$.
   - Within 14 days $\implies$ decay from $0.90$ to $0.54$.
   - Up to 60 days $\implies$ decay down to $0.20$.

#### Dynamic Weight Rebalancing (Handling Missing/Blurry Photos)
Standard weights: Visual `0.35`, Category `0.20`, Attributes `0.20`, Text `0.10`, Geo `0.10`, Temporal `0.05`.  
If visual embeddings are absent:
$$\text{Overall Score} = \frac{0.20 \times C + 0.20 \times A + 0.10 \times T + 0.10 \times G + 0.05 \times D}{0.65}$$
*Result*: Attributes, brand, distinctive markings, and location expand proportionally to fill 100% of scoring potential without unfair penalties.

---

### 4.5 Custodial Claim & Verification State Machine

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Claimant submits Proof & Answers\n(POST /api/claims)
    note right of SUBMITTED
        Found item moves to CLAIM_PENDING
        Notification dispatched to Finder/Custodian
    end note

    SUBMITTED --> UNDER_REVIEW : Custodian opens claim for inspection
    SUBMITTED --> CANCELLED : Claimant withdraws claim
    
    UNDER_REVIEW --> APPROVED : Custodian verifies passcode & proof
    note right of APPROVED
        FoundItem -> CLAIMED
        LostItem -> RESOLVED
        Notification sent to Claimant to arrange handover
    end note

    UNDER_REVIEW --> REJECTED : Insufficient evidence / incorrect answers
    note right of REJECTED
        FoundItem reverts to ACTIVE
        Notification sent to Claimant
    end note

    UNDER_REVIEW --> ADDITIONAL_INFO_REQUESTED : Custodian requests further clarification
    ADDITIONAL_INFO_REQUESTED --> UNDER_REVIEW : Claimant provides new evidence
```

* Implemented in `ClaimService.java`.
* **Access Control**: Only the original finder/custodian or an admin/staff user can review and approve claims.
* When approved, the found item is marked `CLAIMED` and the corresponding lost item is marked `RESOLVED`.

---

### 4.6 In-App Notifications & Read Tracking
* Handled by `NotificationService.java` and `NotificationController.java`.
* Dispatches notifications for:
  - `MATCH_FOUND`: When candidate match score $\ge 70\%$.
  - `CLAIM_SUBMITTED`: Alerting custodian of an incoming claim.
  - `CLAIM_STATUS_UPDATED`: Notifying claimant of approval or rejection.
* Supports unread badge counting (`/api/notifications/unread-count`) and mark-as-read (`PATCH /api/notifications/{id}/read`).

---

### 4.7 Multimodal LLM & AI Assistance Engine

The platform incorporates a universal, pluggable LLM layer (`AiAssistanceService.java`, `LlmClientRouter.java`) supporting **Google Gemini (gemini-1.5-flash)**, **OpenAI (gpt-4o-mini)**, **Local Ollama (llama3/llava)**, and an **offline zero-key Mock provider**:

```
[ User Photo / Unstructured Text ]
              │
              ▼
    [ AiController.java ]
              │
              ▼
 [ AiAssistanceService.java ]
              │
              ▼
   [ LlmClientRouter.java ] ──(Fallback on Error)──► [ MockLlmClient ]
   ├── GeminiLlmClient   (REST, Base64 Multimodal)
   ├── OpenAiLlmClient   (REST, Chat Completions)
   └── OllamaLlmClient   (Local HTTP)
```

1. **Multimodal Attribute Extraction** (`POST /api/ai/extract-attributes`):
   - Inspects uploaded photos directly using Vision-LLMs.
   - Extracts structured attributes: `brand`, `model`, `primaryColor`, `secondaryColor`, `distinctiveMarks`, `scratchesOrDamage`, and `stickersOrAccessories`.
   - Eliminates missing-data gaps in user reports.
2. **Natural Language Report Parser** (`POST /api/ai/parse-report`):
   - Ingests messy, natural user statements (e.g. *"Lost my navy Herschel backpack yesterday at the student gym with gym clothes and AirPods inside"*).
   - Extracts date, location, category, and attributes into structured form data.
3. **Smart Custodial Claim Verification** (`POST /api/ai/verify-claim/{claimId}`):
   - Evaluates a claimant's submitted answers against the custodian's hidden question.
   - Provides confidence score (0.0 to 1.0), verdict (`LIKELY_MATCH`, `UNLIKELY_MATCH`, `INCONCLUSIVE`), and recommended custodial action (`APPROVE`, `REJECT`, `REQUEST_MORE_INFO`).
4. **Explainable Match Reasoning** (`GET /api/ai/explain-match/{matchId}`):
   - Transforms raw composite mathematical scores (visual cosine, Jaccard, Haversine) into plain-English reasoning for platform operators and users.

---

## 5. Complete REST API Reference

All responses conform to a unified JSON response envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-10-01T23:08:41.123Z"
}
```

| Module | Method | URI | Description | Auth Required |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register user account | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |
| **Auth** | `GET` | `/api/auth/me` | Get current authenticated user profile | Authenticated |
| **Lost Items** | `GET` | `/api/lost-items` | Search & filter lost reports (category, city, keyword) | Public |
| **Lost Items** | `GET` | `/api/lost-items/{id}` | Get lost item report details | Public |
| **Lost Items** | `POST` | `/api/lost-items` | File lost report (JSON payload) | Authenticated |
| **Lost Items** | `POST` | `/api/lost-items/with-images` | File lost report with photos (Multipart) | Authenticated |
| **Lost Items** | `POST` | `/api/lost-items/{id}/images` | Attach photos to existing lost report | Owner / Admin |
| **Lost Items** | `PUT` | `/api/lost-items/{id}` | Update lost report details | Owner / Admin |
| **Lost Items** | `PATCH`| `/api/lost-items/{id}/status` | Update status (`ACTIVE`, `RESOLVED`, `CANCELLED`) | Owner / Admin |
| **Lost Items** | `DELETE`| `/api/lost-items/{id}` | Delete lost item report | Owner / Admin |
| **Found Items**| `GET` | `/api/found-items` | Search & filter found reports | Public |
| **Found Items**| `GET` | `/api/found-items/{id}` | Get found item report details | Public |
| **Found Items**| `POST` | `/api/found-items` | File found report (JSON payload) | Authenticated |
| **Found Items**| `POST` | `/api/found-items/with-images`| File found report with photos (Multipart) | Authenticated |
| **Found Items**| `PUT` | `/api/found-items/{id}` | Update found report details | Owner / Admin |
| **Matches** | `GET` | `/api/matches/lost/{lostItemId}` | Get ranked AI candidate matches for lost item | Authenticated |
| **Matches** | `GET` | `/api/matches/found/{foundItemId}`| Get ranked AI candidate matches for found item | Authenticated |
| **Matches** | `PATCH`| `/api/matches/{matchId}/status` | Update candidate status (`CONFIRMED`, `REJECTED`) | Authenticated |
| **Claims** | `POST` | `/api/claims` | Submit ownership claim with proof & answers | Authenticated |
| **Claims** | `GET` | `/api/claims/my` | View claimant's submitted claims | Authenticated |
| **Claims** | `GET` | `/api/claims/found/{foundItemId}`| View all claims on a found item | Custodian / Admin |
| **Claims** | `PATCH`| `/api/claims/{claimId}/review` | Review claim (approve, reject, request info) | Custodian / Admin |
| **Notifications**| `GET` | `/api/notifications` | Get paginated user notifications | Authenticated |
| **Notifications**| `GET` | `/api/notifications/unread-count`| Get unread alert badge count | Authenticated |
| **Notifications**| `PATCH`| `/api/notifications/{id}/read` | Mark alert as read | Authenticated |
| **Images** | `GET` | `/api/images/{filename}` | Stream stored image file | Public |
| **AI Assistance**| `POST`| `/api/ai/extract-attributes` | Multimodal VLM photo attribute extraction (Multipart) | Public |
| **AI Assistance**| `POST`| `/api/ai/parse-report` | Natural language text parsing into structured report | Public |
| **AI Assistance**| `POST`| `/api/ai/verify-claim/{claimId}` | AI semantic verification of claim answers vs secret question | Authenticated |
| **AI Assistance**| `GET` | `/api/ai/explain-match/{matchId}`| Generates human-readable match explanation and factors | Authenticated |

---

## 6. Codebase File Inventory & Architecture Mapping

```
Lost-n-found/
├── backend/
│   ├── pom.xml                                  # Maven dependencies (Spring Boot 3.3.4, JJWT, SpringDoc)
│   ├── src/main/resources/
│   │   ├── application.yml                      # Base configuration & matching weights
│   │   ├── application-dev.yml                  # H2 in-memory dev profile configuration
│   │   ├── application-postgres.yml             # Production PostgreSQL profile configuration
│   │   └── schema-postgres.sql                  # Production DDL schema, indexes, constraints
│   └── src/main/java/com/lostfound/
│       ├── LostFoundApplication.java            # Main Spring Boot application entry point
│       ├── config/
│       │   ├── SecurityConfig.java              # Spring Security 6 filter chain, CORS & BCrypt
│       │   ├── JwtProperties.java               # JWT secret and expiration mapping
│       │   ├── MatchingEngineProperties.java    # Configurable weights & proximity thresholds
│       │   ├── OpenApiConfig.java               # Swagger 3.0 configuration with JWT Bearer scheme
│       │   └── DataInitializer.java             # Pre-seeds demo users, items, matches on 'dev'
│       ├── controller/
│       │   ├── AuthController.java              # Authentication endpoints
│       │   ├── LostItemController.java          # Lost item CRUD and image upload
│       │   ├── FoundItemController.java         # Found item CRUD and image upload
│       │   ├── MatchController.java             # Similarity match queries and status updates
│       │   ├── ClaimController.java             # Claim submission and custodial review
│       │   ├── NotificationController.java      # In-app notifications and unread badge count
│       │   └── ImageController.java             # Image streaming endpoint
│       ├── service/
│       │   ├── AuthService.java                 # User registration, login, JWT token issuance
│       │   ├── LostItemService.java             # Lost item logic & event publication
│       │   ├── FoundItemService.java            # Found item logic & event publication
│       │   ├── CandidateMatchService.java       # Match event listener, evaluation & notification
│       │   ├── ClaimService.java                # Claim state machine & verification
│       │   ├── NotificationService.java         # Notification creation and read tracking
│       │   ├── ImageEmbeddingService.java       # 512-dim normalized vector generator (Local/Remote)
│       │   └── ImageStorageService.java         # Local disk storage & file serving
│       ├── ml/
│       │   ├── MatchingEngine.java              # Gating, rebalancing, and composite scoring
│       │   ├── VectorSimilarityCalculator.java  # Vector cosine similarity calculator
│       │   ├── EmbeddingVectorConverter.java    # JPA AttributeConverter for float[] to String
│       │   └── scorers/
│       │       ├── CategoryScorer.java          # Category gating & compatibility
│       │       ├── ImageSimilarityScorer.java   # Max pairwise visual cosine similarity
│       │       ├── AttributeScorer.java         # Brand, model, colors, markings overlap
│       │       ├── TextSimilarityScorer.java    # Tokenized Jaccard similarity
│       │       ├── GeoProximityScorer.java      # Haversine distance decay & city fallback
│       │       └── TemporalProximityScorer.java # Timeline consistency & chronological decay
│       ├── security/
│       │   ├── JwtAuthenticationFilter.java     # Bearer token extractor & SecurityContext injector
│       │   ├── JwtTokenProvider.java            # Token generation, signing, and parsing
│       │   ├── CustomUserDetailsService.java    # Database user loader
│       │   └── UserPrincipal.java               # Spring Security UserDetails adapter
│       ├── model/
│       │   ├── entity/                          # User, LostItem, FoundItem, ItemAttributes,
│       │   │                                    # ItemImage, CandidateMatch, Claim, Notification
│       │   └── enums/                           # Role, ItemCategory, LostItemStatus, FoundItemStatus,
│       │                                        # MatchStatus, ClaimStatus, NotificationType
│       ├── repository/                          # Spring Data JPA repositories
│       └── event/                               # Spring ApplicationEvents (LostItemCreated, FoundItemCreated)
└── docs/
    ├── BACKEND_ARCHITECTURE_REPORT.md           # Engineering report & alignment matrix
    └── PROJECT_WALKTHROUGH.md                   # Step-by-step curl walkthrough scenario
```

---

## 7. How to Run & Verify Locally

### Prerequisites
* Java 21 or higher
* Maven 3.9 or higher

### Launch with In-Memory Database (Zero-Config Dev Mode)
```bash
cd backend
mvn spring-boot:run
```
* **REST API**: `http://localhost:8080`
* **Swagger UI (Interactive API Explorer)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **OpenAPI 3.0 Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
* **H2 Database Web Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)  
  * JDBC URL: `jdbc:h2:mem:lostfounddb`  
  * User: `sa` / Password: *(blank)*

### Pre-Seeded Dev Test Accounts
| User | Email | Password | Role | Description |
|---|---|---|---|---|
| **Alex Mercer** | `alex@example.com` | `password123` | `ROLE_USER` | Owner of lost iPhone & wallet |
| **Sarah Chen** | `sarah@example.com` | `password123` | `ROLE_USER` | Discoverer of found iPhone |
| **Administrator** | `admin@example.com` | `admin123` | `ROLE_ADMIN` | Campus security / platform admin |

### Running the Automated Test Suite
```bash
cd backend
mvn clean test
```
* Validates security filters, JWT issuance, REST endpoints, vector cosine mathematics, and dynamic weight rebalancing.
