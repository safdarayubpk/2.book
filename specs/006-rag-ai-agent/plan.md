# Implementation Plan: RAG AI Agent

**Branch**: `006-rag-ai-agent` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-rag-ai-agent/spec.md`

## Summary

Implement an AI-powered chat agent that uses OpenAI GPT-4o-mini for response generation, leveraging the existing RAG retrieval API (Spec-005) for context retrieval. The agent supports multi-turn conversations with in-memory session management and provides source attribution for all responses.

## Technical Context

**Language/Version**: Python 3.x (matching existing scripts)
**Primary Dependencies**: openai, fastapi, uvicorn, pydantic (extend existing api.py)
**Storage**: In-memory session store (no additional database required)
**Testing**: Manual verification via curl/Postman (per spec constraints)
**Target Platform**: Linux/macOS development, Railway deployment
**Project Type**: Single project (extend existing API service)
**Performance Goals**: < 5 seconds per response, session management for 10+ concurrent users
**Constraints**: Must stay within free tier limits for OpenAI (pay-as-you-go), Qdrant, Neon, Railway
**Scale/Scope**: 15 chunks (current), designed for multi-turn conversations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | ✅ Pass | Extends single api.py file, minimal new dependencies |
| II. Mobile-Ready Performance | ✅ N/A | Backend API, not user-facing |
| III. RAG Accuracy | ✅ Pass | Explicit citation requirement, no-hallucination prompt |
| IV. Personalization-Driven | ✅ N/A | Infrastructure feature |
| V. Free-Tier Compliance | ✅ Pass | OpenAI pay-as-you-go, minimal token usage |
| VI. Educational Focus | ✅ N/A | Backend infrastructure |
| VII. AI-Native Experience | ✅ Pass | < 5s response time, seamless RAG integration |
| VIII. Rapid Deployment | ✅ Pass | Same deployment unit as Spec-005 |

## Project Structure

### Documentation (this feature)

```text
specs/006-rag-ai-agent/
├── plan.md              # This file
├── research.md          # Phase 0 output (LLM selection, memory architecture)
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
└── api.py               # Extended: adds /chat endpoint and agent logic
```

**Structure Decision**: Extend existing `scripts/api.py` with new endpoint and supporting functions. No separate files needed - follows Simplicity-First principle. Agent logic implemented as functions within the same file.

## Complexity Tracking

> **No violations to document**

The implementation follows all constitution principles without requiring complexity justifications.

## Implementation Overview

### Phase 1: Core Infrastructure

1. **OpenAI Integration**
   - Install openai package
   - Add OPENAI_API_KEY to environment loading
   - Implement LLM client initialization

2. **Chat Endpoint Foundation**
   - `POST /chat` accepts ChatRequest
   - Pydantic models for request/response validation
   - Basic error handling

### Phase 2: RAG Integration

3. **Context Retrieval**
   - Reuse existing search functionality from api.py
   - Build context from retrieved chunks
   - Format sources for citation

4. **Prompt Construction**
   - System prompt with RAG accuracy constraints
   - Context injection with source metadata
   - Conversation history for multi-turn

### Phase 3: Session Management

5. **In-Memory Sessions**
   - Session store dictionary
   - Session creation and lookup
   - Sliding window memory (10 turns)

6. **Session Lifecycle**
   - 30-minute timeout
   - Garbage collection on access
   - DELETE endpoint for explicit cleanup

### Phase 4: Response Generation

7. **LLM Integration**
   - Call OpenAI with constructed prompt
   - Parse response for inline citations
   - Handle streaming (optional enhancement)

8. **Source Attribution**
   - Extract sources from RAG results
   - Format inline citations [1][2]
   - Include source list in response

### Phase 5: Validation & Logging

9. **Request Logging**
   - Log query text, session, response time
   - Log retrieved chunks and scores
   - Error logging with context

10. **Manual Testing**
    - Test single queries
    - Test multi-turn conversations
    - Test error conditions

## Artifacts Generated

| Artifact | Status | Purpose |
|----------|--------|---------|
| research.md | ✅ Complete | Technical decisions and patterns |
| data-model.md | ✅ Complete | Pydantic model definitions |
| quickstart.md | ✅ Complete | Setup and usage guide |
| contracts/ | ✅ Complete | OpenAPI specification |
| tasks.md | Pending | Implementation tasks (/speckit.tasks) |

## Next Steps

Run `/speckit.tasks` to generate implementation task breakdown.
