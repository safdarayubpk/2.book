# Feature Specification: RAG Metadata Persistence

**Feature Branch**: `004-rag-metadata-persistence`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "Metadata persistence and traceability for RAG pipeline"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Store Chunk Metadata (Priority: P1)

As a RAG pipeline developer, I need to persist structured metadata for each content chunk to a database, so that I can maintain a reliable mapping between chunk IDs and their source documents for citation and traceability.

**Why this priority**: This is the core functionality - without storing metadata, no other features (lookup, filtering, auditability) are possible. This forms the foundation of the traceability system.

**Independent Test**: Can be fully tested by running the metadata ingestion script against chunks.json and verifying that all 15 chunks have corresponding rows in the database with complete metadata.

**Acceptance Scenarios**:

1. **Given** a valid chunks.json file exists with 15 chunks, **When** the metadata ingestion script runs, **Then** 15 rows are inserted into the documents table with all required fields populated
2. **Given** a chunk has all metadata fields (chunk_id, source_path, slug, title, order_index, text), **When** it is persisted, **Then** all fields are stored correctly and retrievable
3. **Given** a chunk has an empty or missing title field, **When** it is persisted, **Then** the system stores an empty string or null value without failing

---

### User Story 2 - Lookup Metadata by Chunk ID (Priority: P1)

As a RAG system component, I need to retrieve metadata for a specific chunk by its chunk_id, so that I can provide citations and source attribution when returning search results to users.

**Why this priority**: Critical for the primary use case - joining vector search results with source metadata to enable citations. Without this, the RAG system cannot provide explainable results.

**Independent Test**: Can be tested by querying the database with a known chunk_id and verifying the correct metadata is returned in under 100ms.

**Acceptance Scenarios**:

1. **Given** a chunk_id exists in the database, **When** I query by chunk_id, **Then** I receive the complete metadata record (source_path, slug, title, order_index, snippet)
2. **Given** a chunk_id does not exist in the database, **When** I query by chunk_id, **Then** I receive an empty result or appropriate indication that no record was found
3. **Given** multiple chunk_ids to look up, **When** I query for all of them, **Then** I receive results efficiently without N+1 query issues

---

### User Story 3 - Idempotent Re-runs (Priority: P1)

As a developer maintaining the RAG pipeline, I need the metadata ingestion to be idempotent, so that re-running the script does not create duplicate records or corrupt existing data.

**Why this priority**: Essential for operational reliability. Developers will re-run the pipeline during development and maintenance. Duplicate records would break the unique mapping between chunk_id and metadata.

**Independent Test**: Can be tested by running the ingestion script twice and verifying the row count remains unchanged (15 rows, not 30).

**Acceptance Scenarios**:

1. **Given** the documents table already contains metadata for all chunks, **When** the ingestion script runs again, **Then** the row count remains the same
2. **Given** a chunk's metadata has changed in chunks.json, **When** the ingestion script runs, **Then** the existing record is updated (upsert behavior) rather than creating a duplicate
3. **Given** a partial failure occurred in a previous run, **When** the script runs again, **Then** it completes successfully without errors from existing records

---

### User Story 4 - Filter Metadata by Source (Priority: P2)

As a developer building advanced RAG features, I need to filter metadata by source_path or slug, so that I can implement source-specific retrieval or display grouped results by document.

**Why this priority**: Enables advanced filtering use cases but not required for basic citation functionality. Can be implemented after core storage and lookup are working.

**Independent Test**: Can be tested by querying all chunks from a specific source_path (e.g., "docs/chapter-1/index.md") and verifying only matching records are returned.

**Acceptance Scenarios**:

1. **Given** multiple chunks exist from different source documents, **When** I filter by source_path, **Then** I receive only chunks from that source document
2. **Given** multiple chunks with the same slug prefix, **When** I filter by slug pattern, **Then** I receive matching chunks efficiently

---

### Edge Cases

- What happens when chunks.json contains a chunk with extremely long text (>10,000 characters)?
  - System should store the text without truncation (TEXT column type supports large content)
- What happens when chunks.json is missing or malformed?
  - System should fail gracefully with a clear error message before any database operations
- What happens when the database connection fails mid-insertion?
  - System should use transactions to ensure atomicity - either all chunks are inserted or none
- What happens when chunk_id format changes between runs?
  - System maintains historical records; new chunk_ids create new records
- What happens when DATABASE_URL is not configured?
  - System should fail immediately with clear instructions on required configuration

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create the documents table if it does not exist
- **FR-002**: System MUST load chunks from chunks.json file (single source of truth)
- **FR-003**: System MUST insert one metadata row per chunk into the documents table
- **FR-004**: System MUST enforce uniqueness on chunk_id column
- **FR-005**: System MUST support re-runs without creating duplicate records (upsert behavior)
- **FR-006**: System MUST allow efficient lookup of metadata by chunk_id
- **FR-007**: System MUST allow filtering of metadata by source_path
- **FR-008**: System MUST allow filtering of metadata by slug
- **FR-009**: System MUST log insertion progress (batch N/M processed)
- **FR-010**: System MUST log final count of records inserted/updated
- **FR-011**: System MUST handle missing or empty title fields gracefully
- **FR-012**: System MUST store snippet text without arbitrary truncation
- **FR-013**: System MUST use transactions to ensure atomicity of batch operations

### Key Entities

- **Document (Chunk Metadata)**: Represents metadata for a single content chunk
  - chunk_id: Unique identifier linking to vector database entries
  - source_path: Original file path of the source document
  - slug: URL-friendly identifier for the document
  - title: Human-readable title of the source document
  - order_index: Position of chunk within its source document
  - snippet: Text content of the chunk (for display in citations)
  - created_at: Timestamp when the record was created

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All chunk metadata (15 chunks) is stored in the database after running the ingestion script
- **SC-002**: Each chunk_id appears exactly once in the documents table (uniqueness enforced)
- **SC-003**: Metadata lookup by chunk_id returns results in under 100 milliseconds
- **SC-004**: Re-running the ingestion script does not increase the row count (idempotency verified)
- **SC-005**: All 6 required metadata fields are queryable and correctly populated for each record
- **SC-006**: Filtering by source_path returns accurate results (no false positives or negatives)
- **SC-007**: The ingestion process completes in under 30 seconds for the current dataset

## Scope

### In Scope

- Postgres table creation (documents table)
- Metadata ingestion from chunks.json
- Upsert logic for idempotent operations
- Basic query capabilities (by chunk_id, by source_path, by slug)
- Progress logging during ingestion
- Verification queries/scripts

### Out of Scope

- Vector database integration
- Embedding generation
- Semantic search
- FastAPI or backend API endpoints
- Chatbot or AI agent functionality
- Frontend UI
- ORM implementation (raw SQL is acceptable)

## Assumptions

- chunks.json file is generated by the existing content chunking pipeline (Spec-002)
- chunks.json contains all required fields: chunk_id, text, source_path, slug, title, order_index
- Neon Serverless Postgres is available and DATABASE_URL environment variable is configured
- Python runtime environment is available with database driver support
- Current dataset size is approximately 15 chunks (small scale)
- snippet field will store the full text content (same as the "text" field in chunks.json)

## Dependencies

- **Spec-002 (Content Chunking)**: chunks.json file must exist and be valid
- **Neon Postgres**: Database service must be provisioned and accessible
- **Environment Configuration**: DATABASE_URL must be set in .env file
