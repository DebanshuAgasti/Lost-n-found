# Lost & Found Platform — Backend Architecture & Engineering Report

**Project Version**: `1.0.0-SNAPSHOT`  
**Platform**: Java 21 / Spring Boot 3.3.4  
**Database**: PostgreSQL / H2 (Dev & Test)  
**Security**: Stateless JWT / Spring Security 6  
**Documentation**: SpringDoc OpenAPI 3.0 / Swagger UI  

---

## 1. Executive Summary & Plan Alignment

This document provides a comprehensive technical architecture and feature report for the **Lost & Found (L&F) Platform Backend**. Built strictly according to the design decisions, data models, and ML pipelines established in the initial project archive (`L&F_project_export.zip`), the backend serves as the authoritative, independently testable foundation for the forthcoming Next.js web application and future mobile clients.

### Alignment Matrix

| Plan Requirement | Implemented Solution | Code Reference |
|---|---|---|
| **Independent Backend API** | Autonomous Spring Boot 3 REST service with complete CRUD, swagger explorer, and mock/embedded storage. | [`LostFoundApplication.java`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/java/com/lostfound/LostFoundApplication.java) |
| **System of Record: PostgreSQL** | Relational JPA mapping with schema DDL, indexes, constraints, and audit timestamps. | [`schema-postgres.sql`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/resources/schema-postgres.sql) |
| **Similarity Layer: Vector Embeddings** | Normalized 512-dim embedding representation with cosine similarity calculations and pgvector compatibility. | [`VectorSimilarityCalculator.java`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/java/com/lostfound/ml/VectorSimilarityCalculator.java) |
| **Multimodal Matching Pipeline** | Composite weighted engine fusing visual embeddings, structured attributes, text descriptions, Haversine geo distance, and temporal decay. | [`MatchingEngine.java`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/java/com/lostfound/ml/MatchingEngine.java) |
| **Handling Blurry/Poor Images** | Dynamic weight rebalancing engine: if visual data is absent or ambiguous, weight automatically redistributes to manual distinguishing features. | [`MatchingEngine.java`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/java/com/lostfound/ml/MatchingEngine.java#L47-L85) |
| **Custodial Claims & Verification** | Formal verification workflow with ownership questions, proof images, and approval/rejection state transitions. | [`ClaimService.java`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/java/com/lostfound/service/ClaimService.java) |

---

## 2. High-Level System Architecture

The backend adopts a clean layered architecture with event-driven coupling for real-time candidate match calculation and notification dispatching.

```mermaid
graph TB
    subgraph "Clients"
        WEB["Next.js Web Client (Phase 1)"]
        MOBILE["Mobile App (Phase 2)"]
        SWAGGER["Swagger UI / OpenAPI Explorer"]
    end

    subgraph "API & Security Layer"
        GATEWAY["Spring Security Filter Chain"]
        JWT["JwtAuthenticationFilter"]
        ROUTING["REST Controllers\n(Auth, Lost, Found, Match, Claim, Notification)"]
    end

    subgraph "Core Domain & Service Layer"
        AUTH_SVC["AuthService"]
        LOST_SVC["LostItemService"]
        FOUND_SVC["FoundItemService"]
        CLAIM_SVC["ClaimService"]
        NOTIF_SVC["NotificationService"]
        EVENT_BUS["Spring ApplicationEventPublisher"]
    end

    subgraph "AI & Matching Engine"
        MATCH_SVC["CandidateMatchService"]
        MATCH_ENG["MatchingEngine"]
        EMBED_SVC["ImageEmbeddingService\n(Local / Remote Vision API)"]
        VEC_CALC["VectorSimilarityCalculator"]
        SCORERS["Multimodal Scorers:\nVisual, Category, Attributes, Text, Geo, Temporal"]
    end

    subgraph "Persistence Layer"
        STORAGE["ImageStorageService\n(File System / S3 Ready)"]
        JPA["Spring Data JPA Repositories"]
        DB[("PostgreSQL / H2 Database")]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    SWAGGER --> GATEWAY

    GATEWAY --> JWT --> ROUTING
    ROUTING --> AUTH_SVC
    ROUTING --> LOST_SVC
    ROUTING --> FOUND_SVC
    ROUTING --> CLAIM_SVC
    ROUTING --> NOTIF_SVC

    LOST_SVC --> EVENT_BUS
    FOUND_SVC --> EVENT_BUS
    LOST_SVC --> EMBED_SVC
    FOUND_SVC --> EMBED_SVC
    LOST_SVC --> STORAGE
    FOUND_SVC --> STORAGE

    EVENT_BUS -.->|LostItemCreatedEvent| MATCH_SVC
    EVENT_BUS -.->|FoundItemCreatedEvent| MATCH_SVC

    MATCH_SVC --> MATCH_ENG
    MATCH_ENG --> SCORERS
    SCORERS --> VEC_CALC
    MATCH_SVC --> NOTIF_SVC

    AUTH_SVC --> JPA
    LOST_SVC --> JPA
    FOUND_SVC --> JPA
    CLAIM_SVC --> JPA
    MATCH_SVC --> JPA
    NOTIF_SVC --> JPA
    JPA --> DB
```

---

## 3. Entity-Relationship Domain Model (ERD)

The relational schema implements clean normalization, foreign key constraints, and cascading rules:

```mermaid
erDiagram
    USERS ||--o{ LOST_ITEMS : "reports"
    USERS ||--o{ FOUND_ITEMS : "discovers"
    USERS ||--o{ CLAIMS : "submits"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    LOST_ITEMS ||--o{ ITEM_IMAGES : "contains"
    FOUND_ITEMS ||--o{ ITEM_IMAGES : "contains"
    
    LOST_ITEMS ||--o{ CANDIDATE_MATCHES : "matched against"
    FOUND_ITEMS ||--o{ CANDIDATE_MATCHES : "matched against"
    
    FOUND_ITEMS ||--o{ CLAIMS : "claimed by"
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
        varchar city
        double latitude
        double longitude
        numeric reward_amount
        varchar brand
        varchar model
        varchar primary_color
        varchar secondary_color
        varchar distinctive_marks
        varchar scratches_or_damage
        varchar stickers_or_accessories
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
        varchar city
        double latitude
        double longitude
        varchar storage_location
        varchar current_custodian
        varchar verification_question
        varchar brand
        varchar model
        varchar primary_color
        varchar secondary_color
        varchar stickers_or_accessories
        timestamp created_at
    }

    ITEM_IMAGES {
        bigint id PK
        bigint lost_item_id FK
        bigint found_item_id FK
        varchar image_url
        varchar file_path
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

## 4. Multimodal Matching & Ranking Engine

The matching engine addresses the central engineering challenge defined in `L&F_export/ml/image-matching.md`: **raw image similarity is insufficient due to occlusions, lighting, and angles**. 

### Scoring Formula & Dynamic Normalization

```mermaid
flowchart TD
    START(["Report Created: Lost or Found Item"]) --> EXTRACT["Extract Multimodal Features"]
    EXTRACT --> SC_VIS["Visual Cosine Similarity\n(Weight: 35%)"]
    EXTRACT --> SC_CAT["Category Invariance Check\n(Weight: 20%)"]
    EXTRACT --> SC_ATTR["Attribute Overlap\nBrand, Color, Markings (Weight: 20%)"]
    EXTRACT --> SC_TXT["Text & Description Token Jaccard\n(Weight: 10%)"]
    EXTRACT --> SC_GEO["Haversine Proximity / City Match\n(Weight: 10%)"]
    EXTRACT --> SC_TIME["Temporal Decay & Timeline\n(Weight: 5%)"]

    SC_CAT --> CAT_DECISION{"Category Match?"}
    CAT_DECISION -- "Incompatible (0.0)" --> REJECT["Immediate 0.0 Disqualification"]
    CAT_DECISION -- "Compatible / OTHER" --> WEIGHT_NORM["Dynamic Weight Normalization"]

    SC_VIS --> WEIGHT_NORM
    SC_ATTR --> WEIGHT_NORM
    SC_TXT --> WEIGHT_NORM
    SC_GEO --> WEIGHT_NORM
    SC_TIME --> WEIGHT_NORM

    WEIGHT_NORM --> FORMULA["Composite Score Formula:\nScore = Sum(Weight_i * Score_i) / Sum(Active_Weights)"]
    FORMULA --> THRESHOLD{"Score >= 0.40?"}
    THRESHOLD -- "Yes" --> SAVE_MATCH["Persist CandidateMatch Record\nwith Full Score Breakdown"]
    THRESHOLD -- "No" --> DISCARD["Ignore Low Relevance"]

    SAVE_MATCH --> CONFIDENCE{"Score >= 0.70?"}
    CONFIDENCE -- "High Confidence" --> NOTIFY["Auto-Dispatch Push/In-App\nMATCH_FOUND Notifications"]
    CONFIDENCE -- "Moderate Confidence" --> STATUS_POTENTIAL["Set Status: POTENTIAL"]
    NOTIFY --> STATUS_SUGGESTED["Set Status: SUGGESTED"]
```

### Dynamic Weight Rebalancing Example
* **Case A: Item with high-resolution photo**:
  $$\text{Score} = 0.35 \times V + 0.20 \times C + 0.20 \times A + 0.10 \times T + 0.10 \times G + 0.05 \times D$$
* **Case B: Item with no photo or unreadable image**:
  $$\text{Score} = \frac{0.20 \times C + 0.20 \times A + 0.10 \times T + 0.10 \times G + 0.05 \times D}{0.65}$$
  *Result*: The metadata, brand, distinctive marks, and location expand proportionally to fill 100% of the scoring potential without arbitrary penalties.

---

## 5. Claim Verification State Machine

The claim verification workflow enforces strict state progression:

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Claimant Submits Proof & Answers
    
    SUBMITTED --> UNDER_REVIEW : Custodian Opens Claim
    SUBMITTED --> CANCELLED : Claimant Withdraws
    
    UNDER_REVIEW --> APPROVED : Custodian Verifies Ownership
    UNDER_REVIEW --> REJECTED : Insufficient Proof
    UNDER_REVIEW --> ADDITIONAL_INFO_REQUESTED : Custodian Requests Clarification
    
    ADDITIONAL_INFO_REQUESTED --> UNDER_REVIEW : Claimant Provides Evidence
    
    APPROVED --> [*] : Handover Arranged & Item Claimed
    REJECTED --> [*] : Item Reverts to ACTIVE
    CANCELLED --> [*]
```

---

## 6. Security & JWT Filter Pipeline

Spring Security 6 handles all incoming requests statelessly:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web / Mobile Client
    participant Filter as JwtAuthenticationFilter
    participant Provider as JwtTokenProvider
    participant UserDetails as CustomUserDetailsService
    participant SecCtx as SecurityContextHolder
    participant Controller as REST Controller

    Client->>Filter: HTTP Request + Header `Authorization: Bearer <token>`
    alt Bearer Token Present & Valid
        Filter->>Provider: validateToken(jwt)
        Provider-->>Filter: Valid (true)
        Filter->>Provider: getEmailFromToken(jwt)
        Provider-->>Filter: "alex@example.com"
        Filter->>UserDetails: loadUserByUsername("alex@example.com")
        UserDetails-->>Filter: UserPrincipal (id=1, ROLE_USER)
        Filter->>SecCtx: setAuthentication(UsernamePasswordAuthenticationToken)
    else Token Missing or Invalid
        Filter->>Filter: Continue chain unauthenticated
    end
    Filter->>Controller: Dispatch to Endpoint
    alt Protected Endpoint & Unauthenticated
        Controller-->>Client: 401 Unauthorized / 403 Forbidden
    else Allowed Endpoint
        Controller-->>Client: 200 OK + JSON Response
    end
```

---

## 7. Complete REST API Contract

All endpoints conform to a unified JSON envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-09-26T02:47:20.123Z"
}
```

### Endpoint Matrix

| Module | Method | URI | Description | Auth |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register user account | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate and obtain JWT | Public |
| **Auth** | `GET` | `/api/auth/me` | Current authenticated user profile | Authenticated |
| **Lost Items** | `GET` | `/api/lost-items` | Public search, filter by category/city/keyword | Public |
| **Lost Items** | `GET` | `/api/lost-items/{id}` | Retrieve lost report details | Public |
| **Lost Items** | `POST` | `/api/lost-items` | File lost report (JSON payload) | Authenticated |
| **Lost Items** | `POST` | `/api/lost-items/with-images` | File lost report with photos (Multipart) | Authenticated |
| **Lost Items** | `POST` | `/api/lost-items/{id}/images` | Attach photos to existing report | Owner/Admin |
| **Lost Items** | `PUT` | `/api/lost-items/{id}` | Update report details | Owner/Admin |
| **Lost Items** | `PATCH` | `/api/lost-items/{id}/status` | Update status (`ACTIVE`, `RESOLVED`, `CANCELLED`)| Owner/Admin |
| **Lost Items** | `DELETE`| `/api/lost-items/{id}` | Delete report | Owner/Admin |
| **Found Items** | `GET` | `/api/found-items` | Public search, filter by category/city/keyword | Public |
| **Found Items** | `GET` | `/api/found-items/{id}` | Retrieve found report details | Public |
| **Found Items** | `POST` | `/api/found-items` | File found report (JSON payload) | Authenticated |
| **Found Items** | `POST` | `/api/found-items/with-images` | File found report with photos (Multipart) | Authenticated |
| **Found Items** | `PUT` | `/api/found-items/{id}` | Update found report | Owner/Admin |
| **Matches** | `GET` | `/api/matches/lost/{lostItemId}` | Query ranked candidate matches for lost item | Authenticated |
| **Matches** | `GET` | `/api/matches/found/{foundItemId}`| Query ranked candidate matches for found item | Authenticated |
| **Matches** | `PATCH`| `/api/matches/{matchId}/status` | Update candidate status (`CONFIRMED`, `REJECTED`) | Authenticated |
| **Claims** | `POST` | `/api/claims` | Submit ownership claim with proof & answers | Authenticated |
| **Claims** | `GET` | `/api/claims/my` | List claimant's active claims | Authenticated |
| **Claims** | `GET` | `/api/claims/found/{foundItemId}`| View all claims on a found item | Custodian/Admin |
| **Claims** | `PATCH`| `/api/claims/{claimId}/review` | Approve/reject claim with notes | Custodian/Admin |
| **Notifications**| `GET` | `/api/notifications` | Paginated user notifications | Authenticated |
| **Notifications**| `GET` | `/api/notifications/unread-count`| Get unread badge count | Authenticated |
| **Notifications**| `PATCH`| `/api/notifications/{id}/read` | Mark alert as read | Authenticated |
| **Images** | `GET` | `/api/images/{filename}` | Stream stored item image | Public |

---

## 8. Test Suite Verification & Quality Metrics

Automated test execution via `mvn clean test`:

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.lostfound.controller.AuthControllerTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.lostfound.controller.LostItemControllerTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.lostfound.LostFoundApplicationTests
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.lostfound.ml.VectorSimilarityTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.lostfound.service.MatchingEngineTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] Results:
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

All 10 tests passed covering security filters, JWT issuance, database persistence, vector mathematics, dynamic weight rebalancing, and API response structures.
