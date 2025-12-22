# Tasks: Book Content Ingestion & Chunking for RAG Pipeline

**Input**: Design documents from `/specs/002-rag-content-chunking/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Note: All 4 user stories are P1 priority and form a linear pipeline - each depends on the previous, so they are organized sequentially rather than in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: Script in `scripts/`, output in `data/`
- `scripts/ingest-content.ts` - Main ingestion script
- `data/chunks.json` - Generated output (not committed)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Create scripts/ directory at repository root
- [X] T002 Create data/ directory at repository root for output
- [X] T003 Install dev dependencies: gray-matter, remark, remark-parse, strip-markdown, unified, @types/node
- [X] T004 [P] Add data/chunks.json to .gitignore (generated file)
- [X] T005 [P] Create scripts/types.ts with TypeScript interfaces (Document, Chunk, ChunkCollection)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utility functions that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement estimateTokens() utility function in scripts/utils.ts (word count × 1.33)
- [X] T007 [P] Implement generateSlug() utility function in scripts/utils.ts (path to slug conversion)
- [X] T008 [P] Implement generateChunkId() utility function in scripts/utils.ts (doc-NNN-NNNN format)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Ingest Book Content (Priority: P1)

**Goal**: Script reads all markdown files from the Docusaurus book, discovers files recursively, and extracts frontmatter with title metadata

**Independent Test**: Run the script and verify it outputs a list of all 7 markdown files discovered with their titles

### Implementation for User Story 1

- [X] T009 [US1] Implement discoverMarkdownFiles() in scripts/ingest-content.ts - recursive traversal of docs/**/*.md
- [X] T010 [US1] Implement loadDocument() in scripts/ingest-content.ts - read file content with gray-matter
- [X] T011 [US1] Implement title extraction logic in loadDocument() - frontmatter title or derive from filename
- [X] T012 [US1] Add alphabetical sorting of discovered files for deterministic ordering
- [X] T013 [US1] Add console logging to show files being processed

**Checkpoint**: At this point, User Story 1 should work - script discovers and loads all 7 markdown files

---

## Phase 4: User Story 2 - Clean Text Extraction (Priority: P1)

**Goal**: Markdown syntax is stripped from content, producing clean prose text suitable for language models

**Independent Test**: Process a file with headings, code blocks, and links. Verify output is clean prose without markdown syntax

**Depends on**: User Story 1 (needs loaded document content)

### Implementation for User Story 2

- [X] T014 [US2] Implement stripMarkdown() in scripts/ingest-content.ts using remark and strip-markdown
- [X] T015 [US2] Configure strip-markdown to remove: headings, code blocks, links, images, bold, italic
- [X] T016 [US2] Implement normalizeWhitespace() to clean up excess whitespace after stripping
- [X] T017 [US2] Integrate stripMarkdown() into document processing pipeline

**Checkpoint**: At this point, User Stories 1 AND 2 should work - documents are loaded and cleaned

---

## Phase 5: User Story 3 - Deterministic Chunking (Priority: P1)

**Goal**: Content is split into semantic chunks of 400-600 tokens at paragraph/sentence boundaries

**Independent Test**: Run chunking twice on same input, verify outputs are identical. Verify token counts are within 300-700 range.

**Depends on**: User Story 2 (needs clean text)

### Implementation for User Story 3

- [X] T018 [US3] Implement splitIntoParagraphs() in scripts/chunker.ts - split on double newlines
- [X] T019 [US3] Implement splitIntoSentences() in scripts/chunker.ts - split on sentence boundaries
- [X] T020 [US3] Implement chunkDocument() in scripts/chunker.ts - accumulate paragraphs until 400-600 tokens
- [X] T021 [US3] Handle edge case: paragraph exceeds 600 tokens - fall back to sentence splitting
- [X] T022 [US3] Handle edge case: document shorter than 400 tokens - create single chunk
- [X] T023 [US3] Integrate chunkDocument() into main pipeline

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work - documents are chunked deterministically

---

## Phase 6: User Story 4 - Structured Output Generation (Priority: P1)

**Goal**: Each chunk includes full metadata and output is written to chunks.json

**Independent Test**: Generate chunks.json, verify each chunk has all 6 required fields with valid values

**Depends on**: User Story 3 (needs chunked content)

### Implementation for User Story 4

- [X] T024 [US4] Implement buildChunkMetadata() in scripts/ingest-content.ts - assign chunk_id, source_path, slug, title, order_index
- [X] T025 [US4] Implement buildChunkCollection() in scripts/ingest-content.ts - aggregate all chunks with optional metadata
- [X] T026 [US4] Implement writeOutput() in scripts/ingest-content.ts - serialize to data/chunks.json with JSON.stringify
- [X] T027 [US4] Add summary logging: total documents processed, total chunks created
- [X] T028 [US4] Create main() function to orchestrate full pipeline and handle errors

**Checkpoint**: All user stories should now be functional - full pipeline produces chunks.json

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation, verification, and final cleanup

- [X] T029 Verify all 7 markdown files are processed (SC-001)
- [X] T030 [P] Verify chunk token counts are within 300-700 range (SC-002)
- [X] T031 [P] Verify total chunk count > 0 (SC-003)
- [X] T032 Verify chunks contain no markdown syntax artifacts (SC-004)
- [X] T033 Run script twice and diff outputs to verify determinism (SC-005)
- [X] T034 Validate chunks.json against contracts/chunk-schema.json (SC-006)
- [X] T035 Verify script completes in under 30 seconds (SC-007)
- [X] T036 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: Form a linear pipeline:
  - US1 (Ingest) → US2 (Clean) → US3 (Chunk) → US4 (Output)
  - Each story depends on the previous
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Depends on User Story 1 (needs loaded content)
- **User Story 3 (P1)**: Depends on User Story 2 (needs clean text)
- **User Story 4 (P1)**: Depends on User Story 3 (needs chunks)

### Within Each User Story

- Utility functions before main logic
- Core implementation before integration
- Logging after functionality works

### Parallel Opportunities

- Setup tasks T004-T005 marked [P] can run in parallel
- Foundational tasks T007-T008 marked [P] can run in parallel
- Polish tasks T030-T031 marked [P] can run in parallel

---

## Parallel Example: Setup Phase

```bash
# Launch parallel setup tasks:
Task: "Add data/chunks.json to .gitignore"
Task: "Create scripts/types.ts with TypeScript interfaces"
```

---

## Parallel Example: Foundational Phase

```bash
# Launch parallel utility functions:
Task: "Implement generateSlug() utility function in scripts/utils.ts"
Task: "Implement generateChunkId() utility function in scripts/utils.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008)
3. Complete Phase 3: User Story 1 (T009-T013)
4. **STOP and VALIDATE**: Script discovers all 7 files
5. Continue to User Story 2

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test file discovery → Checkpoint
3. Add User Story 2 → Test markdown stripping → Checkpoint
4. Add User Story 3 → Test chunking → Checkpoint
5. Add User Story 4 → Test output → Full pipeline complete
6. Complete Polish → Final validation

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6**

All user stories are P1 and form a single pipeline. The MVP is the complete working pipeline. There is no intermediate deployable state - all 4 stories must work together to produce useful output.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This feature is a single script pipeline - all user stories are needed for functional output
- No tests included - manual verification per quickstart.md
- Commit after each phase or logical group
- Run determinism check (T033) before considering feature complete
