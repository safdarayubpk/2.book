# Data Model: Book Content Ingestion & Chunking

**Feature**: 002-rag-content-chunking
**Date**: 2025-12-13

## Entities

### Document

Represents a single markdown file from the `/docs` directory.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| path | string | Relative path from repo root (e.g., `docs/chapter-1/index.md`) | File system |
| title | string | Document title | Frontmatter `title` field, or derived from filename |
| slug | string | URL-friendly identifier (e.g., `chapter-1-index`) | Derived from path |
| docNumber | number | Sequential document number (1, 2, 3...) | Order in sorted file list |
| rawContent | string | Original markdown content | File read |
| cleanContent | string | Text with markdown syntax removed | After processing |

**Validation Rules**:
- `path` must end with `.md`
- `path` must be under `docs/` directory
- `title` must be non-empty (derived if not in frontmatter)
- `slug` must contain only lowercase letters, numbers, and hyphens

**Lifecycle**:
1. Discovered (file found)
2. Loaded (content read)
3. Parsed (frontmatter extracted)
4. Cleaned (markdown stripped)
5. Chunked (split into segments)

---

### Chunk

Represents a segment of clean text from a document, ready for embedding.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| chunk_id | string | Stable unique identifier | `doc-001-0001` |
| text | string | Clean, readable prose content | `"Physical AI combines..."` |
| source_path | string | Path to source document | `docs/chapter-1/index.md` |
| slug | string | Document slug | `chapter-1-index` |
| title | string | Document title | `Introduction to Physical AI` |
| order_index | number | 1-based position within document | `1`, `2`, `3` |

**Validation Rules**:
- `chunk_id` format: `doc-{NNN}-{NNNN}` where N is digit
- `text` must be non-empty after trimming
- `text` token count should be 300-700 (soft limit)
- `source_path` must match a valid document path
- `order_index` must be sequential starting from 1

**Relationships**:
- Many Chunks belong to one Document
- Chunks are ordered by `order_index` within their document
- Chunks are globally ordered by `chunk_id`

---

### ChunkCollection

Represents the complete output of the ingestion pipeline.

| Field | Type | Description |
|-------|------|-------------|
| chunks | Chunk[] | Array of all chunks from all documents |
| metadata | object | Pipeline metadata (optional, for debugging) |

**Metadata Fields** (optional):
- `generated_at`: ISO timestamp
- `total_documents`: number of documents processed
- `total_chunks`: number of chunks created
- `version`: pipeline version string

**Serialization**: JSON file at `data/chunks.json`

---

## Entity Relationships

```text
┌─────────────────┐
│    Document     │
├─────────────────┤
│ path            │
│ title           │
│ slug            │──────────┐
│ docNumber       │          │
│ rawContent      │          │
│ cleanContent    │          │
└─────────────────┘          │
        │                    │
        │ 1:N                │
        ▼                    │
┌─────────────────┐          │
│     Chunk       │          │
├─────────────────┤          │
│ chunk_id        │          │
│ text            │          │
│ source_path  ───┼──────────┘
│ slug         ───┼──────────┘
│ title        ───┼──────────┘
│ order_index     │
└─────────────────┘
        │
        │ N:1
        ▼
┌─────────────────┐
│ ChunkCollection │
├─────────────────┤
│ chunks[]        │
│ metadata        │
└─────────────────┘
```

---

## State Transitions

### Document Processing States

```text
[File Found] ──▶ [Content Loaded] ──▶ [Frontmatter Parsed] ──▶ [Markdown Cleaned] ──▶ [Chunked]
     │                 │                      │                        │                  │
     │                 │                      │                        │                  │
     ▼                 ▼                      ▼                        ▼                  ▼
  SKIP if          SKIP if               Use filename             SKIP if            Output
  not .md          read error            if no title            empty after           chunks
                                                                 cleaning
```

### Chunk Accumulation

```text
[Empty Chunk Buffer] ──▶ [Add Paragraph] ──▶ [Check Token Count]
                               ▲                     │
                               │                     ▼
                               │         ┌──── < 400 tokens ────┐
                               │         │                      │
                               └─────────┘               [Continue Adding]
                                                               │
                                                               ▼
                                                    ┌──── 400-600 tokens ────┐
                                                    │                        │
                                                    ▼                        ▼
                                            [Finalize Chunk]        [Add More if Fits]
                                                    │
                                                    ▼
                                            [Start New Chunk]
```

---

## Type Definitions (TypeScript)

```typescript
interface Document {
  path: string;
  title: string;
  slug: string;
  docNumber: number;
  rawContent: string;
  cleanContent: string;
}

interface Chunk {
  chunk_id: string;
  text: string;
  source_path: string;
  slug: string;
  title: string;
  order_index: number;
}

interface ChunkCollection {
  chunks: Chunk[];
  metadata?: {
    generated_at: string;
    total_documents: number;
    total_chunks: number;
    version: string;
  };
}
```

---

## Output Schema Location

See `contracts/chunk-schema.json` for JSON Schema definition.
