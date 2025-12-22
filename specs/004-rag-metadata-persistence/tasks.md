# Tasks: RAG Metadata Persistence

**Input**: Design documents from `/specs/004-rag-metadata-persistence/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Manual verification via CLI flags (no automated tests per spec)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

## Path Conventions

- **Single project**: `scripts/` at repository root (following existing pattern from embed-vectors.py)
- **Data**: `data/chunks.json` (input source)
- **Config**: `.env` file at root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [X] T001 Install psycopg2-binary dependency via `pip install psycopg2-binary`
- [X] T002 [P] Add DATABASE_URL example to data/.env.example
- [X] T003 [P] Verify DATABASE_URL is configured in .env file

---

## Phase 2: Foundational (Core Script Structure)

**Purpose**: Base script with environment loading and chunks loading - reused by all user stories

**⚠️ CRITICAL**: All user story features depend on this foundation

- [X] T004 Create scripts/store-metadata.py with main() entry point and argument parser
- [X] T005 Implement load_env() function in scripts/store-metadata.py to load DATABASE_URL from .env
- [X] T006 Implement load_chunks() function in scripts/store-metadata.py to load and validate chunks.json
- [X] T007 Implement init_db_connection() function in scripts/store-metadata.py to connect to Neon Postgres with SSL
- [X] T008 Implement create_table() function in scripts/store-metadata.py with CREATE TABLE IF NOT EXISTS for documents table (per data-model.md schema)

**Checkpoint**: Foundation ready - script can load environment, connect to database, and create table

---

## Phase 3: User Story 1 - Store Chunk Metadata (Priority: P1) 🎯 MVP

**Goal**: Persist all chunk metadata from chunks.json to documents table

**Independent Test**: Run `python scripts/store-metadata.py` and verify 15 rows inserted with all fields populated

### Implementation for User Story 1

- [X] T009 [US1] Implement store_metadata() function in scripts/store-metadata.py with batch INSERT using executemany()
- [X] T010 [US1] Add progress logging to store_metadata() showing "Batch N/M: X records processed"
- [X] T011 [US1] Add transaction wrapper in store_metadata() to ensure atomicity (commit all or rollback)
- [X] T012 [US1] Implement verify_count() function in scripts/store-metadata.py to SELECT COUNT(*) and log result
- [X] T013 [US1] Wire up main() to call load_env(), load_chunks(), init_db_connection(), create_table(), store_metadata(), verify_count() in sequence
- [X] T014 [US1] Add error handling for missing chunks.json with clear error message
- [X] T015 [US1] Add error handling for missing DATABASE_URL with clear error message

**Checkpoint**: US1 complete - `python scripts/store-metadata.py` stores all 15 chunks to database

---

## Phase 4: User Story 2 - Lookup Metadata by Chunk ID (Priority: P1)

**Goal**: Retrieve metadata for a specific chunk_id via CLI flag

**Independent Test**: Run `python scripts/store-metadata.py --lookup doc-001-0001` and verify correct metadata returned

### Implementation for User Story 2

- [X] T016 [US2] Add --lookup CHUNK_ID argument to argument parser in scripts/store-metadata.py
- [X] T017 [US2] Implement lookup_chunk() function in scripts/store-metadata.py with SELECT query by chunk_id
- [X] T018 [US2] Add formatted output for lookup result showing all metadata fields (source_path, slug, title, order_index, snippet truncated)
- [X] T019 [US2] Handle case where chunk_id not found with clear message "Chunk not found: {chunk_id}"
- [X] T020 [US2] Wire --lookup flag to call lookup_chunk() instead of main ingestion flow

**Checkpoint**: US2 complete - can look up any chunk by ID in under 100ms

---

## Phase 5: User Story 3 - Idempotent Re-runs (Priority: P1)

**Goal**: Re-running script updates existing records instead of creating duplicates

**Independent Test**: Run script twice and verify count stays at 15 (not 30)

### Implementation for User Story 3

- [X] T021 [US3] Modify INSERT statement in store_metadata() to use ON CONFLICT (chunk_id) DO UPDATE SET clause
- [X] T022 [US3] Update progress logging to show "X records upserted" instead of "inserted"
- [X] T023 [US3] Test by running script twice and verifying count unchanged

**Checkpoint**: US3 complete - script is fully idempotent

---

## Phase 6: User Story 4 - Filter Metadata by Source (Priority: P2)

**Goal**: Filter chunks by source_path or slug via CLI flags

**Independent Test**: Run `python scripts/store-metadata.py --source docs/chapter-1/index.md` and verify only Chapter 1 chunks returned

### Implementation for User Story 4

- [X] T024 [US4] Add --source PATH argument to argument parser in scripts/store-metadata.py
- [X] T025 [US4] Add --count flag to show total record count in database
- [X] T026 [US4] Implement filter_by_source() function with SELECT WHERE source_path = $1 ORDER BY order_index
- [X] T027 [US4] Implement show_count() function with SELECT COUNT(*) FROM documents
- [X] T028 [US4] Add formatted output for filter results showing chunk_id, title, order_index
- [X] T029 [US4] Wire --source and --count flags to respective functions

**Checkpoint**: US4 complete - all filtering and count queries work

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation validation

- [X] T030 Add summary output at end of main() showing chunks processed, records stored
- [X] T031 [P] Add docstrings to all functions in scripts/store-metadata.py
- [X] T032 [P] Run quickstart.md validation - verify all commands work as documented
- [X] T033 Verify performance: ingestion < 30 seconds, lookup < 100ms

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - delivers MVP
- **User Story 2 (Phase 4)**: Depends on US1 (data must be stored to look up)
- **User Story 3 (Phase 5)**: Can run in parallel with US2 (modifies same file but different function)
- **User Story 4 (Phase 6)**: Depends on US1 (data must be stored to filter)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - no story dependencies (CRITICAL PATH)
- **User Story 2 (P1)**: Requires US1 data to exist for meaningful lookup
- **User Story 3 (P1)**: Requires US1 implementation to modify INSERT → UPSERT
- **User Story 4 (P2)**: Requires US1 data to exist for meaningful filtering

### Within Each User Story

- Core function implementation first
- Error handling second
- Integration with main() third
- Verification last

### Parallel Opportunities

**Phase 1 (Setup):**
```bash
# Can run in parallel:
Task T002: "Add DATABASE_URL example to data/.env.example"
Task T003: "Verify DATABASE_URL is configured in .env file"
```

**Phase 7 (Polish):**
```bash
# Can run in parallel:
Task T031: "Add docstrings to all functions in scripts/store-metadata.py"
Task T032: "Run quickstart.md validation"
```

---

## Parallel Example: Phase 1 Setup

```bash
# Launch setup tasks together:
Task: "Install psycopg2-binary dependency"
Task: "Add DATABASE_URL example to data/.env.example"
Task: "Verify DATABASE_URL is configured in .env file"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `python scripts/store-metadata.py` and verify 15 records
5. MVP complete - basic metadata storage works

### Incremental Delivery

1. Setup + Foundational → Can connect to DB and create table
2. Add User Story 1 → Can store all metadata (MVP!)
3. Add User Story 2 → Can look up by chunk_id (citations enabled!)
4. Add User Story 3 → Idempotent re-runs (operational reliability!)
5. Add User Story 4 → Advanced filtering (nice-to-have)
6. Polish → Documentation validated, performance verified

### Single Developer Strategy

Execute phases sequentially:
1. Phase 1 → Phase 2 → Phase 3 (MVP checkpoint)
2. Phase 4 → Phase 5 → Phase 6
3. Phase 7 (cleanup)

Total tasks: 33
Estimated completion: 1-2 hours for experienced developer

---

## Notes

- All tasks modify single file: `scripts/store-metadata.py`
- [P] tasks can run in parallel (different areas of same file or different files)
- [Story] label maps task to specific user story for traceability
- Commit after each phase completion
- Test manually via CLI flags (no automated test suite per spec)
- Follow patterns from existing `scripts/embed-vectors.py` and `scripts/search-vectors.py`
