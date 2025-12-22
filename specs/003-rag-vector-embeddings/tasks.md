# Tasks: Embeddings Generation & Vector Storage for RAG Pipeline

**Input**: Design documents from `/specs/003-rag-vector-embeddings/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in specification. No test tasks included.

**Organization**: Tasks are grouped by user story. All 3 user stories are P1 priority and form a pipeline (US1 → US2 → US3), but US3 (Search) can be partially independent for verification purposes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Python scripts**: `scripts/embed-vectors.py`, `scripts/search-vectors.py`
- **Environment config**: `data/.env.example`, `.env`
- **Input data**: `data/chunks.json` (from spec-002)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [ ] T001 Create data/.env.example with required environment variables (COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY)
- [ ] T002 Add .env to .gitignore to prevent credential exposure
- [ ] T003 Install Python dependencies: cohere, qdrant-client, python-dotenv
- [ ] T004 [P] Verify data/chunks.json exists (from spec-002)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement load_env() function in scripts/embed-vectors.py to load environment variables with python-dotenv
- [ ] T006 Implement load_chunks() function in scripts/embed-vectors.py to read and validate chunks.json
- [ ] T007 [P] Implement chunk_id_to_point_id() function in scripts/embed-vectors.py using hashlib MD5 for deterministic IDs
- [ ] T008 [P] Implement init_cohere_client() function in scripts/embed-vectors.py
- [ ] T009 [P] Implement init_qdrant_client() function in scripts/embed-vectors.py

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate Embeddings from Chunks (Priority: P1)

**Goal**: Convert all text chunks from chunks.json into vector embeddings using Cohere API

**Independent Test**: Run the embedding generation and verify all chunks produce 1024-dimensional vectors

### Implementation for User Story 1

- [ ] T010 [US1] Implement embed_with_retry() function in scripts/embed-vectors.py with exponential backoff (max 3 retries)
- [ ] T011 [US1] Implement batch_embed() function in scripts/embed-vectors.py to process chunks in batches of 10
- [ ] T012 [US1] Configure Cohere embed-english-v3.0 model with input_type="search_document"
- [ ] T013 [US1] Add progress logging during embedding generation (batch N/M processed)
- [ ] T014 [US1] Add warning log for short chunks (< 10 characters)

**Checkpoint**: At this point, User Story 1 should work - embeddings are generated for all chunks

---

## Phase 4: User Story 2 - Store Vectors in Vector Database (Priority: P1)

**Goal**: Store generated embeddings in Qdrant Cloud with full metadata payloads

**Independent Test**: After running, verify vector count in Qdrant equals chunk count and metadata is complete

**Depends on**: User Story 1 (needs embeddings)

### Implementation for User Story 2

- [ ] T015 [US2] Implement ensure_collection() function in scripts/embed-vectors.py to create book_vectors collection if not exists
- [ ] T016 [US2] Configure collection with size=1024 and distance=COSINE
- [ ] T017 [US2] Implement build_vector_points() function in scripts/embed-vectors.py to create VectorPoint objects with payload
- [ ] T018 [US2] Include all 6 metadata fields in payload (chunk_id, text, source_path, slug, title, order_index)
- [ ] T019 [US2] Implement upsert_vectors() function in scripts/embed-vectors.py for batch upsert
- [ ] T020 [US2] Add progress logging during upsert (batch N/M upserted)
- [ ] T021 [US2] Implement main() function in scripts/embed-vectors.py to orchestrate full pipeline

**Checkpoint**: At this point, User Stories 1 AND 2 should work - vectors are stored in Qdrant

---

## Phase 5: User Story 3 - Semantic Similarity Search (Priority: P1)

**Goal**: Enable semantic search to verify pipeline and prepare for RAG retrieval

**Independent Test**: Run search query "humanoid robot" and verify relevant chunks are returned with scores

**Depends on**: User Story 2 (needs stored vectors)

### Implementation for User Story 3

- [ ] T022 [US3] Create scripts/search-vectors.py with environment loading and client initialization
- [ ] T023 [US3] Implement embed_query() function in scripts/search-vectors.py using input_type="search_query"
- [ ] T024 [US3] Implement search() function in scripts/search-vectors.py for top-k similarity search
- [ ] T025 [US3] Implement display_results() function in scripts/search-vectors.py to format and print results
- [ ] T026 [US3] Add --count flag to display vector count in collection
- [ ] T027 [US3] Add --inspect flag to show full payload for a specific chunk_id
- [ ] T028 [US3] Implement main() with argparse for query input and flags

**Checkpoint**: All user stories should now be functional - full pipeline with search verification

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, verification, and final cleanup

- [ ] T029 Run embed-vectors.py and verify all 15 chunks are processed (SC-001)
- [ ] T030 [P] Verify vector count equals chunk count using search-vectors.py --count (SC-002)
- [ ] T031 [P] Verify search completes in under 2 seconds (SC-003)
- [ ] T032 Run embed-vectors.py twice and verify vector count unchanged (SC-004 idempotency)
- [ ] T033 Run search for "humanoid robot movement" and verify relevant results (SC-005)
- [ ] T034 Use --inspect to verify all 6 metadata fields present (SC-006)
- [ ] T035 Verify pipeline completes in under 5 minutes (SC-007)
- [ ] T036 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: Form a linear pipeline:
  - US1 (Embed) → US2 (Store) → US3 (Search)
  - Each story depends on the previous
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Depends on User Story 1 (needs embeddings)
- **User Story 3 (P1)**: Depends on User Story 2 (needs stored vectors)

### Within Each User Story

- Utility functions before main logic
- Configuration before implementation
- Logging after core functionality

### Parallel Opportunities

- Setup task T004 can run in parallel with T001-T003
- Foundational tasks T007-T009 can run in parallel
- Polish tasks T030-T031 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch parallel utility functions:
Task: "Implement chunk_id_to_point_id() function in scripts/embed-vectors.py"
Task: "Implement init_cohere_client() function in scripts/embed-vectors.py"
Task: "Implement init_qdrant_client() function in scripts/embed-vectors.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009)
3. Complete Phase 3: User Story 1 - Embedding (T010-T014)
4. Complete Phase 4: User Story 2 - Storage (T015-T021)
5. **STOP and VALIDATE**: Vectors stored in Qdrant
6. Continue to User Story 3 for search verification

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test embeddings generated → Checkpoint
3. Add User Story 2 → Test vectors stored → Checkpoint (MVP!)
4. Add User Story 3 → Test search works → Full pipeline complete
5. Complete Polish → Final validation

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4**

User Stories 1 and 2 together produce a functional vector database. User Story 3 (Search) is for verification but not strictly required for downstream RAG components that can query Qdrant directly.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature requires API credentials - ensure .env is configured before running
- Cohere free tier has rate limits - batching and retry logic are essential
- Re-running is safe due to upsert with deterministic IDs
- Commit after each phase or logical group
