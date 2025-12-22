# Implementation Plan: RAG Retrieval API

**Branch**: `005-rag-retrieval-api` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-rag-retrieval-api/spec.md`

## Summary

Implement a FastAPI service that provides semantic search over book content by combining Cohere query embeddings, Qdrant vector similarity search, and Neon Postgres metadata lookup. The API exposes two endpoints: `POST /search` for semantic retrieval and `GET /health` for service status.

## Technical Context

**Language/Version**: Python 3.x (matching existing scripts)
**Primary Dependencies**: fastapi, uvicorn, cohere, qdrant-client, psycopg2-binary, python-dotenv, pydantic
**Storage**: Qdrant Cloud (vectors), Neon PostgreSQL (metadata)
**Testing**: Manual verification via curl/Postman (per spec constraints)
**Target Platform**: Linux/macOS development, Railway deployment
**Project Type**: Single project (API service following existing scripts pattern)
**Performance Goals**: < 2 seconds per search, < 10 seconds startup, 10 concurrent requests
**Constraints**: Must stay within free tier limits for Qdrant, Neon, Railway
**Scale/Scope**: 15 chunks (current), designed for hundreds

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | ✅ Pass | Single FastAPI file, no ORM, minimal dependencies |
| II. Mobile-Ready Performance | ✅ N/A | Backend API, not user-facing |
| III. RAG Accuracy | ✅ Supports | Core retrieval service for RAG pipeline |
| IV. Personalization-Driven | ✅ N/A | Infrastructure feature |
| V. Free-Tier Compliance | ✅ Pass | All services within free tier |
| VI. Educational Focus | ✅ N/A | Backend infrastructure |
| VII. AI-Native Experience | ✅ Supports | Powers AI chatbot retrieval (< 2s latency) |
| VIII. Rapid Deployment | ✅ Pass | Single Python file, Railway-ready |

## Project Structure

### Documentation (this feature)

```text
specs/005-rag-retrieval-api/
├── plan.md              # This file
├── research.md          # Phase 0 output (FastAPI patterns, error handling)
├── data-model.md        # Phase 1 output (Pydantic models)
├── quickstart.md        # Phase 1 output (setup and usage guide)
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
scripts/
├── embed-vectors.py     # Existing: vectors to Qdrant
├── search-vectors.py    # Existing: semantic search CLI
├── store-metadata.py    # Existing: metadata to Neon Postgres
└── api.py               # New: FastAPI retrieval service
```

**Structure Decision**: Single `scripts/api.py` file for the FastAPI service. Follows established pattern from existing scripts. No separate tests directory for this feature (verification via curl per spec).

## Complexity Tracking

> **No violations to document**

The implementation follows all constitution principles without requiring complexity justifications.

## Implementation Overview

### Phase 1: Core Infrastructure

1. **FastAPI Setup**
   - Install FastAPI and Uvicorn dependencies
   - Create `scripts/api.py` with FastAPI app instance
   - Implement environment variable loading (reuse pattern from existing scripts)

2. **Health Check Endpoint**
   - `GET /health` returns service status
   - Verify Qdrant and Postgres connectivity

3. **Search Endpoint Foundation**
   - `POST /search` accepts query and optional top_k
   - Pydantic models for request/response validation

### Phase 2: Search Pipeline Integration

4. **Query Embedding**
   - Reuse Cohere embedding pattern from `search-vectors.py`
   - Generate query embedding with `input_type="search_query"`

5. **Vector Search**
   - Reuse Qdrant query pattern from `search-vectors.py`
   - Retrieve top-k results with payload

6. **Metadata Join**
   - Query Neon Postgres for metadata by chunk_ids
   - Join vector scores with database metadata

### Phase 3: Response Assembly

7. **Response Construction**
   - Build structured JSON response per spec schema
   - Include all required fields: chunk_id, snippet, source_path, slug, title, score

8. **Error Handling**
   - Standardized error responses with appropriate HTTP codes
   - Handle empty queries, connectivity failures, embedding errors

### Phase 4: Validation & Logging

9. **Request Logging**
   - Log query text and response time
   - Use Python logging module

10. **Manual Testing**
    - Verify `/health` endpoint
    - Test `/search` with known queries
    - Validate top_k parameter behavior

## Artifacts Generated

| Artifact | Status | Purpose |
|----------|--------|---------|
| research.md | ✅ Complete | FastAPI patterns and decisions |
| data-model.md | ✅ Complete | Pydantic model definitions |
| quickstart.md | ✅ Complete | Setup and usage guide |
| contracts/ | ✅ Complete | OpenAPI specification |
| tasks.md | ✅ Complete | Implementation tasks (37 tasks) |

## Next Steps

Run `/speckit.implement` to begin implementation.
