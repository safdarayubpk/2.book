# Implementation Plan: HuggingFace Backend Deployment

**Branch**: `009-huggingface-backend` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-huggingface-backend/spec.md`

## Summary

Deploy the existing FastAPI backend to HuggingFace Spaces as a Docker container, configure CORS to allow the Vercel-hosted frontend to communicate with it, and update the frontend to point to the HuggingFace Spaces URL. This enables the chatbot to work for all website visitors.

## Technical Context

**Language/Version**: Python 3.11 (existing backend)
**Primary Dependencies**: FastAPI, uvicorn, cohere, qdrant-client, psycopg2-binary, openai, python-dotenv, pydantic
**Storage**: Qdrant Cloud (vectors), Neon PostgreSQL (metadata) - external services, no local storage needed
**Testing**: Manual integration testing (health endpoint, chat endpoint)
**Target Platform**: HuggingFace Spaces (Docker SDK), port 7860
**Project Type**: Web application (frontend on Vercel, backend on HuggingFace)
**Performance Goals**: Response within 60 seconds (including cold start), <30 seconds after warm
**Constraints**: Free tier limits, stateless container (sessions in-memory reset on restart), /tmp only writable directory
**Scale/Scope**: Single user traffic initially, chatbot queries against existing Qdrant vectors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | PASS | Deployment config only, no new code complexity |
| II. Mobile-Ready Performance | PASS | No frontend changes affect performance |
| III. RAG Accuracy | PASS | Existing RAG system unchanged |
| IV. Personalization-Driven | N/A | No personalization changes |
| V. Free-Tier Compliance | PASS | HuggingFace free tier used |
| VI. Educational Focus | PASS | Enables chatbot for learning |
| VII. AI-Native Experience | PASS | Makes chatbot accessible to all users |
| VIII. Rapid Deployment | PASS | HuggingFace simplifies deployment |

**Note on Constitution Deviation**: The constitution specifies Railway for backend deployment (Technical Constraints section). This feature uses HuggingFace Spaces instead. This is acceptable because:
1. Both are free-tier compliant
2. HuggingFace is user's explicit preference
3. Same Python/FastAPI stack, no code changes required
4. Railway can still be used as alternative if needed

## Project Structure

### Documentation (this feature)

```text
specs/009-huggingface-backend/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (deployment configs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Deployment files (new)
Dockerfile               # HuggingFace Docker configuration
README.md               # HuggingFace Space metadata (sdk: docker)

# Existing files (to modify)
scripts/api.py          # Update CORS origins
src/services/chatApi.ts # Update API_BASE_URL

# Existing files (no changes)
requirements.txt        # Already exists, compatible
Procfile               # Exists but not used by HuggingFace
```

**Structure Decision**: Minimal file additions - only Dockerfile and README.md for HuggingFace Space. Existing codebase modified in-place for CORS and frontend API URL.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| HuggingFace instead of Railway | User preference + free Docker hosting | Railway also valid, but user explicitly requested HuggingFace |

## Key Implementation Decisions

### 1. Docker Configuration
- Use Python 3.11 slim base image for smaller size
- Expose port 7860 (HuggingFace default)
- Create user with ID 1000 (HuggingFace requirement)
- Copy only necessary files (scripts/, requirements.txt, .env handling)

### 2. Environment Variables
- Use HuggingFace Secrets for API keys (COHERE_API_KEY, OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY, DATABASE_URL)
- Secrets accessible at runtime via os.environ
- No .env file in container (secrets injected by HuggingFace)

### 3. CORS Configuration
- Add Vercel production domain to allowed origins
- Keep localhost for development
- Use wildcard for Vercel preview deployments if needed

### 4. Frontend API URL
- Configure via environment variable or build-time constant
- Point to HuggingFace Space URL: https://{username}-{space-name}.hf.space

### 5. Cold Start Handling
- HuggingFace free tier sleeps after ~48 hours of inactivity
- First request may take 30-60 seconds to wake
- Frontend timeout already set to 60 seconds (adequate)
