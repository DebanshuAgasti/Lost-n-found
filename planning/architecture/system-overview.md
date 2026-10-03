# L&F System Overview

## Product
A Lost & Found platform matching lost-item reports with found-item reports.

## Clients
### Phase 1
Web application using Next.js.

### Phase 2
Mobile application using the same backend/API.

## Backend
The backend should be independently runnable and testable before the frontend is implemented.

Core responsibilities:
- authentication and authorization
- lost-item reports
- found-item reports
- image upload/processing
- structured metadata
- embedding generation
- vector similarity retrieval
- candidate matching/ranking
- notifications and status changes

## Data architecture

PostgreSQL:
- users
- lost reports
- found reports
- item metadata
- locations
- timestamps
- report status
- ownership/claim information
- audit/application state

Vector search:
- image embeddings
- potentially text embeddings
- nearest-neighbor retrieval for visually/semantically similar candidates

The two systems are complementary rather than substitutes.

## Matching concept

A candidate match can combine:
- image similarity
- text/description similarity
- item category
- color/brand/model characteristics
- location proximity
- time relationship
- user-provided distinguishing features

The final score should be a ranking signal, not an automatic proof of ownership.
