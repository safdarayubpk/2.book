# Quickstart: RAG Metadata Persistence

**Feature**: 004-rag-metadata-persistence
**Date**: 2025-12-13

## Prerequisites

1. **Neon Postgres account** with a database created
2. **DATABASE_URL** added to `.env` file
3. **chunks.json** generated (run Spec-002 first)
4. **Python 3.x** with pip installed

## Setup

### 1. Install Dependencies

```bash
pip install psycopg2-binary python-dotenv
```

### 2. Configure Environment

Add to your `.env` file:

```env
DATABASE_URL=postgresql://user:password@your-project.neon.tech/neondb?sslmode=require
```

### 3. Verify Prerequisites

```bash
# Check chunks.json exists
ls data/chunks.json

# Check .env has DATABASE_URL
grep DATABASE_URL .env
```

## Usage

### Store Metadata

```bash
python scripts/store-metadata.py
```

Expected output:
```
==================================================
Metadata Storage Pipeline
==================================================

Loading environment...
Loading chunks from data/chunks.json...
Found 15 chunks to process.

Connecting to database...
Creating documents table...
Table ready.

Storing metadata...
  Batch 1/2: 10 records upserted
  Batch 2/2: 5 records upserted

Verifying...
Total records in database: 15

==================================================
Summary
==================================================
Chunks processed: 15
Records stored: 15
Done!
```

### Verify Data

```bash
# Check record count
python scripts/store-metadata.py --count

# Lookup specific chunk
python scripts/store-metadata.py --lookup doc-001-0001

# Filter by source
python scripts/store-metadata.py --source docs/chapter-1/index.md
```

### Re-run (Idempotent)

Running the script again updates existing records:

```bash
python scripts/store-metadata.py
# Record count stays at 15, not 30
```

## Troubleshooting

### Connection Errors

```
Error: Could not connect to database
```

**Fix**: Check DATABASE_URL in .env:
- URL format: `postgresql://user:pass@host/db?sslmode=require`
- Ensure `sslmode=require` is present (Neon requires SSL)
- Verify credentials in Neon dashboard

### Missing chunks.json

```
Error: chunks.json not found
```

**Fix**: Generate chunks first:
```bash
npm run ingest
```

### Permission Errors

```
Error: Permission denied for relation documents
```

**Fix**: Ensure your Neon user has CREATE and INSERT privileges.

## Integration Points

### With Vector Search

After storing metadata, enhance search results with citations:

```python
# 1. Vector search returns chunk_ids
results = qdrant.query_points(collection_name="book_vectors", ...)
chunk_ids = [r.payload["chunk_id"] for r in results.points]

# 2. Lookup metadata for citations
cursor.execute("""
    SELECT chunk_id, source_path, title, order_index
    FROM documents
    WHERE chunk_id = ANY(%s)
""", (chunk_ids,))
metadata = cursor.fetchall()
```

### RAG Response Format

```python
# Combine search result with metadata
response = {
    "answer": "Physical AI represents...",
    "sources": [
        {
            "title": "Introduction to Physical AI",
            "source": "docs/chapter-1/index.md",
            "chunk_id": "doc-001-0001"
        }
    ]
}
```

## File Locations

```
project/
├── .env                          # DATABASE_URL here
├── data/
│   └── chunks.json               # Input data
├── scripts/
│   ├── embed-vectors.py          # Existing: vectors to Qdrant
│   ├── search-vectors.py         # Existing: semantic search
│   └── store-metadata.py         # New: metadata to Postgres
└── specs/004-rag-metadata-persistence/
    ├── spec.md
    ├── research.md
    ├── data-model.md
    └── quickstart.md             # This file
```
