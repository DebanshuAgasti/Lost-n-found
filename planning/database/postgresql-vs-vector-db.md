# PostgreSQL vs Vector Database

## PostgreSQL is the system of record

Use PostgreSQL for information that needs:
- exact querying
- transactions
- relationships
- constraints
- updates
- authentication/user data
- report lifecycle/status
- locations and timestamps
- ownership and claims

Examples:
`users`, `lost_items`, `found_items`, `item_attributes`, `locations`, `claims`, `notifications`.

## Vector search is for similarity

A vector database/index is optimized for:
- nearest-neighbor search
- finding visually or semantically similar items
- retrieving candidate matches from embeddings

Examples:
- image embeddings
- text embeddings
- multimodal embeddings

## Recommended relationship

PostgreSQL remains authoritative.

The vector layer stores/retrieves embeddings and candidate IDs. The application then uses PostgreSQL to retrieve authoritative records and apply structured constraints.

This architecture also makes it possible to start with PostgreSQL plus a vector extension such as pgvector and move to a separate vector database later if scale requires it.
