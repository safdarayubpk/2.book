# Research: Embeddings Generation & Vector Storage for RAG Pipeline

**Feature**: 003-rag-vector-embeddings
**Date**: 2025-12-13
**Status**: Complete

## Research Questions

### 1. Cohere Embedding Model Selection

**Decision**: `embed-english-v3.0` with `input_type="search_document"` for indexing

**Rationale**:
- Cohere's v3.0 models are their latest and most accurate
- `embed-english-v3.0` produces 1024-dimensional vectors
- Supports `input_type` parameter for optimal embedding based on use case
- Free tier allows 1000 API calls/month (sufficient for ~15 chunks)
- Better semantic understanding than older models

**Alternatives Considered**:
- `embed-english-light-v3.0`: 384 dimensions, faster but less accurate
- `embed-multilingual-v3.0`: Overkill for English-only content
- OpenAI embeddings: Excluded by constraints

**Implementation Notes**:
- Use `input_type="search_document"` when embedding chunks
- Use `input_type="search_query"` when embedding search queries
- This asymmetric approach improves retrieval accuracy

---

### 2. Qdrant Collection Configuration

**Decision**: Collection `book_vectors` with cosine distance and 1024 dimensions

**Rationale**:
- Cosine similarity is standard for text embeddings
- 1024 dimensions matches Cohere embed-english-v3.0 output
- Qdrant Cloud Free Tier supports up to 1GB storage (ample for ~50 vectors)

**Configuration**:
```python
VectorParams(
    size=1024,
    distance=Distance.COSINE
)
```

**Alternatives Considered**:
- Dot product distance: Less intuitive for normalized embeddings
- Euclidean distance: Works but cosine is more common for text

---

### 3. Vector ID Strategy

**Decision**: Use hash of chunk_id as integer point ID

**Rationale**:
- Qdrant requires integer or UUID point IDs
- Hashing chunk_id (e.g., "doc-001-0001") provides deterministic integer
- Same chunk always gets same ID, enabling upsert (idempotency)
- Python's `hash()` is not consistent across runs, so use `hashlib`

**Implementation**:
```python
import hashlib

def chunk_id_to_point_id(chunk_id: str) -> int:
    """Convert chunk_id to deterministic integer for Qdrant."""
    hash_bytes = hashlib.md5(chunk_id.encode()).digest()
    return int.from_bytes(hash_bytes[:8], byteorder='big')
```

**Alternatives Considered**:
- UUID: Would require storing mapping; harder to ensure idempotency
- Sequential integers: Not stable if chunks are reordered
- String IDs: Qdrant supports but integers are more efficient

---

### 4. Batch Processing Strategy

**Decision**: Batch embeddings in groups of 10, single upsert per batch

**Rationale**:
- Cohere allows up to 96 texts per API call
- Batching reduces API calls and latency
- 10 is conservative to avoid rate limits on free tier
- Qdrant upsert handles batches efficiently

**Implementation**:
```python
BATCH_SIZE = 10

for i in range(0, len(chunks), BATCH_SIZE):
    batch = chunks[i:i + BATCH_SIZE]
    embeddings = cohere_client.embed(texts=[c['text'] for c in batch])
    # ... upsert batch to Qdrant
```

**Alternatives Considered**:
- No batching: More API calls, slower, higher rate limit risk
- Larger batches: May hit rate limits on free tier

---

### 5. Rate Limit Handling

**Decision**: Exponential backoff with max 3 retries

**Rationale**:
- Cohere free tier has rate limits
- Exponential backoff is industry standard
- 3 retries sufficient for transient errors
- Log failures for debugging

**Implementation**:
```python
import time

def embed_with_retry(texts, max_retries=3):
    for attempt in range(max_retries):
        try:
            return cohere_client.embed(texts=texts, ...)
        except cohere.RateLimitError:
            wait = 2 ** attempt  # 1, 2, 4 seconds
            print(f"Rate limited, waiting {wait}s...")
            time.sleep(wait)
    raise Exception("Max retries exceeded")
```

---

### 6. Payload Metadata Structure

**Decision**: Store all chunk metadata in Qdrant payload

**Rationale**:
- Qdrant payloads support arbitrary JSON
- Storing metadata enables filtering and retrieval without external lookup
- Matches spec requirement for 5 metadata fields

**Payload Schema**:
```python
{
    "chunk_id": "doc-001-0001",
    "text": "The full chunk text...",
    "source_path": "docs/chapter-1/index.md",
    "slug": "chapter-1-index",
    "title": "Introduction to Physical AI",
    "order_index": 1
}
```

**Note**: Including `text` in payload enables returning full text with search results without separate lookup.

---

### 7. Search Implementation

**Decision**: Simple top-k search with score threshold

**Rationale**:
- Top-k retrieval is the standard RAG pattern
- Score threshold filters low-relevance results
- Return text + metadata + score for verification

**Implementation**:
```python
def search(query: str, top_k: int = 5):
    query_embedding = cohere_client.embed(
        texts=[query],
        input_type="search_query"
    ).embeddings[0]

    results = qdrant_client.search(
        collection_name="book_vectors",
        query_vector=query_embedding,
        limit=top_k
    )
    return results
```

---

### 8. Environment Variables

**Decision**: Use python-dotenv with .env file

**Rationale**:
- Standard pattern for secret management
- .env file not committed to git
- .env.example documents required variables

**Required Variables**:
```
COHERE_API_KEY=your-cohere-api-key
QDRANT_URL=https://your-cluster.qdrant.tech
QDRANT_API_KEY=your-qdrant-api-key
```

---

## Dependencies Summary

| Package | Purpose | Version |
|---------|---------|---------|
| cohere | Cohere Python SDK | ^5.0.0 |
| qdrant-client | Qdrant Python client | ^1.7.0 |
| python-dotenv | Environment variable loading | ^1.0.0 |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Cohere rate limits | Batching + exponential backoff |
| Dimension mismatch | Explicit 1024 in collection config |
| Partial upload failure | Upsert is idempotent; re-run safe |
| API key exposure | .env file gitignored |
| Free tier limits exceeded | Monitor usage; ~15 chunks is well under limits |

---

## Next Steps

1. Generate data-model.md with entity definitions
2. Generate quickstart.md with validation steps
3. Skip contracts/ (no API endpoints in this spec)
