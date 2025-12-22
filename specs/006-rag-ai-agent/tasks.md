# Tasks: RAG AI Agent

**Input**: Design documents from `/specs/006-rag-ai-agent/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Manual verification via curl/Postman (no automated tests per spec)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

## Path Conventions

- **Single project**: `scripts/` at repository root (following existing pattern)
- **Target file**: `scripts/api.py` (extend existing FastAPI service)
- **Config**: `.env` file at root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [X] T001 Install OpenAI Python SDK via `pip install openai`
- [X] T002 [P] Add OPENAI_API_KEY to .env file
- [X] T003 [P] Verify Spec-005 complete: run `curl http://localhost:8000/health` (expect status: ok)

---

## Phase 2: Foundational (Core Agent Structure)

**Purpose**: Base agent infrastructure with OpenAI client and Pydantic models - reused by all user stories

**⚠️ CRITICAL**: All user story features depend on this foundation

- [X] T004 Add OpenAI import and client variable to scripts/api.py
- [X] T005 Update load_env() in scripts/api.py to require OPENAI_API_KEY
- [X] T006 Implement init_openai_client() function in scripts/api.py
- [X] T007 Define Pydantic models in scripts/api.py: ChatRequest, Source, ResponseMetadata, ChatResponse (per data-model.md)
- [X] T008 Add agent constants to scripts/api.py: MAX_MESSAGE_LENGTH=500, MAX_TURNS=10, SESSION_TIMEOUT_MINUTES=30, DEFAULT_TOP_K=5
- [X] T009 Update startup lifespan handler in scripts/api.py to initialize OpenAI client
- [X] T010 Define SYSTEM_PROMPT constant in scripts/api.py with RAG accuracy constraints (per research.md)

**Checkpoint**: Foundation ready - script can start, load environment, and initialize all clients including OpenAI

---

## Phase 3: User Story 1 - Basic Question Answering (Priority: P1) 🎯 MVP

**Goal**: Accept user queries via POST /chat and return relevant, context-aware answers from the knowledge base

**Independent Test**: Run `curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"message": "What is physical AI?"}'` and verify response contains a coherent answer with sources

### Implementation for User Story 1

- [X] T011 [US1] Implement build_context_from_search() function in scripts/api.py to format RAG results for LLM
- [X] T012 [US1] Implement build_prompt() function in scripts/api.py to construct LLM prompt with context
- [X] T013 [US1] Implement generate_response() function in scripts/api.py using OpenAI client
- [X] T014 [US1] Implement extract_sources() function in scripts/api.py to convert SearchResult to Source
- [X] T015 [US1] Implement POST /chat endpoint skeleton in scripts/api.py that accepts ChatRequest
- [X] T016 [US1] Wire /chat endpoint: call vector_search() → build_context → build_prompt → generate_response
- [X] T017 [US1] Build ChatResponse with message, sources, and metadata (response_time_ms, context_chunks)
- [X] T018 [US1] Handle empty RAG results: return honest "no relevant content found" response
- [X] T019 [US1] Test /chat endpoint with query "What is physical AI?" and verify response contains book content

**Checkpoint**: US1 complete - `POST /chat` returns relevant answers with sources

---

## Phase 4: User Story 2 - Multi-Turn Conversation (Priority: P2)

**Goal**: Maintain conversation context across multiple queries within a session

**Independent Test**: Ask "What is physical AI?" then follow up with "What are some examples?" using same session_id and verify contextual response

### Implementation for User Story 2

- [X] T020 [US2] Define Session and ConversationTurn internal models in scripts/api.py (per data-model.md)
- [X] T021 [US2] Implement global sessions dictionary in scripts/api.py: Dict[str, Session]
- [X] T022 [US2] Implement get_or_create_session() function in scripts/api.py
- [X] T023 [US2] Implement cleanup_expired_sessions() function in scripts/api.py (30-minute timeout)
- [X] T024 [US2] Implement add_turn_to_session() function in scripts/api.py with sliding window (max 10 turns)
- [X] T025 [US2] Update build_prompt() in scripts/api.py to include conversation history
- [X] T026 [US2] Update /chat endpoint to use session management: get/create session, add turns
- [X] T027 [US2] Implement DELETE /chat/sessions/{session_id} endpoint in scripts/api.py
- [X] T028 [US2] Add session cleanup call on each /chat request (garbage collect expired sessions)
- [X] T029 [US2] Test multi-turn: ask "What is physical AI?" then "Tell me more" with same session_id

**Checkpoint**: US2 complete - conversations maintain context across multiple turns

---

## Phase 5: User Story 3 - Source Attribution (Priority: P2)

**Goal**: Include source references in all responses that use retrieved content

**Independent Test**: Verify /chat response includes sources array with chunk_id, title, slug, and score for each retrieved document

### Implementation for User Story 3

- [X] T030 [US3] Update generate_response() in scripts/api.py to instruct LLM to include inline citations [1][2]
- [X] T031 [US3] Implement format_sources_for_response() function in scripts/api.py to build sources list
- [X] T032 [US3] Update /chat endpoint to always include non-empty sources array when RAG returns results
- [X] T033 [US3] Verify source score, title, and slug are passed through correctly from SearchResult
- [X] T034 [US3] Test /chat response structure: verify sources array contains accurate chunk references

**Checkpoint**: US3 complete - all responses include accurate source attribution

---

## Phase 6: User Story 4 - Query Logging and Debugging (Priority: P3)

**Goal**: Log all queries, retrieved documents, and responses for monitoring

**Independent Test**: Check server logs after a /chat request - should show query text, session_id, retrieved chunk_ids, response time

### Implementation for User Story 4

- [X] T035 [US4] Add request logging at start of /chat endpoint in scripts/api.py (query, session_id)
- [X] T036 [US4] Add logging after RAG search in scripts/api.py (chunk_ids, scores)
- [X] T037 [US4] Add logging after LLM generation in scripts/api.py (tokens_used if available, generation_time)
- [X] T038 [US4] Add response logging at end of /chat endpoint (total response_time_ms)
- [X] T039 [US4] Add error logging with context for all exception paths
- [X] T040 [US4] Test logging: run /chat request and verify all log entries appear in console

**Checkpoint**: US4 complete - all interactions are logged for debugging

---

## Phase 7: Error Handling & Edge Cases

**Purpose**: Graceful handling of error conditions per spec edge cases

- [X] T041 Add validation exception handler for ChatRequest in scripts/api.py (empty message, too long)
- [X] T042 Add exception handler for OpenAI API errors in scripts/api.py (502 upstream_error)
- [X] T043 Add exception handler for invalid session_id format in scripts/api.py (400 validation_error)
- [X] T044 Add rate limiting awareness: log warning if response time exceeds 5 seconds
- [X] T045 Handle out-of-scope queries: update SYSTEM_PROMPT to clarify book content scope
- [X] T046 Test error handling: empty message (400), invalid session_id (400), verify error response schema

**Checkpoint**: All error conditions return consistent ErrorResponse

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation validation

- [X] T047 Add docstrings to all new functions in scripts/api.py
- [X] T048 [P] Run quickstart.md validation - verify all curl commands work as documented
- [X] T049 [P] Verify performance: chat response < 5 seconds, startup < 10 seconds
- [X] T050 Test concurrent sessions: create 3 different sessions and verify isolation
- [X] T051 Update /health endpoint to include openai status (optional enhancement)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - delivers MVP
- **User Story 2 (Phase 4)**: Depends on US1 (extends /chat endpoint with sessions)
- **User Story 3 (Phase 5)**: Depends on US1 (extends response format)
- **User Story 4 (Phase 6)**: Depends on US1 (adds logging to existing flow)
- **Error Handling (Phase 7)**: Depends on US1 and US2
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - no story dependencies (CRITICAL PATH)
- **User Story 2 (P2)**: Requires US1 implementation to extend
- **User Story 3 (P2)**: Requires US1 implementation to extend
- **User Story 4 (P3)**: Requires US1 implementation to add logging

### Within Each User Story

- Core function implementation first
- Endpoint integration second
- Testing/validation third

### Parallel Opportunities

**Phase 1 (Setup):**
```bash
# Can run in parallel:
Task T002: "Add OPENAI_API_KEY to .env"
Task T003: "Verify Spec-005 complete"
```

**Phase 5 & 6 (US3, US4):**
```bash
# After US1 complete, these can run in parallel:
User Story 3: Source Attribution (different code paths)
User Story 4: Query Logging (different code paths)
```

**Phase 8 (Polish):**
```bash
# Can run in parallel:
Task T048: "Run quickstart.md validation"
Task T049: "Verify performance"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `curl -X POST http://localhost:8000/chat -d '{"message": "physical AI"}'`
5. MVP complete - basic Q&A works

### Incremental Delivery

1. Setup + Foundational → Can start server and initialize all clients
2. Add User Story 1 → Can answer questions (MVP!)
3. Add User Story 2 → Can maintain conversation context
4. Add User Story 3 → Responses include source citations
5. Add User Story 4 → All interactions logged
6. Error Handling + Polish → Production-ready

### Single Developer Strategy

Execute phases sequentially:
1. Phase 1 → Phase 2 → Phase 3 (MVP checkpoint)
2. Phase 4 → Phase 5 → Phase 6
3. Phase 7 → Phase 8 (cleanup)

Total tasks: 51
Estimated completion: 2-3 hours for experienced developer

---

## Notes

- All tasks extend single file: `scripts/api.py`
- [P] tasks can run in parallel (different functions, no dependencies)
- [Story] label maps task to specific user story for traceability
- Commit after each phase completion
- Test manually via curl (no automated test suite per spec)
- Follow patterns from existing api.py code (Spec-005)
- Reuse existing functions: vector_search(), embed_query()
