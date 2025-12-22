# Research: RAG Retrieval API

**Feature**: 005-rag-retrieval-api
**Date**: 2025-12-14

## Research Questions

1. FastAPI application structure for simple APIs
2. Error handling patterns in FastAPI
3. Pydantic model best practices
4. Integration pattern for Cohere + Qdrant + Postgres

## Findings

### 1. FastAPI Application Structure

**Decision**: Single-file FastAPI application in `scripts/api.py`

**Rationale**:
- Follows existing project pattern (single-file scripts)
- Simplicity-First principle (Constitution I)
- Small API surface (2 endpoints) doesn't warrant complex structure
- Easy to understand and modify

**Alternatives Considered**:
- Multi-file structure with routers: Rejected (over-engineering for 2 endpoints)
- Separate src/ directory: Rejected (inconsistent with existing scripts/)

**Implementation Pattern**:
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="RAG Retrieval API")

@app.get("/health")
async def health(): ...

@app.post("/search")
async def search(request: SearchRequest): ...
```

### 2. Error Handling Strategy

**Decision**: HTTPException with structured error responses

**Rationale**:
- FastAPI native pattern
- Automatic OpenAPI documentation
- Clear HTTP status codes per spec requirements

**Error Code Mapping**:
| Error Condition | HTTP Code | Error Type |
|----------------|-----------|------------|
| Empty query | 400 | validation_error |
| Invalid top_k | 400 | validation_error |
| Query too long | 400 | validation_error |
| Embedding service failure | 502 | upstream_error |
| Qdrant unavailable | 503 | service_unavailable |
| Postgres unavailable | 503 | service_unavailable |

**Implementation Pattern**:
```python
from fastapi import HTTPException

class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": str(exc)}
    )
```

### 3. Pydantic Model Design

**Decision**: Strict validation with clear defaults

**Rationale**:
- Automatic request validation
- Self-documenting API
- Type safety

**Models Required**:

1. **SearchRequest**: Input validation
   - query: str (min_length=1, max_length=500)
   - top_k: int (default=5, ge=1, le=20)

2. **SearchResult**: Individual result item
   - chunk_id: str
   - snippet: str
   - source_path: str
   - slug: str
   - title: Optional[str]
   - score: float

3. **SearchResponse**: Full response
   - query: str
   - results: List[SearchResult]

4. **HealthResponse**: Health check response
   - status: str
   - qdrant: bool
   - postgres: bool

### 4. Service Integration Pattern

**Decision**: Lazy initialization with global clients

**Rationale**:
- Avoid connection overhead per request
- Follow existing script patterns
- Simple startup sequence

**Integration Flow**:
```
1. Load environment variables (.env)
2. Initialize Cohere client (lazy)
3. Initialize Qdrant client (lazy)
4. Initialize Postgres connection (lazy)
```

**Search Pipeline**:
```
Request → Validate → Embed Query → Vector Search → Metadata Join → Response
```

**Metadata Join Strategy**:
- Vector search returns: chunk_id, score, snippet (from payload)
- Postgres provides: source_path, slug, title
- Join by chunk_id, preserve vector score ordering

**Optimization**: Use Qdrant payload for snippet (already stored) instead of fetching from Postgres. Only fetch source metadata from Postgres.

### 5. Logging Strategy

**Decision**: Python logging with structured output

**Rationale**:
- Constitution VIII requires health checks + logging
- Simple implementation
- Railway/Vercel compatible

**Log Events**:
- Request received (query, top_k)
- Search completed (duration, result_count)
- Errors (type, message)

### 6. Async vs Sync

**Decision**: Synchronous handlers (blocking I/O)

**Rationale**:
- Existing scripts use synchronous clients
- Simpler implementation
- Uvicorn handles concurrency at worker level
- 10 concurrent requests achievable with sync handlers

**Alternative Considered**:
- Async handlers with async clients: Rejected (requires rewriting client initialization, minimal benefit for our scale)

## Dependencies

**Required Packages**:
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
cohere>=4.0.0          # Already installed
qdrant-client>=1.6.0   # Already installed
psycopg2-binary>=2.9.0 # Already installed
python-dotenv>=1.0.0   # Already installed
pydantic>=2.0.0        # Included with FastAPI
```

**New Packages to Install**:
- fastapi
- uvicorn[standard]

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Qdrant timeout | 5-second timeout, 503 on failure |
| Postgres connection loss | Connection retry, 503 on failure |
| Cohere API rate limit | Existing retry pattern from embed-vectors.py |
| Large query strings | Pydantic validation (max 500 chars) |
| top_k abuse | Cap at 20 per spec |

## Conclusion

The implementation follows established patterns from existing scripts while adding FastAPI-specific error handling and validation. Key decisions prioritize simplicity and alignment with Constitution principles.
