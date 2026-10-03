# L&F — Local Project Export

Export date: 2026-09-12

## What this archive contains

This is a local working archive reconstructed from the L&F project context available in the current ChatGPT session.

It includes:
- project direction and architecture notes
- database/vector-search discussion
- ML/image-matching discussion
- frontend/backend direction
- a record of the recent project conversations visible in this session

## Important limitation

This is NOT a raw export of every historical ChatGPT message in the L&F project. The current session exposes summaries/snippets of recent project conversations rather than their complete transcripts.

For a complete archival copy of every chat, use ChatGPT's official data export and place the exported conversation files under `chats/`. This archive is designed to be the clean, human-readable project layer on top of that raw export.

## Current project direction

L&F is a Lost & Found platform:
- Website first, mobile application later.
- Shared backend/API so web and mobile can use the same core services.
- Next.js is the current frontend direction.
- Backend should be developed and tested independently before the frontend.
- PostgreSQL and vector search have complementary roles.
- Image matching is intended to help identify likely matches between lost and found item reports.
- User-entered item characteristics are optional but can improve matching, especially when images are blurry, low-light, or otherwise ambiguous.
- An open-source model is being considered, with cloud hosting as an option.

## Suggested next engineering phase

1. Define the domain model and PostgreSQL schema.
2. Define the backend API contract.
3. Build backend services and automated tests without a frontend.
4. Add image ingestion and embedding generation.
5. Add vector similarity search plus structured PostgreSQL filtering.
6. Build the matching/ranking pipeline.
7. Build the Next.js web client.
8. Add a mobile client later against the same backend.
