# Tasks: RAG Retrieval API

**Input**: Design documents from `/specs/005-rag-retrieval-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Manual verification via curl/Postman (no automated tests per spec)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

## Path Conventions

- **Single project**: `scripts/` at repository root (following existing pattern)
- **Target file**: `scripts/api.py` (single-file FastAPI service)
- **Config**: `.env` file at root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [X] T001 Install FastAPI and Uvicorn dependencies via `pip install fastapi uvicorn[standard]`
- [X] T002 [P] Verify existing dependencies are installed (cohere, qdrant-client, psycopg2-binary, python-dotenv)
- [X] T003 [P] Verify Spec-003 complete: run `python3 scripts/search-vectors.py --count` (expect 15 vectors)
- [X] T004 [P] Verify Spec-004 complete: run `python3 scripts/store-metadata.py --count` (expect 15 records)

---

## Phase 2: Foundational (Core Script Structure)

**Purpose**: Base FastAPI app with environment loading and client initialization - reused by all user stories

**⚠️ CRITICAL**: All user story features depend on this foundation

- [X] T005 Create scripts/api.py with FastAPI app instance and main() entry point
- [X] T006 Implement load_env() function in scripts/api.py to load environment variables from .env
- [X] T007 Implement init_cohere_client() function in scripts/api.py (reuse pattern from search-vectors.py)
- [X] T008 Implement init_qdrant_client() function in scripts/api.py (reuse pattern from search-vectors.py)
- [X] T009 Implement init_db_connection() function in scripts/api.py (reuse pattern from store-metadata.py)
- [X] T010 Define Pydantic models in scripts/api.py: SearchRequest, SearchResult, SearchResponse, HealthResponse, ErrorResponse (per data-model.md)
- [X] T011 Add startup event handler in scripts/api.py to initialize all clients on app startup
- [X] T012 Add Python logging configuration in scripts/api.py for query and response time logging

**Checkpoint**: Foundation ready - script can start, load environment, and initialize clients

---

## Phase 3: User Story 1 - Semantic Search for Book Content (Priority: P1) 🎯 MVP

**Goal**: Accept search queries via POST /search and return relevant chunks with metadata

**Independent Test**: Run `curl -X POST http://localhost:8000/search -H "Content-Type: application/json" -d '{"query": "What is physical AI?"}'` and verify response contains chunks with scores

### Implementation for User Story 1

- [X] T013 [US1] Implement embed_query() function in scripts/api.py using Cohere (reuse pattern from search-vectors.py)
- [X] T014 [US1] Implement vector_search() function in scripts/api.py using Qdrant query_points() with top_k parameter
- [X] T015 [US1] Implement POST /search endpoint in scripts/api.py that accepts SearchRequest
- [X] T016 [US1] Wire search endpoint to call embed_query() → vector_search() → return SearchResponse
- [X] T017 [US1] Add request logging in /search endpoint showing query text and response time
- [X] T018 [US1] Test /search endpoint with query "What is physical AI?" and verify results sorted by score

**Checkpoint**: US1 complete - `POST /search` returns relevant chunks with metadata

---

## Phase 4: User Story 2 - Service Health Verification (Priority: P1)

**Goal**: Provide GET /health endpoint to verify service status and dependency connectivity

**Independent Test**: Run `curl http://localhost:8000/health` and verify 200 OK with qdrant: true, postgres: true

### Implementation for User Story 2

- [X] T019 [US2] Implement check_qdrant_health() function in scripts/api.py to verify Qdrant connectivity
- [X] T020 [US2] Implement check_postgres_health() function in scripts/api.py to verify Postgres connectivity
- [X] T021 [US2] Implement GET /health endpoint in scripts/api.py returning HealthResponse
- [X] T022 [US2] Wire health endpoint to check both dependencies and return appropriate status (ok/degraded/error)
- [X] T023 [US2] Test /health endpoint and verify response includes qdrant and postgres status

**Checkpoint**: US2 complete - `/health` returns service status with dependency checks

---

## Phase 5: User Story 3 - Customizable Result Count (Priority: P2)

**Goal**: Support optional top_k parameter with default value of 5 and max cap of 20

**Independent Test**: Run searches with top_k=1, top_k=10, and top_k=100 (should cap at 20)

### Implementation for User Story 3

- [X] T024 [US3] Update SearchRequest model validation in scripts/api.py: top_k ge=1, le=20, default=5
- [X] T025 [US3] Update vector_search() in scripts/api.py to pass validated top_k to Qdrant query
- [X] T026 [US3] Test /search with different top_k values: default (5), explicit (3), capped (request 100, get 20)

**Checkpoint**: US3 complete - top_k parameter works with validation and capping

---

## Phase 6: User Story 4 - Graceful Error Handling (Priority: P2)

**Goal**: Return consistent error responses for invalid queries and service failures

**Independent Test**: Send empty query and verify 400 response with error schema

### Implementation for User Story 4

- [X] T027 [US4] Add custom exception handler in scripts/api.py for validation errors (400)
- [X] T028 [US4] Add exception handler for Cohere API errors in scripts/api.py (502 upstream_error)
- [X] T029 [US4] Add exception handler for Qdrant connection errors in scripts/api.py (503 service_unavailable)
- [X] T030 [US4] Add exception handler for Postgres connection errors in scripts/api.py (503 service_unavailable)
- [X] T031 [US4] Add generic exception handler in scripts/api.py for unexpected errors (500 internal_error)
- [X] T032 [US4] Test error handling: empty query (400), verify error response schema

**Checkpoint**: US4 complete - all error conditions return consistent ErrorResponse

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation validation

- [X] T033 Add docstrings to all functions in scripts/api.py
- [X] T034 [P] Run quickstart.md validation - verify all curl commands work as documented
- [X] T035 [P] Verify performance: search < 2 seconds, startup < 10 seconds
- [X] T036 Test concurrent requests: run 10 parallel searches and verify no errors
- [X] T037 Add summary logging on startup showing loaded environment variables (without secrets)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - delivers MVP
- **User Story 2 (Phase 4)**: Depends on Foundational - can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 (extends search functionality)
- **User Story 4 (Phase 6)**: Depends on US1 and US2 (adds error handling to existing endpoints)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - no story dependencies (CRITICAL PATH)
- **User Story 2 (P1)**: Foundation only - can run in parallel with US1
- **User Story 3 (P2)**: Requires US1 implementation to extend
- **User Story 4 (P2)**: Requires US1 and US2 to add error handling

### Within Each User Story

- Core function implementation first
- Endpoint integration second
- Testing/validation third

### Parallel Opportunities

**Phase 1 (Setup):**
```bash
# Can run in parallel:
Task T002: "Verify existing dependencies"
Task T003: "Verify Spec-003 complete"
Task T004: "Verify Spec-004 complete"
```

**Phase 2 (Foundational) - After T005:**
```bash
# Can run in parallel after app created:
Task T007: "Implement init_cohere_client()"
Task T008: "Implement init_qdrant_client()"
Task T009: "Implement init_db_connection()"
```

**Phase 7 (Polish):**
```bash
# Can run in parallel:
Task T034: "Run quickstart.md validation"
Task T035: "Verify performance"
```

---

## Parallel Example: Phase 2 Foundational

```bash
# After T005 (create api.py), launch client initializers in parallel:
Task: "Implement init_cohere_client() in scripts/api.py"
Task: "Implement init_qdrant_client() in scripts/api.py"
Task: "Implement init_db_connection() in scripts/api.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `curl -X POST http://localhost:8000/search -d '{"query": "physical AI"}'`
5. MVP complete - basic search works

### Incremental Delivery

1. Setup + Foundational → Can start server and initialize clients
2. Add User Story 1 → Can search book content (MVP!)
3. Add User Story 2 → Can verify service health
4. Add User Story 3 → Can customize result count
5. Add User Story 4 → Production-ready error handling
6. Polish → Documentation validated, performance verified

### Single Developer Strategy

Execute phases sequentially:
1. Phase 1 → Phase 2 → Phase 3 (MVP checkpoint)
2. Phase 4 → Phase 5 → Phase 6
3. Phase 7 (cleanup)

Total tasks: 37
Estimated completion: 1-2 hours for experienced developer

---

## Notes

- All tasks modify single file: `scripts/api.py`
- [P] tasks can run in parallel (different functions, no dependencies)
- [Story] label maps task to specific user story for traceability
- Commit after each phase completion
- Test manually via curl (no automated test suite per spec)
- Follow patterns from existing `scripts/search-vectors.py` and `scripts/store-metadata.py`
- Reuse client initialization code from existing scripts
