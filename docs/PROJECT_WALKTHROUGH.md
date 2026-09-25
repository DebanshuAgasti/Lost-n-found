# Lost & Found Platform — End-to-End Project Walkthrough

This guide walks you through launching, testing, and interacting with the **Lost & Found Backend API**, from zero-setup local execution to a complete lost-item recovery scenario.

---

## 1. Quickstart & Launching the Backend

### Prerequisites
* **Java 21** or later (`java -version`)
* **Maven 3.9** or later (`mvn -version`)

### Option A: Local Dev Mode (Recommended — Zero Setup)
The `dev` profile runs an in-memory database with preloaded test users, lost items, found items, and pre-computed candidate matches.
```bash
cd backend
mvn spring-boot:run
```
The service will start on port `8080`:
* **REST API**: `http://localhost:8080`
* **Swagger UI (Interactive API Docs)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **OpenAPI 3.0 JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
* **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  * **JDBC URL**: `jdbc:h2:mem:lostfounddb`
  * **Username**: `sa`
  * **Password**: *(leave blank)*

### Option B: Running with PostgreSQL
To connect to an external PostgreSQL database:
```bash
SPRING_PROFILES_ACTIVE=postgres \
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=lostfound_db \
DB_USER=postgres \
DB_PASSWORD=your_password \
mvn spring-boot:run
```

---

## 2. Pre-Seeded Test Credentials

When starting in `dev` mode, the database is pre-populated with:

| User | Email | Password | Role | Description |
|---|---|---|---|---|
| **Alex Mercer** | `alex@example.com` | `password123` | `ROLE_USER` | Lost iPhone 15 Pro reporter |
| **Sarah Chen** | `sarah@example.com` | `password123` | `ROLE_USER` | Found Apple smartphone discoverer |
| **Administrator** | `admin@example.com` | `admin123` | `ROLE_ADMIN` | Campus security / Platform admin |

---

## 3. End-to-End Walkthrough Scenario: Recovering a Lost iPhone

### Step 1: Authenticate as Alex Mercer (Lost Item Owner)
```bash
ALEX_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "password123"
  }' | jq -r '.data.token')

echo "Alex Token: ${ALEX_TOKEN:0:30}..."
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "email": "alex@example.com",
      "fullName": "Alex Mercer",
      "role": "ROLE_USER"
    }
  }
}
```

---

### Step 2: Publicly Browse Lost & Found Listings
Anyone can search and filter reports without logging in:
```bash
curl -s "http://localhost:8080/api/lost-items?category=ELECTRONICS&city=Seattle" | jq .
```

---

### Step 3: File a New Lost Item Report (with Image & Attributes)
Alex reports a lost item with fine-grained characteristics (brand, model, case details, sticker, hairline scratch):

```bash
curl -s -X POST http://localhost:8080/api/lost-items \
  -H "Authorization: Bearer $ALEX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Black iPhone 15 Pro in Dark Blue Silicone Case",
    "description": "Left on 2nd floor desk of Central Library near study carrels.",
    "category": "ELECTRONICS",
    "lostDate": "2026-09-25",
    "lostTime": "14:30:00",
    "locationName": "Central Campus Library - 2nd Floor",
    "address": "100 University Avenue",
    "city": "Seattle",
    "latitude": 47.6553,
    "longitude": -122.3035,
    "rewardAmount": 50.00,
    "contactPreference": "EMAIL",
    "contactEmail": "alex@example.com",
    "attributes": {
      "brand": "Apple",
      "model": "iPhone 15 Pro",
      "primaryColor": "Black",
      "secondaryColor": "Blue",
      "scratchesOrDamage": "Tiny hairline scratch on top-right bezel",
      "stickersOrAccessories": "Blue silicone MagSafe case with small NASA sticker on bottom left"
    }
  }' | jq .
```

---

### Step 4: Sarah Finds the Item and Reports It
Now, log in as Sarah and file a found item report:
```bash
SARAH_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@example.com",
    "password": "password123"
  }' | jq -r '.data.token')

curl -s -X POST http://localhost:8080/api/found-items \
  -H "Authorization: Bearer $SARAH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Apple Smartphone with Dark Case",
    "description": "Discovered on study table in library. Dark blue case with a space/rocket sticker.",
    "category": "ELECTRONICS",
    "foundDate": "2026-09-26",
    "foundTime": "15:00:00",
    "locationName": "Central Library Study Hall",
    "address": "100 University Avenue",
    "city": "Seattle",
    "latitude": 47.6555,
    "longitude": -122.3033,
    "storageLocation": "Campus Security Desk 2",
    "currentCustodian": "Officer Miller",
    "verificationQuestion": "What unique sticker is on the back or what lock screen is set?",
    "attributes": {
      "brand": "Apple",
      "model": "iPhone",
      "primaryColor": "Dark Gray / Black",
      "secondaryColor": "Blue",
      "stickersOrAccessories": "Silicone case with round NASA sticker"
    }
  }' | jq .
```
> [!NOTE]
> The moment Sarah creates this report, a Spring `FoundItemCreatedEvent` is published. The [`CandidateMatchService`](file:///mnt/01DC03F70F167E10/Codes/project/L&F/backend/src/main/java/com/lostfound/service/CandidateMatchService.java) automatically executes the multimodal scoring pipeline against all active lost items and persists the candidate match.

---

### Step 5: Query AI Candidate Matches & Score Breakdown
Alex checks the matches for his lost iPhone:
```bash
curl -s -H "Authorization: Bearer $ALEX_TOKEN" \
  http://localhost:8080/api/matches/lost/1 | jq .
```

**Real Response from the Matching Engine**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "lostItemId": 1,
      "foundItemId": 1,
      "overallScore": 0.699,
      "breakdown": {
        "visualScore": 0.553,
        "categoryScore": 1.0,
        "attributesScore": 0.586,
        "textScore": 0.385,
        "locationScore": 1.0,
        "temporalScore": 1.0,
        "explanation": "Exact category match. Close geographical proximity. Timing aligns closely with report date."
      },
      "status": "POTENTIAL"
    }
  ]
}
```

* **Category (1.0)**: Exact category match (`ELECTRONICS`).
* **Visual (0.553)**: Cosine similarity on the image embeddings.
* **Attributes (0.586)**: Overlap in brand ("Apple"), colors (Black/Blue), and manual features ("NASA sticker").
* **Location (1.0)**: Same library building (Haversine distance < 50 meters).
* **Temporal (1.0)**: Found 1 day after loss.

---

### Step 6: Submit an Ownership Claim
Alex confirms the match and submits an ownership claim answering Sarah's verification question:
```bash
curl -s -X POST http://localhost:8080/api/claims \
  -H "Authorization: Bearer $ALEX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foundItemId": 1,
    "lostItemId": 1,
    "proofDescription": "I can unlock it using FaceID or passcode 981245. The lock screen wallpaper is James Webb telescope deep space photo.",
    "verificationAnswers": "The sticker on the bottom left is a blue circle NASA worm logo sticker.",
    "proofImageUrls": "https://example.com/receipt-iphone15.jpg"
  }' | jq .
```
* Status moves to: `SUBMITTED`.
* The found item's status transitions to: `CLAIM_PENDING`.
* A notification is dispatched to Sarah.

---

### Step 7: Custodian / Admin Reviews & Approves the Claim
Sarah or Officer Miller logs in and reviews Alex's claim:
```bash
curl -s -X PATCH http://localhost:8080/api/claims/1/review \
  -H "Authorization: Bearer $SARAH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "reviewerNotes": "Passcode and wallpaper verified by Security Officer Miller at Desk 2. Handover scheduled."
  }' | jq .
```
* Claim status: `APPROVED`.
* Found item status: `CLAIMED`.
* Lost item status: `RESOLVED`.
* Both parties receive automated notifications.

---

### Step 8: Alex Checks Notifications
```bash
curl -s -H "Authorization: Bearer $ALEX_TOKEN" \
  http://localhost:8080/api/notifications | jq .
```
Alex sees:
* Notification 1: *"Possible Match Found!"* (Confidence: 70%)
* Notification 2: *"Claim Approved! Your claim for 'Apple Smartphone with Dark Case' has been approved. Review details to arrange handover."*

---

## 4. Using the Interactive Swagger UI

1. Open [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) in your browser.
2. Click the **Authorize** button (top right).
3. Call `POST /api/auth/login` with `alex@example.com` / `password123`.
4. Copy the `data.token` from the response body.
5. Paste it into the Authorize modal (Bearer format).
6. You can now execute all protected endpoints interactively.

---

## 5. Running the Automated Test Suite

Run the full suite of unit and integration tests:
```bash
cd backend
mvn clean test
```
**Test Summary**:
* `AuthControllerTest`: Verifies registration, JWT authentication, and rejection of bad credentials.
* `LostItemControllerTest`: Verifies report creation with JWT and public unauthenticated search filtering.
* `VectorSimilarityTest`: Verifies cosine calculations on identical, orthogonal, and opposite vectors.
* `MatchingEngineTest`: Verifies multimodal composite scores, category gating, and dynamic weight rebalancing when images are missing.
* `LostFoundApplicationTests`: Verifies Spring Boot 3 context bootstrapping.
