# Quickstart: RAG Retrieval API

**Feature**: 005-rag-retrieval-api
**Date**: 2025-12-14

## Prerequisites

1. **Spec-003 complete** - Vector embeddings stored in Qdrant
2. **Spec-004 complete** - Metadata stored in Neon Postgres
3. **Environment variables** configured in `.env`:
   - COHERE_API_KEY
   - QDRANT_URL
   - QDRANT_API_KEY
   - DATABASE_URL
4. **Python 3.x** with pip installed

## Setup

### 1. Install Dependencies

```bash
pip install fastapi uvicorn[standard]
```

### 2. Verify Prerequisites

```bash
# Check vectors exist
python3 scripts/search-vectors.py --count

# Check metadata exists
python3 scripts/store-metadata.py --count
```

Expected output:
```
Vector count: 15
Total records in database: 15
```

## Usage

### Start the API Server

```bash
uvicorn scripts.api:app --reload --host 0.0.0.0 --port 8000
```

Or run directly:
```bash
python3 -m uvicorn scripts.api:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "qdrant": true,
  "postgres": true
}
```

### Semantic Search

**Basic Search**:
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What is physical AI?"}'
```

Expected response:
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

**Custom top_k**:
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "humanoid robotics", "top_k": 3}'
```

### Error Responses

**Empty query** (400):
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": ""}'
```

Response:
```json
{
  "error": "validation_error",
  "message": "Query cannot be empty"
}
```

**Invalid top_k** (400):
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "top_k": 100}'
```

Response:
```json
{
  "error": "validation_error",
  "message": "top_k must be between 1 and 20"
}
```

## Troubleshooting

### Server Won't Start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Fix**: Install dependencies:
```bash
pip install fastapi uvicorn[standard]
```

### Health Check Fails

**Error**: `{"status": "degraded", "qdrant": false, "postgres": true}`

**Fix**: Check Qdrant credentials in `.env`:
```bash
grep QDRANT .env
```

Verify connection:
```bash
python3 scripts/search-vectors.py --count
```

### Search Returns Empty Results

**Possible causes**:
1. No vectors stored - Run `python3 scripts/embed-vectors.py`
2. Query doesn't match content - Try different search terms
3. Embedding model mismatch - Ensure using same Cohere model

### Connection Timeout

**Error**: `service_unavailable: Vector store is unreachable`

**Fix**: Check network connectivity and API keys:
```bash
# Test Qdrant
python3 scripts/search-vectors.py "test"

# Test Postgres
python3 scripts/store-metadata.py --count
```

## API Reference

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health status |
| POST | /search | Semantic search |

### Request Schema

```json
{
  "query": "string (1-500 chars, required)",
  "top_k": "integer (1-20, default 5)"
}
```

### Response Schema

```json
{
  "query": "string",
  "results": [
    {
      "chunk_id": "string",
      "snippet": "string",
      "source_path": "string",
      "slug": "string",
      "title": "string|null",
      "score": "float (0-1)"
    }
  ]
}
```

## File Locations

```
project/
├── .env                          # API keys here
├── scripts/
│   ├── embed-vectors.py          # Existing: vectors to Qdrant
│   ├── search-vectors.py         # Existing: semantic search CLI
│   ├── store-metadata.py         # Existing: metadata to Postgres
│   └── api.py                    # New: FastAPI service
└── specs/005-rag-retrieval-api/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md             # This file
    └── contracts/
        └── openapi.yaml
```

## Next Steps

After verifying the API works:
1. Test with various queries
2. Verify response times (< 2s target)
3. Ready for AI Agent integration (Spec-006)
