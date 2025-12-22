# Data Model: RAG Metadata Persistence

**Feature**: 004-rag-metadata-persistence
**Date**: 2025-12-13

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       documents                              │
├─────────────────────────────────────────────────────────────┤
│ chunk_id      VARCHAR(50)   PK    Links to Qdrant vectors   │
│ source_path   TEXT          NN    Original file path         │
│ slug          VARCHAR(100)  NN    URL-friendly identifier    │
│ title         VARCHAR(255)        Human-readable title       │
│ order_index   INTEGER       NN    Position within document   │
│ snippet       TEXT          NN    Full text content          │
│ created_at    TIMESTAMP     DEF   Record creation timestamp  │
├─────────────────────────────────────────────────────────────┤
│ INDEXES:                                                     │
│   - PRIMARY KEY (chunk_id)                                   │
│   - idx_documents_source_path (source_path)                  │
│   - idx_documents_slug (slug)                                │
└─────────────────────────────────────────────────────────────┘

         │
         │ chunk_id matches
         │
         ▼

┌─────────────────────────────────────────────────────────────┐
│              Qdrant: book_vectors collection                 │
├─────────────────────────────────────────────────────────────┤
│ id            INTEGER       Deterministic from chunk_id      │
│ vector        FLOAT[1024]   Cohere embedding                 │
│ payload:                                                     │
│   - chunk_id  STRING        Links to documents table         │
│   - text      STRING        (duplicated for search preview)  │
│   - source_path, slug, title, order_index                    │
└─────────────────────────────────────────────────────────────┘
```

## Table Definition

### documents

The primary table storing metadata for each content chunk.

```sql
CREATE TABLE IF NOT EXISTS documents (
    chunk_id      VARCHAR(50)   PRIMARY KEY,
    source_path   TEXT          NOT NULL,
    slug          VARCHAR(100)  NOT NULL,
    title         VARCHAR(255),
    order_index   INTEGER       NOT NULL,
    snippet       TEXT          NOT NULL,
    created_at    TIMESTAMP     DEFAULT NOW()
);

-- Indexes for filtering queries
CREATE INDEX IF NOT EXISTS idx_documents_source_path ON documents(source_path);
CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
```

## Field Specifications

| Field | Type | Constraints | Source | Description |
|-------|------|-------------|--------|-------------|
| chunk_id | VARCHAR(50) | PK | chunks.json | Unique identifier (e.g., "doc-001-0001") |
| source_path | TEXT | NOT NULL | chunks.json | Original markdown file path |
| slug | VARCHAR(100) | NOT NULL | chunks.json | URL-friendly document ID |
| title | VARCHAR(255) | - | chunks.json | Chapter/document title (may be empty) |
| order_index | INTEGER | NOT NULL | chunks.json | 1-based position within source doc |
| snippet | TEXT | NOT NULL | chunks.json.text | Full text content of the chunk |
| created_at | TIMESTAMP | DEFAULT NOW() | Generated | Record insertion timestamp |

## Data Flow

```
chunks.json (Source of Truth)
      │
      │ Read by scripts/embed-vectors.py
      │
      ├────────────────────────────┐
      │                            │
      ▼                            ▼
┌─────────────┐           ┌─────────────────┐
│   Qdrant    │           │  Neon Postgres  │
│ book_vectors│           │   documents     │
├─────────────┤           ├─────────────────┤
│ - Vectors   │           │ - Metadata      │
│ - Embeddings│  chunk_id │ - Structured    │
│ - Search    │◄─────────►│ - SQL queries   │
└─────────────┘           └─────────────────┘
      │                            │
      │ Search results             │ Lookup by chunk_id
      ▼                            ▼
┌─────────────────────────────────────────────┐
│            RAG Response Pipeline             │
│  - Vector search returns chunk_ids           │
│  - Metadata lookup provides citations        │
│  - Response includes source attribution      │
└─────────────────────────────────────────────┘
```

## Sample Data

Based on actual `chunks.json` content:

| chunk_id | source_path | slug | title | order_index | snippet (truncated) |
|----------|-------------|------|-------|-------------|---------------------|
| doc-001-0001 | docs/chapter-1/index.md | chapter-1-index | Introduction to Physical AI | 1 | Physical AI represents a fundamental... |
| doc-001-0002 | docs/chapter-1/index.md | chapter-1-index | Introduction to Physical AI | 2 | Among all possible robot forms... |
| doc-001-0003 | docs/chapter-1/index.md | chapter-1-index | Introduction to Physical AI | 3 | Next: In Chapter 2, we'll explore... |
| doc-002-0001 | docs/chapter-2/index.md | chapter-2-index | Humanoid Robot Architecture | 1 | A humanoid robot is a marvel of... |

## Query Patterns

### Primary: Lookup by chunk_id (Citation)

```sql
SELECT source_path, slug, title, order_index, snippet
FROM documents
WHERE chunk_id = $1;
```

Expected: < 100ms (indexed primary key lookup)

### Batch: Lookup multiple chunk_ids

```sql
SELECT chunk_id, source_path, slug, title, order_index, snippet
FROM documents
WHERE chunk_id = ANY($1::varchar[]);
```

Used when vector search returns multiple results.

### Filter: By source document

```sql
SELECT chunk_id, title, order_index
FROM documents
WHERE source_path = $1
ORDER BY order_index;
```

### Filter: By slug pattern

```sql
SELECT chunk_id, source_path, title
FROM documents
WHERE slug LIKE $1 || '%';
```

## Upsert Pattern

```sql
INSERT INTO documents (chunk_id, source_path, slug, title, order_index, snippet, created_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
ON CONFLICT (chunk_id) DO UPDATE SET
    source_path = EXCLUDED.source_path,
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    order_index = EXCLUDED.order_index,
    snippet = EXCLUDED.snippet;
```

## Constraints

### Size Estimates

- Current dataset: 15 chunks
- Average snippet size: ~2,500 characters
- Total storage: < 1MB (well within Neon free tier)

### Referential Integrity

- `chunk_id` serves as logical foreign key to Qdrant vectors
- No formal FK constraint (cross-system reference)
- Application ensures consistency during ingestion

### Data Lifecycle

- Records created during metadata ingestion
- Records updated on re-runs (upsert behavior)
- No deletion mechanism in MVP (re-create by re-running)
