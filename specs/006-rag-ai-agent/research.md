# Research: RAG AI Agent

**Feature**: 006-rag-ai-agent
**Date**: 2025-12-14

## Research Questions

### 1. LLM Provider Selection

**Decision**: OpenAI GPT-4o-mini

**Rationale**:
- Cost-effective for high-volume usage (fits free-tier compliance mindset)
- Fast response times (under 2 seconds for typical prompts)
- Excellent instruction-following for RAG context integration
- Python SDK (openai) is well-maintained and simple to use
- Supports streaming for real-time response delivery

**Alternatives Considered**:
- GPT-4o: More capable but higher cost per token
- Claude: Excellent quality but different SDK patterns
- Local LLMs (Ollama): No external dependency but requires compute resources
- Cohere Command: Already using Cohere for embeddings, could consolidate

### 2. Conversation Memory Architecture

**Decision**: In-memory session store with sliding window

**Rationale**:
- Simple Python dictionary keyed by session_id
- Sliding window of last 10 turns (configurable via MAX_TURNS)
- No external dependencies (Redis/SQLite not needed for MVP)
- Session timeout after 30 minutes of inactivity
- Memory automatically garbage-collected when session expires

**Alternatives Considered**:
- Redis: Adds infrastructure complexity, overkill for single-instance
- SQLite: Persistent but adds I/O overhead, not needed for session data
- PostgreSQL (Neon): Already have connection, but adds latency for every turn

**Memory Format**:
```python
{
    "session_id": {
        "turns": [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ],
        "created_at": timestamp,
        "last_activity": timestamp
    }
}
```

### 3. Agent Interface Pattern

**Decision**: Extend existing FastAPI service (scripts/api.py)

**Rationale**:
- Reuse existing infrastructure (FastAPI, health checks, error handling)
- Single deployment unit (Railway free tier has limits)
- Consistent patterns with Spec-005 implementation
- Add new endpoint: `POST /chat` for agent interactions

**Alternatives Considered**:
- Separate service: More modular but adds deployment complexity
- CLI-only: Simpler but limits future integration options
- WebSocket: Better for streaming but adds complexity for MVP

### 4. Prompt Engineering Strategy

**Decision**: System prompt with context injection

**Rationale**:
- System prompt defines agent behavior and constraints
- Retrieved chunks injected as context in user message
- Explicit instruction to cite sources and avoid hallucination
- Constitution principle III (RAG Accuracy) compliance

**Prompt Structure**:
```
SYSTEM: You are a helpful assistant for an educational textbook about
Physical AI and Humanoid Robotics. Answer questions ONLY based on the
provided context. Always cite your sources. If the context doesn't
contain relevant information, say so honestly.

USER: Context:
[Retrieved chunks with source attribution]

Question: {user_query}

Previous conversation:
[Conversation history if multi-turn]
```

### 5. Source Attribution Format

**Decision**: Inline citations with source list

**Rationale**:
- Each claim linked to source document
- Sources listed at end of response with titles and slugs
- Enables user to navigate to original content
- Matches SearchResult schema from Spec-005

**Format**:
```
Response text with inline references [1][2].

Sources:
[1] Chapter 1: Introduction to Physical AI - /chapter-1-index
[2] Chapter 3: Humanoid Robotics - /chapter-3-humanoid
```

### 6. Error Handling Strategy

**Decision**: Graceful degradation with user-friendly messages

**Rationale**:
- LLM unavailable: Return cached/static response if possible, else clear error
- RAG returns empty: Inform user politely, suggest rephrasing
- Timeout: Partial response with explanation
- Rate limiting: Queue or inform user of limits

**Error Messages**:
- "I couldn't find relevant information about that topic in the book. Try rephrasing your question or ask about a specific chapter."
- "I'm temporarily unable to generate a response. Please try again in a moment."
- "Your question is too long. Please keep it under 500 characters."

### 7. Performance Optimization

**Decision**: Parallel retrieval with async patterns

**Rationale**:
- Use httpx for async calls to RAG API
- Parallel retrieval if multiple queries needed
- Stream LLM responses when supported
- Target: < 5 seconds total response time

**Timing Budget**:
- RAG retrieval: < 2 seconds (already validated in Spec-005)
- LLM generation: < 3 seconds
- Total: < 5 seconds

## Integration Points

### Spec-005 RAG Retrieval API
- Endpoint: `POST /search`
- Request: `{"query": "...", "top_k": 5}`
- Response: `{"query": "...", "results": [SearchResult]}`
- Internal call (same service, can call function directly)

### Environment Variables Required
- `OPENAI_API_KEY`: For LLM generation
- Existing: `COHERE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `DATABASE_URL`

## Constitution Compliance

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Simplicity-First | ✅ | Single file extension, minimal dependencies |
| III. RAG Accuracy | ✅ | Explicit citation requirement, no hallucination |
| V. Free-Tier Compliance | ✅ | OpenAI pay-as-you-go, minimal token usage |
| VII. AI-Native Experience | ✅ | < 5s response time, seamless integration |
| VIII. Rapid Deployment | ✅ | Same deployment unit as Spec-005 |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| LLM costs accumulate | Implement token counting, set usage alerts |
| Response quality varies | Prompt engineering, confidence thresholds |
| Memory grows unbounded | Sliding window, session timeout, cleanup |
| Concurrent session limits | Simple rate limiting per session |
