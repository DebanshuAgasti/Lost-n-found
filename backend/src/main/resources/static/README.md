# LostRadar AI — Next-Gen Frontend UI

A modern Gen Z design single-page application built for the **Lost & Found Management Platform**, connecting to the Spring Boot 3.3.4 REST & AI backend.

---

## 🎨 Design System & Aesthetics
- **Typography**: 
  - Headings: `Outfit` (bold, expressive, modern)
  - Body: `Plus Jakarta Sans` (ultra-readable, contemporary)
  - Data / Tokens / JSON: `JetBrains Mono`
- **Palette**: Sleek dark space theme (`#080c15`) accented with neon violet (`#8b5cf6`), electric indigo (`#6366f1`), cyber cyan (`#06b6d4`), emerald green (`#10b981`), and hot coral (`#f43f5e`).
- **Surface**: Glassmorphism cards with `backdrop-filter: blur(16px)`, translucent pill badges, and radial background gradient glows.

---

## 🚀 Key Functional Views

1. **📊 Intelligent Dashboard**:
   - Hero spotlight with quick actions: Report Lost, Report Found, AI Auto-Extract.
   - Live metrics strip (Active Lost, Recovered Items, Candidate Matches, AI Accuracy).
   - High-priority radar match banner and dual recent-activity feeds.

2. **🔍 Lost Items Feed**:
   - Interactive search bar with instant query matching (title, brand, model, location).
   - Category filter pills (All, Electronics, Wallets, Bags, ID/Keys, Other).
   - Reward badges, physical tags, and "Radar Match" quick action.

3. **📦 Found Items Feed**:
   - Custody tracking showing secure storage lockers and custodian names.
   - Secret verification question indicators.
   - "Claim Item" trigger modal.

4. **🎯 Candidate Match Radar**:
   - Visualizes the backend's **6-Dimensional Multimodal Matching Engine**:
     1. Visual Cosine Embedding Similarity (35%)
     2. Category Compatibility (20%)
     3. Physical Attributes & Marks (20%)
     4. Text Semantic Correlation (10%)
     5. Geographic Proximity (10%)
     6. Chronological Timeline (5%)
   - Side-by-side comparison of lost vs found item photos and metadata.
   - AI Deep Match Explanation detailing supporting factors, discrepancies, and recommendation.

5. **📑 Custody & Claims Center**:
   - Review ownership claims with secret challenge answers.
   - AI Claim Verification results (`LIKELY_MATCH`, confidence score, verifiable evidence).
   - Actions to Approve or Reject claims with live toast feedback.

6. **🤖 AI Intelligence Hub**:
   - **Multimodal Vision Extractor**: Upload/drop item photos (or select quick presets) to extract category, brand, model, color, marks, damage, and protective accessories. Features a "Apply to New Report" button that pre-populates the reporting form!
   - **Natural Language Report Parser**: Convert spoken/written reports into structured JSON entities with an "Auto-Fill Form" button.

7. **⚡ Dual-Mode Connectivity**:
   - Live proxying to Spring Boot (`/api`) on `http://localhost:8080`.
   - Automatic graceful fallback to realistic seed records (`mock-data.js`) when offline.

---

## 🛠️ How to Run

### Option 1: Via Spring Boot (Zero Setup)
The frontend assets are embedded in `backend/src/main/resources/static/`. Once the Spring Boot application is started (`mvn spring-boot:run`), navigate to:
```
http://localhost:8080/
```

### Option 2: Standalone Vite Dev Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000/`. Vite proxies `/api` calls directly to `http://localhost:8080`.
