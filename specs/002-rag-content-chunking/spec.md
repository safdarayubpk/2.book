# Feature Specification: Book Content Ingestion & Chunking for RAG Pipeline

**Feature Branch**: `002-rag-content-chunking`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "Book content ingestion & chunking for RAG pipeline - preparing Docusaurus book content for embedding and retrieval stages"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ingest Book Content (Priority: P1)

As a developer building a RAG chatbot, I want to run an ingestion script that reads all markdown files from the Docusaurus book so that I have access to the complete textbook content for processing.

**Why this priority**: This is the foundation - without ingesting content, no subsequent processing is possible. The entire pipeline depends on successfully reading all source files.

**Independent Test**: Run the ingestion script against the /docs directory and verify it discovers and reads all markdown files. Output should list all files processed.

**Acceptance Scenarios**:

1. **Given** a Docusaurus book with markdown files in /docs, **When** I run the ingestion script, **Then** all .md files under /docs/**/*.md are discovered and read
2. **Given** markdown files with YAML frontmatter containing title metadata, **When** the script processes these files, **Then** the title is extracted from frontmatter if present
3. **Given** nested directory structures (e.g., /docs/chapter-1/section-1.md), **When** the script runs, **Then** all files at any depth are processed

---

### User Story 2 - Clean Text Extraction (Priority: P1)

As a developer, I want markdown syntax to be stripped from the content so that the resulting text is clean and suitable for semantic understanding by language models.

**Why this priority**: Clean text is essential for quality embeddings and retrieval. Markdown syntax adds noise that degrades RAG performance.

**Independent Test**: Process a markdown file with headings, code blocks, links, and images. Verify the output contains only readable prose text.

**Acceptance Scenarios**:

1. **Given** markdown content with headings (# ## ###), **When** text is extracted, **Then** heading markers are removed but heading text is preserved
2. **Given** markdown content with code blocks (``` ```), **When** text is extracted, **Then** code blocks are removed entirely
3. **Given** markdown content with links ([text](url)), **When** text is extracted, **Then** only the link text is preserved, URLs are removed
4. **Given** markdown content with images (![alt](src)), **When** text is extracted, **Then** images are removed (alt text may optionally be preserved)
5. **Given** markdown content with inline formatting (*bold*, _italic_), **When** text is extracted, **Then** formatting markers are removed but text is preserved

---

### User Story 3 - Deterministic Chunking (Priority: P1)

As a developer, I want content to be split into semantic chunks of 400-600 tokens so that each chunk is appropriately sized for embedding models and maintains semantic coherence.

**Why this priority**: Chunk size directly impacts retrieval quality. Chunks that are too large miss precision; chunks that are too small lose context.

**Independent Test**: Run the chunking process on the same input twice. Verify outputs are identical. Verify chunk token counts are within the target range.

**Acceptance Scenarios**:

1. **Given** clean extracted text, **When** chunking is performed, **Then** each chunk contains approximately 400-600 tokens
2. **Given** the same input content, **When** chunking is run multiple times, **Then** the output is identical (deterministic)
3. **Given** paragraph or sentence boundaries, **When** chunks are created, **Then** splits occur at natural boundaries (not mid-sentence when possible)
4. **Given** content shorter than 400 tokens, **When** chunking is performed, **Then** the entire content becomes a single chunk

---

### User Story 4 - Structured Output Generation (Priority: P1)

As a developer, I want each chunk to include metadata (chunk_id, source path, title, slug, order index) so that I can trace chunks back to their source and maintain document ordering.

**Why this priority**: Metadata enables traceability for hackathon reviewers and supports citation/reference features in the final chatbot.

**Independent Test**: Generate chunks.json and verify each chunk contains all required metadata fields with valid values.

**Acceptance Scenarios**:

1. **Given** processed chunks, **When** output is generated, **Then** a chunks.json file is created containing all chunks
2. **Given** each chunk, **When** output is written, **Then** chunk includes: chunk_id, text, source_path, slug, title, order_index
3. **Given** chunks from the same document, **When** order_index is assigned, **Then** indices are sequential starting from 1
4. **Given** a source file path like "docs/chapter-1/intro.md", **When** slug is generated, **Then** slug is derived consistently (e.g., "chapter-1-intro")
5. **Given** chunk_id generation, **When** IDs are created, **Then** IDs are stable based on file and position (e.g., "doc-001-0001")

---

### Edge Cases

- What happens when a markdown file is empty or contains only frontmatter?
  - System should skip the file or create no chunks for it
- What happens when frontmatter is missing the title field?
  - System should derive title from filename or first heading
- What happens when a file contains only code blocks?
  - After stripping, if no text remains, no chunks are created
- How does the system handle non-markdown files in /docs?
  - System should ignore files without .md extension
- What happens when content is exactly at chunk boundary (e.g., exactly 500 tokens)?
  - Content should be included in single chunk without unnecessary splits

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST recursively traverse /docs directory to discover all .md files
- **FR-002**: System MUST read and parse YAML frontmatter to extract document title
- **FR-003**: System MUST remove markdown syntax including: headings, code blocks, inline code, links, images, bold, italic, lists, blockquotes, horizontal rules
- **FR-004**: System MUST preserve readable text content after markdown removal
- **FR-005**: System MUST split content into chunks targeting 400-600 tokens per chunk
- **FR-006**: System MUST split at natural boundaries (paragraph or sentence) when possible
- **FR-007**: System MUST assign each chunk a unique, stable chunk_id based on source file and position
- **FR-008**: System MUST include source_path, slug, title, and order_index metadata for each chunk
- **FR-009**: System MUST output all chunks to a single chunks.json file
- **FR-010**: System MUST produce identical output when run multiple times on the same input (deterministic)
- **FR-011**: System MUST execute locally without external API calls
- **FR-012**: System MUST NOT require embeddings, vector databases, or AI services

### Key Entities

- **Document**: A single markdown file from /docs; has path, title (from frontmatter or derived), and raw content
- **Chunk**: A segment of clean text from a document; has chunk_id, text, source reference, and ordering metadata
- **ChunkCollection**: The complete set of chunks from all documents; serialized as chunks.json

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of markdown files under /docs/**/*.md are processed without errors
- **SC-002**: All chunks contain between 300-700 tokens (allowing 100-token tolerance from target 400-600 range)
- **SC-003**: Total chunk count in chunks.json is greater than 0
- **SC-004**: Each chunk is readable prose without markdown syntax artifacts
- **SC-005**: Re-running the ingestion script produces byte-identical chunks.json output
- **SC-006**: Every chunk includes all required metadata fields (chunk_id, text, source_path, slug, title, order_index)
- **SC-007**: Script completes processing of entire book content in under 30 seconds on standard hardware

## Assumptions

- The Docusaurus book exists at the repository root with content in /docs directory
- Markdown files use standard CommonMark or GitHub-flavored markdown syntax
- Frontmatter uses YAML format with optional "title" field
- Token counting uses a simple word-based approximation (words / 0.75 ≈ tokens) suitable for later embedding models
- The output chunks.json will be consumed by a separate embedding pipeline (not part of this spec)
- Python or Node.js runtime is available for script execution

## Constraints

- No external APIs (no OpenAI, Cohere, or other AI services)
- No embeddings or vector databases
- No FastAPI server or backend services
- Local execution only
- Output format must be JSON
- Chunking logic must be reusable for later embedding stages

## Out of Scope

- Embeddings or semantic search
- Vector database integration
- RAG retrieval logic
- Chatbot or AI agent implementation
- UI or frontend integration
- Deployment or hosting configuration
