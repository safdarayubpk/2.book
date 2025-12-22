# Research: RAG Metadata Persistence

**Feature**: 004-rag-metadata-persistence
**Date**: 2025-12-13
**Status**: Complete

## Technology Decisions

### Database Driver: psycopg2

**Decision**: Use `psycopg2` (synchronous PostgreSQL adapter)

**Rationale**:
- Matches the synchronous pattern already established in `scripts/embed-vectors.py` and `scripts/search-vectors.py`
- No async requirements for this batch script (not a web server)
- Most widely used PostgreSQL adapter with excellent documentation
- Native support for Neon Serverless Postgres connection strings
- Simple, straightforward API for the script's needs

**Alternatives Considered**:
- `asyncpg`: Async adapter, unnecessary complexity for batch scripts
- `psycopg3`: Newer version, but psycopg2 is more battle-tested

### Upsert Strategy: ON CONFLICT DO UPDATE

**Decision**: Use PostgreSQL `ON CONFLICT` clause for upsert

```sql
INSERT INTO documents (chunk_id, source_path, slug, title, order_index, snippet, created_at)
VALUES (%s, %s, %s, %s, %s, %s, NOW())
ON CONFLICT (chunk_id) DO UPDATE SET
  source_path = EXCLUDED.source_path,
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index,
  snippet = EXCLUDED.snippet;
```

**Rationale**:
- Native PostgreSQL feature, no additional dependencies
- Single statement per record (or batch via executemany)
- Atomic operation - no race conditions
- Idempotent by design (re-runs update existing records)
- Updates all fields on conflict (metadata may change)

### Connection Handling: Direct Connection with SSL

**Decision**: Direct connection per script run (no pooling)

**Rationale**:
- Script runs once, processes 15 chunks, exits
- Connection pooling overhead not justified for single-run batch script
- Neon Serverless handles connection management on server side
- SSL required for Neon cloud connections (`sslmode=require`)

**Connection String Format**:
```
postgresql://user:password@host.neon.tech/neondb?sslmode=require
```

### Transaction Strategy: Single Transaction

**Decision**: Wrap all inserts in a single transaction

**Rationale**:
- Atomicity: All 15 records succeed or all fail
- Prevents partial state from failed runs
- Simple rollback on any error
- PostgreSQL handles this efficiently for small batches

### Schema Design

**Table**: `documents`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| chunk_id | VARCHAR(50) | PRIMARY KEY | Links to Qdrant vectors |
| source_path | TEXT | NOT NULL | Original file path |
| slug | VARCHAR(100) | NOT NULL, INDEX | URL-friendly ID |
| title | VARCHAR(255) | | May be empty |
| order_index | INTEGER | NOT NULL | Position in document |
| snippet | TEXT | NOT NULL | Full chunk text |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indexes**:
- Primary key on `chunk_id` (automatic)
- Index on `source_path` for filtering queries
- Index on `slug` for filtering queries

### Environment Configuration

**Required Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection string

**Pattern**: Same as existing scripts - load from `.env` file using `python-dotenv`

## Compatibility Analysis

### Existing Codebase Patterns

The project already has two Python scripts with established patterns:

1. **scripts/embed-vectors.py** - Reference for:
   - Environment loading (`load_env()` function)
   - chunks.json loading and validation
   - Batch processing with progress logging
   - Error handling with retries

2. **scripts/search-vectors.py** - Reference for:
   - CLI argument parsing
   - Output formatting
   - Single-record retrieval patterns

### Constitution Compliance

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Simplicity-First | ✅ Pass | Single script, raw SQL, no ORM |
| II. Mobile-Ready Performance | ✅ N/A | Backend script, not user-facing |
| III. RAG Accuracy | ✅ Supports | Enables citation lookup for RAG |
| IV. Personalization-Driven | ✅ N/A | Not user personalization feature |
| V. Free-Tier Compliance | ✅ Pass | Uses Neon free tier (within limits) |
| VI. Educational Focus | ✅ N/A | Infrastructure feature |
| VII. AI-Native Experience | ✅ Supports | Backend for AI features |
| VIII. Rapid Deployment | ✅ Pass | Simple script, no new services |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Neon connection issues | Low | Medium | Retry logic, clear error messages |
| Schema migration conflicts | Low | High | Use CREATE TABLE IF NOT EXISTS |
| Chunk data format changes | Medium | Low | Validate fields before insert |
| Free tier limits exceeded | Low | Low | 15 records is negligible |

## Implementation Approach

### Script Structure

```
scripts/store-metadata.py
├── load_env()           # Load DATABASE_URL from .env
├── load_chunks()        # Load/validate chunks.json (reuse from embed-vectors.py)
├── create_table()       # CREATE TABLE IF NOT EXISTS
├── store_metadata()     # Batch upsert with progress logging
├── verify_count()       # Confirm record count
└── main()               # Orchestrate pipeline
```

### Dependencies

**New**:
- `psycopg2-binary` - PostgreSQL adapter (binary distribution for easy install)

**Existing** (already installed):
- `python-dotenv` - Environment variable loading

### Verification Queries

```sql
-- Count records
SELECT COUNT(*) FROM documents;

-- Verify specific chunk
SELECT * FROM documents WHERE chunk_id = 'doc-001-0001';

-- Filter by source
SELECT chunk_id, title FROM documents WHERE source_path = 'docs/chapter-1/index.md';
```

## Open Questions (Resolved)

1. **Q: Should we add an `updated_at` timestamp?**
   - A: Not in MVP. created_at is sufficient for initial version.

2. **Q: Should snippet store full text or truncated?**
   - A: Full text (per spec). TEXT column has no practical limit.

3. **Q: Batch insert or individual inserts?**
   - A: executemany() for efficiency, but with single transaction.
