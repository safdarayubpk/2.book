# Feature Specification: Embeddings Generation & Vector Storage for RAG Pipeline

**Feature Branch**: `003-rag-vector-embeddings`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "Embeddings generation and vector storage for RAG pipeline - convert pre-chunked book content into embeddings and store in vector database for semantic search"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Embeddings from Chunks (Priority: P1)

As a developer building a RAG system, I want to convert all text chunks from chunks.json into vector embeddings so that the content can be semantically searched.

**Why this priority**: Without embeddings, semantic search is impossible. This is the foundational transformation that enables RAG retrieval.

**Independent Test**: Run the embedding script and verify that embeddings are generated for all chunks. Each embedding should have the expected dimensions.

**Acceptance Scenarios**:

1. **Given** chunks.json exists with N chunks, **When** the embedding script runs, **Then** N embeddings are generated
2. **Given** a chunk with text content, **When** embedding is generated, **Then** the embedding vector has the correct dimension count
3. **Given** the embedding process starts, **When** processing completes, **Then** progress is logged showing chunks processed

---

### User Story 2 - Store Vectors in Vector Database (Priority: P1)

As a developer, I want to store the generated embeddings in a vector database with their metadata so that I can retrieve relevant chunks based on semantic similarity.

**Why this priority**: Storage is required for retrieval. Without persisting vectors, the embeddings would be lost and semantic search would be unavailable.

**Independent Test**: After running the storage script, query the vector database and verify the expected number of vectors exist with correct metadata.

**Acceptance Scenarios**:

1. **Given** generated embeddings, **When** storage script runs, **Then** vectors are stored in a collection named "book_vectors"
2. **Given** each vector, **When** stored, **Then** metadata payload includes: chunk_id, source_path, slug, title, order_index
3. **Given** vectors already exist from a previous run, **When** script runs again, **Then** vectors are upserted (no duplicates created)
4. **Given** the vector database is empty, **When** storage runs, **Then** the collection is created automatically

---

### User Story 3 - Semantic Similarity Search (Priority: P1)

As a developer, I want to search for chunks semantically similar to a query so that I can verify the pipeline works and prepare for RAG retrieval.

**Why this priority**: Search capability validates the entire pipeline works end-to-end and is the core functionality needed by downstream RAG features.

**Independent Test**: Run a search query like "robotics simulation" and verify relevant chunks are returned with their metadata and similarity scores.

**Acceptance Scenarios**:

1. **Given** vectors are stored, **When** a semantic query is executed, **Then** top-k most similar chunks are returned
2. **Given** a search result, **When** results are displayed, **Then** each result includes chunk text, metadata, and similarity score
3. **Given** query "humanoid robot movement", **When** search runs, **Then** results include chunks from motion/control chapters

---

### Edge Cases

- What happens when a chunk has very short text (< 10 characters)?
  - System should still generate an embedding, but log a warning
- What happens when the embedding API is rate-limited?
  - System should implement retry with exponential backoff
- What happens when the vector database is unreachable?
  - System should fail gracefully with clear error message
- What happens when chunks.json is missing or invalid?
  - System should exit with descriptive error before API calls
- What happens on partial upload failure?
  - System should log which chunks failed and allow re-run to complete

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load chunks from chunks.json file
- **FR-002**: System MUST validate chunks.json structure before processing
- **FR-003**: System MUST generate embeddings for each chunk's text content
- **FR-004**: System MUST create the vector collection if it does not exist
- **FR-005**: System MUST upsert vectors using deterministic IDs (based on chunk_id)
- **FR-006**: System MUST attach metadata payload (chunk_id, source_path, slug, title, order_index) to each vector
- **FR-007**: System MUST support top-k semantic similarity search
- **FR-008**: System MUST return search results with text, metadata, and similarity score
- **FR-009**: System MUST handle API rate limits with retry logic
- **FR-010**: System MUST log progress during embedding generation and storage
- **FR-011**: System MUST be idempotent (re-runs do not create duplicate vectors)
- **FR-012**: System MUST read API credentials from environment variables

### Key Entities

- **Chunk** (input): Text segment with metadata from chunks.json; has chunk_id, text, source_path, slug, title, order_index
- **Embedding**: Vector representation of chunk text; has embedding vector and associated chunk_id
- **VectorPoint**: Stored vector in database; has id, vector, and metadata payload
- **SearchResult**: Query result; has chunk text, metadata, and similarity score

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of chunks from chunks.json are embedded and stored
- **SC-002**: Vector count in database equals chunk count in chunks.json
- **SC-003**: Semantic search returns results in under 2 seconds
- **SC-004**: Re-running the pipeline does not increase vector count (idempotent)
- **SC-005**: Search query returns at least 1 relevant result for test queries
- **SC-006**: All stored vectors have complete metadata payload (5 fields)
- **SC-007**: Pipeline completes processing of all chunks in under 5 minutes

## Assumptions

- chunks.json exists at `data/chunks.json` and follows the schema from spec-002
- API credentials are provided via environment variables
- Internet connectivity is available for API calls
- The embedding model produces fixed-dimension vectors
- The vector database free tier has sufficient capacity for the book content (~15-50 vectors)
- Batch processing is supported for efficiency

## Constraints

- Use Cohere for embedding generation (not OpenAI)
- Use Qdrant Cloud Free Tier for vector storage
- No chatbot, UI, or agent logic in this spec
- No FastAPI server or backend services
- Local script execution only
- chunks.json is the single source of truth for content

## Dependencies

- **Spec-002** (rag-content-chunking): Provides chunks.json input file
- External services: Cohere API, Qdrant Cloud

## Out of Scope

- Metadata relational database (Neon) - separate spec
- RAG answer generation - separate spec
- FastAPI endpoints - separate spec
- Chat UI - separate spec
- Highlight-based queries - future enhancement
