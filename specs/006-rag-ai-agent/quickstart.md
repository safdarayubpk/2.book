# Quickstart: RAG AI Agent

**Feature**: 006-rag-ai-agent
**Date**: 2025-12-14

## Prerequisites

1. **Spec-005 complete** - RAG Retrieval API running on port 8000
2. **Environment variables** configured in `.env`:
   - OPENAI_API_KEY (new for this feature)
   - COHERE_API_KEY (existing)
   - QDRANT_URL (existing)
   - QDRANT_API_KEY (existing)
   - DATABASE_URL (existing)
3. **Python 3.x** with pip installed

## Setup

### 1. Install Dependencies

```bash
pip install openai
```

### 2. Add OpenAI API Key

Add to your `.env` file:
```bash
OPENAI_API_KEY=sk-...your-key-here...
```

### 3. Verify Prerequisites

```bash
# Check RAG API is running
curl http://localhost:8000/health

# Expected: {"status":"ok","qdrant":true,"postgres":true}
```

## Usage

### Start the API Server

```bash
uvicorn scripts.api:app --reload --host 0.0.0.0 --port 8000
```

### Basic Chat

**Simple Question**:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is physical AI?"}'
```

Expected response:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Physical AI refers to artificial intelligence systems that interact with the physical world...[1]\n\nSources:\n[1] Introduction to Physical AI - /chapter-1-index",
  "sources": [
    {
      "chunk_id": "doc-001-0001",
      "title": "Introduction to Physical AI",
      "slug": "chapter-1-index",
      "score": 0.92
    }
  ],
  "metadata": {
    "response_time_ms": 2340,
    "tokens_used": 156,
    "context_chunks": 5
  }
}
```

### Multi-Turn Conversation

**First question**:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is physical AI?"}'
```

Save the `session_id` from the response.

**Follow-up question** (use the session_id):
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are some examples?",
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### End Session

```bash
curl -X DELETE http://localhost:8000/chat/sessions/550e8400-e29b-41d4-a716-446655440000
```

## Error Responses

**Empty message** (400):
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```

Response:
```json
{
  "error": "validation_error",
  "message": "Message cannot be empty"
}
```

**Message too long** (400):
```json
{
  "error": "validation_error",
  "message": "Message exceeds maximum length of 500 characters"
}
```

**LLM unavailable** (502):
```json
{
  "error": "upstream_error",
  "message": "Unable to generate response. Please try again."
}
```

## Troubleshooting

### Server Won't Start

**Error**: `ModuleNotFoundError: No module named 'openai'`

**Fix**:
```bash
pip install openai
```

### No Response Generated

**Error**: `upstream_error`

**Fix**: Check OpenAI API key:
```bash
grep OPENAI_API_KEY .env
# Verify key starts with sk-
```

### Empty Search Results

**Possible causes**:
1. Query doesn't match book content
2. Qdrant not connected - check `/health`
3. No vectors stored - run embedding scripts first

**Fix**: Try rephrasing the question or check:
```bash
curl http://localhost:8000/health
```

### Session Not Found

**Error**: `Session not found or already expired`

**Cause**: Session expired after 30 minutes or invalid session_id

**Fix**: Start a new conversation without session_id

## API Reference

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /chat | Submit a query to the AI agent |
| DELETE | /chat/sessions/{id} | End a chat session |
| GET | /health | Service health status |
| POST | /search | RAG search (Spec-005) |

### Request Schema

```json
{
  "message": "string (1-500 chars, required)",
  "session_id": "uuid (optional)"
}
```

### Response Schema

```json
{
  "session_id": "uuid",
  "message": "string (with inline citations)",
  "sources": [
    {
      "chunk_id": "string",
      "title": "string|null",
      "slug": "string",
      "score": "float (0-1)"
    }
  ],
  "metadata": {
    "response_time_ms": "integer",
    "tokens_used": "integer|null",
    "context_chunks": "integer"
  }
}
```

## File Locations

```
project/
├── .env                          # API keys here (add OPENAI_API_KEY)
├── scripts/
│   ├── embed-vectors.py          # Existing: vectors to Qdrant
│   ├── search-vectors.py         # Existing: semantic search CLI
│   ├── store-metadata.py         # Existing: metadata to Postgres
│   └── api.py                    # Extended: adds /chat endpoint
└── specs/006-rag-ai-agent/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md             # This file
    └── contracts/
        └── openapi.yaml
```

## Next Steps

After verifying the agent works:
1. Test multi-turn conversations
2. Verify response times (< 5s target)
3. Check source attribution accuracy
4. Ready for frontend integration
