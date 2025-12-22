# Data Model: Embeddings Generation & Vector Storage

**Feature**: 003-rag-vector-embeddings
**Date**: 2025-12-13

## Entities

### Chunk (Input)

Represents a text segment from chunks.json, produced by spec-002.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| chunk_id | string | Stable unique identifier | `doc-001-0001` |
| text | string | Clean prose content | `"Physical AI represents..."` |
| source_path | string | Path to source markdown file | `docs/chapter-1/index.md` |
| slug | string | URL-friendly document identifier | `chapter-1-index` |
| title | string | Document title | `Introduction to Physical AI` |
| order_index | integer | 1-based position within document | `1` |

**Source**: `data/chunks.json`
**Schema**: Defined in spec-002 contracts

---

### Embedding

Represents the vector representation of a chunk's text content.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| chunk_id | string | Reference to source chunk | `doc-001-0001` |
| vector | float[1024] | Cohere embedding vector | `[0.0234, -0.0156, ...]` |
| model | string | Embedding model used | `embed-english-v3.0` |
| input_type | string | Cohere input type parameter | `search_document` |

**Validation Rules**:
- Vector MUST have exactly 1024 dimensions
- Vector values MUST be normalized floats
- chunk_id MUST reference valid chunk from chunks.json

**Lifecycle**:
1. Chunk loaded from chunks.json
2. Text sent to Cohere API
3. Embedding vector returned
4. Vector stored in Qdrant

---

### VectorPoint (Qdrant)

Represents a stored vector in the Qdrant collection.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | integer | Deterministic ID from chunk_id hash | `8734521098234567` |
| vector | float[1024] | Cohere embedding vector | `[0.0234, -0.0156, ...]` |
| payload | object | Chunk metadata | See below |

**Payload Structure**:
```json
{
  "chunk_id": "doc-001-0001",
  "text": "Physical AI represents...",
  "source_path": "docs/chapter-1/index.md",
  "slug": "chapter-1-index",
  "title": "Introduction to Physical AI",
  "order_index": 1
}
```

**Validation Rules**:
- id MUST be deterministic (same chunk_id always produces same id)
- payload MUST include all 6 fields (chunk_id, text, source_path, slug, title, order_index)
- vector dimensions MUST match collection configuration (1024)

---

### SearchResult

Represents a result from semantic similarity search.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | integer | Qdrant point ID | `8734521098234567` |
| score | float | Cosine similarity score (0-1) | `0.8523` |
| payload | object | Full chunk metadata + text | See VectorPoint payload |

**Returned Fields**:
- `score`: Higher is more similar (cosine similarity)
- `payload.text`: Full chunk text for display
- `payload.chunk_id`: For reference/debugging
- `payload.title`: For citation display
- `payload.source_path`: For source attribution

---

### QdrantCollection

Represents the vector collection configuration.

| Field | Type | Description | Value |
|-------|------|-------------|-------|
| name | string | Collection identifier | `book_vectors` |
| vector_size | integer | Embedding dimensions | `1024` |
| distance | enum | Similarity metric | `COSINE` |

**Configuration**:
```python
from qdrant_client.models import Distance, VectorParams

collection_config = VectorParams(
    size=1024,
    distance=Distance.COSINE
)
```

---

## Entity Relationships

```text
┌─────────────────┐
│  chunks.json    │
│  (Input File)   │
└────────┬────────┘
         │
         │ contains N
         ▼
┌─────────────────┐
│     Chunk       │
├─────────────────┤
│ chunk_id        │──────────┐
│ text            │          │
│ source_path     │          │
│ slug            │          │
│ title           │          │
│ order_index     │          │
└────────┬────────┘          │
         │                   │
         │ 1:1 embedding     │
         ▼                   │
┌─────────────────┐          │
│   Embedding     │          │
├─────────────────┤          │
│ chunk_id     ───┼──────────┤
│ vector[1024]    │          │
│ model           │          │
└────────┬────────┘          │
         │                   │
         │ stored as         │
         ▼                   │
┌─────────────────┐          │
│  VectorPoint    │          │
├─────────────────┤          │
│ id (hash)       │          │
│ vector          │          │
│ payload      ───┼──────────┘
└────────┬────────┘
         │
         │ N:1
         ▼
┌─────────────────┐
│ QdrantCollection│
├─────────────────┤
│ name            │
│ vector_size     │
│ distance        │
└─────────────────┘
         │
         │ queried by
         ▼
┌─────────────────┐
│  SearchResult   │
├─────────────────┤
│ id              │
│ score           │
│ payload         │
└─────────────────┘
```

---

## Data Flow

### Embedding Pipeline

```text
[chunks.json] ──▶ [Load & Validate] ──▶ [Batch Chunks]
                                              │
                                              ▼
                                    [Cohere Embed API]
                                              │
                                              ▼
                                    [Generate Embeddings]
                                              │
                                              ▼
                                    [Build VectorPoints]
                                              │
                                              ▼
                                    [Qdrant Upsert]
                                              │
                                              ▼
                                    [Log Summary]
```

### Search Flow

```text
[Query Text] ──▶ [Cohere Embed (search_query)]
                           │
                           ▼
                 [Query Vector 1024-dim]
                           │
                           ▼
                 [Qdrant Search (top-k)]
                           │
                           ▼
                 [SearchResults with Scores]
                           │
                           ▼
                 [Display Results]
```

---

## Type Definitions (Python)

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Chunk:
    chunk_id: str
    text: str
    source_path: str
    slug: str
    title: str
    order_index: int

@dataclass
class Embedding:
    chunk_id: str
    vector: List[float]
    model: str = "embed-english-v3.0"
    input_type: str = "search_document"

@dataclass
class VectorPayload:
    chunk_id: str
    text: str
    source_path: str
    slug: str
    title: str
    order_index: int

@dataclass
class SearchResult:
    id: int
    score: float
    payload: VectorPayload
```
