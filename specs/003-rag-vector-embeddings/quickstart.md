# Quickstart: Embeddings Generation & Vector Storage

**Feature**: 003-rag-vector-embeddings
**Time to validate**: ~10 minutes

## Prerequisites

- [ ] Python 3.11+ installed
- [ ] `data/chunks.json` exists (from spec-002)
- [ ] Cohere API key (free tier: https://dashboard.cohere.com/api-keys)
- [ ] Qdrant Cloud account (free tier: https://cloud.qdrant.io/)
- [ ] Qdrant cluster created with API key

## Environment Setup

### 1. Create .env file

```bash
cp data/.env.example .env
```

Edit `.env` with your credentials:

```env
COHERE_API_KEY=your-cohere-api-key-here
QDRANT_URL=https://your-cluster-id.us-east4-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key-here
```

### 2. Install Python dependencies

```bash
pip install cohere qdrant-client python-dotenv
```

## Quick Validation Steps

### 1. Run the Embedding Pipeline

```bash
python scripts/embed-vectors.py
```

**Expected output**:
```
Loading chunks from data/chunks.json...
Found 15 chunks to process.

Connecting to Qdrant...
Collection 'book_vectors' created.

Generating embeddings with Cohere...
  Batch 1/2: 10 chunks embedded
  Batch 2/2: 5 chunks embedded

Upserting vectors to Qdrant...
  Batch 1/2: 10 vectors upserted
  Batch 2/2: 5 vectors upserted

=== Summary ===
Chunks processed: 15
Vectors stored: 15
Collection: book_vectors
Done!
```

### 2. Verify Vector Count

```bash
python scripts/search-vectors.py --count
```

**Expected output**:
```
Collection: book_vectors
Vector count: 15
```

### 3. Run Test Search

```bash
python scripts/search-vectors.py "humanoid robot movement"
```

**Expected output**:
```
Query: "humanoid robot movement"
Top 3 results:

1. [Score: 0.8523] Motion & Control
   Source: docs/chapter-4/index.md
   Text: "Perception tells a robot about the world. Motion and control enable it to act..."

2. [Score: 0.7891] Humanoid Robot Architecture
   Source: docs/chapter-2/index.md
   Text: "A humanoid robot is a marvel of engineering integration..."

3. [Score: 0.7234] Introduction to Physical AI
   Source: docs/chapter-1/index.md
   Text: "Physical AI represents a fundamental shift..."
```

### 4. Verify Idempotency

```bash
# Run embedding pipeline again
python scripts/embed-vectors.py

# Check vector count hasn't increased
python scripts/search-vectors.py --count
```

**Expected**: Vector count remains 15 (no duplicates)

### 5. Verify Metadata Payload

```bash
python scripts/search-vectors.py --inspect doc-001-0001
```

**Expected output**:
```
Vector ID: 8734521098234567
Payload:
  chunk_id: doc-001-0001
  text: "Physical AI represents..."
  source_path: docs/chapter-1/index.md
  slug: chapter-1-index
  title: Introduction to Physical AI
  order_index: 1
```

## Validation Checklist

| # | Check | Command | Expected |
|---|-------|---------|----------|
| 1 | Embedding runs | `python scripts/embed-vectors.py` | Exits 0 |
| 2 | Collection exists | `--count` | Reports collection name |
| 3 | Vector count = chunk count | `--count` | 15 vectors |
| 4 | Search works | Search query | Returns results with scores |
| 5 | Results are relevant | "robot" query | Motion/architecture chapters |
| 6 | Idempotent | Run twice | Count unchanged |
| 7 | Metadata complete | `--inspect` | All 6 payload fields |

## Common Issues

### Issue: "COHERE_API_KEY not found"

**Solution**: Ensure `.env` file exists and has correct key
```bash
cat .env | grep COHERE
```

### Issue: "Connection refused" to Qdrant

**Solution**: Verify QDRANT_URL is correct
```bash
curl -H "api-key: $QDRANT_API_KEY" $QDRANT_URL/collections
```

### Issue: "Rate limit exceeded"

**Solution**: Wait 60 seconds and retry. Free tier has limits.

### Issue: "Dimension mismatch"

**Solution**: Delete and recreate collection:
```python
qdrant_client.delete_collection("book_vectors")
```

## Success Criteria Reference

From spec.md:

- [x] SC-001: 100% of chunks embedded and stored
- [x] SC-002: Vector count equals chunk count
- [x] SC-003: Search returns in < 2 seconds
- [x] SC-004: Idempotent (no duplicates on re-run)
- [x] SC-005: Relevant results for test queries
- [x] SC-006: All metadata fields in payload
- [x] SC-007: Pipeline completes in < 5 minutes
