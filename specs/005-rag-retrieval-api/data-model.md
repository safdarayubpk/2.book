# Data Model: RAG Retrieval API

**Feature**: 005-rag-retrieval-api
**Date**: 2025-12-14

## Overview

Pydantic models for request/response validation in the FastAPI retrieval service.

## Request Models

### SearchRequest

Input model for semantic search queries.

```python
from pydantic import BaseModel, Field

class SearchRequest(BaseModel):
    """Search request with query and optional parameters."""
    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Natural language search query"
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of results to return (1-20, default 5)"
    )
```

**Validation Rules**:
- `query`: Required, 1-500 characters, cannot be empty or whitespace-only
- `top_k`: Optional, integer 1-20, defaults to 5

**Example**:
```json
{
  "query": "What is physical AI?",
  "top_k": 5
}
```

## Response Models

### SearchResult

Individual result item with metadata and relevance score.

```python
from typing import Optional

class SearchResult(BaseModel):
    """Single search result with metadata."""
    chunk_id: str = Field(..., description="Unique chunk identifier")
    snippet: str = Field(..., description="Text content of the chunk")
    source_path: str = Field(..., description="Source file path")
    slug: str = Field(..., description="URL-friendly identifier")
    title: Optional[str] = Field(None, description="Document title")
    score: float = Field(..., ge=0, le=1, description="Relevance score (0-1)")
```

**Fields**:
| Field | Type | Source | Description |
|-------|------|--------|-------------|
| chunk_id | str | Qdrant payload | Unique identifier (e.g., "doc-001-0001") |
| snippet | str | Qdrant payload | Chunk text content |
| source_path | str | Postgres | File path (e.g., "docs/chapter-1/index.md") |
| slug | str | Postgres | URL slug (e.g., "chapter-1-index") |
| title | str? | Postgres | Document title (may be null) |
| score | float | Qdrant | Cosine similarity score (0-1) |

### SearchResponse

Full response containing query and results array.

```python
from typing import List

class SearchResponse(BaseModel):
    """Search response with query echo and results."""
    query: str = Field(..., description="Original search query")
    results: List[SearchResult] = Field(
        default_factory=list,
        description="Ranked search results"
    )
```

**Example**:
```json
{
  "query": "What is physical AI?",
  "results": [
    {
      "chunk_id": "doc-001-0001",
      "snippet": "Physical AI represents a fundamental shift...",
      "source_path": "docs/chapter-1/index.md",
      "slug": "chapter-1-index",
      "title": "Introduction to Physical AI",
      "score": 0.87
    }
  ]
}
```

### HealthResponse

Service health status response.

```python
class HealthResponse(BaseModel):
    """Health check response with dependency status."""
    status: str = Field(..., description="Overall status (ok/degraded/error)")
    qdrant: bool = Field(..., description="Qdrant connectivity status")
    postgres: bool = Field(..., description="Postgres connectivity status")
```

**Example**:
```json
{
  "status": "ok",
  "qdrant": true,
  "postgres": true
}
```

### ErrorResponse

Standardized error response format.

```python
class ErrorResponse(BaseModel):
    """Standardized error response."""
    error: str = Field(..., description="Error type identifier")
    message: str = Field(..., description="Human-readable error message")
```

**Error Types**:
| error | HTTP Code | Description |
|-------|-----------|-------------|
| validation_error | 400 | Invalid request parameters |
| upstream_error | 502 | Embedding service failure |
| service_unavailable | 503 | Database/vector store unreachable |
| internal_error | 500 | Unexpected server error |

**Example**:
```json
{
  "error": "validation_error",
  "message": "Query cannot be empty"
}
```

## Data Flow

```
Request (SearchRequest)
    ↓
Validation (Pydantic)
    ↓
Query Embedding (Cohere)
    ↓
Vector Search (Qdrant) → chunk_id, snippet, score
    ↓
Metadata Lookup (Postgres) → source_path, slug, title
    ↓
Join Results (by chunk_id)
    ↓
Response (SearchResponse)
```

## Database Schema Reference

The API queries the existing `documents` table (created in Spec-004):

```sql
CREATE TABLE documents (
    chunk_id      VARCHAR(50)   PRIMARY KEY,
    source_path   TEXT          NOT NULL,
    slug          VARCHAR(100)  NOT NULL,
    title         VARCHAR(255),
    order_index   INTEGER       NOT NULL,
    snippet       TEXT          NOT NULL,
    created_at    TIMESTAMP     DEFAULT NOW()
);
```

**Query for Metadata Join**:
```sql
SELECT chunk_id, source_path, slug, title
FROM documents
WHERE chunk_id = ANY($1)
```

## Qdrant Payload Reference

The API reads from existing vector payload (created in Spec-003):

```python
payload = {
    "chunk_id": "doc-001-0001",
    "text": "Physical AI represents...",  # Used as snippet
    "source_path": "docs/chapter-1/index.md",
    "slug": "chapter-1-index",
    "title": "Introduction to Physical AI",
    "order_index": 1
}
```

**Optimization Note**: Qdrant payload already contains all needed fields. Postgres lookup is optional for additional validation but not strictly required for MVP.
