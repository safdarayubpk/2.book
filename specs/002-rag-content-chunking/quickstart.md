# Quickstart: Book Content Ingestion & Chunking

**Feature**: 002-rag-content-chunking
**Time to validate**: ~5 minutes

## Prerequisites

- [ ] Node.js 20+ installed
- [ ] Repository cloned with `/docs` directory containing markdown files
- [ ] Dependencies installed (`npm install`)

## Quick Validation Steps

### 1. Run the Ingestion Script

```bash
npx ts-node scripts/ingest-content.ts
```

**Expected output**:
```
Processing 7 markdown files...
  docs/intro.md -> 2 chunks
  docs/chapter-1/index.md -> 4 chunks
  docs/chapter-2/index.md -> 3 chunks
  docs/chapter-3/index.md -> 4 chunks
  docs/chapter-4/index.md -> 3 chunks
  docs/chapter-5/index.md -> 4 chunks
  docs/chapter-6/index.md -> 3 chunks
Output written to data/chunks.json
Total: 7 documents, 23 chunks
```

### 2. Verify Output Exists

```bash
ls -la data/chunks.json
```

**Expected**: File exists with non-zero size

### 3. Validate JSON Structure

```bash
cat data/chunks.json | head -50
```

**Expected**: Valid JSON with chunks array containing objects with:
- `chunk_id` (format: `doc-NNN-NNNN`)
- `text` (clean prose)
- `source_path` (markdown file path)
- `slug` (URL-friendly identifier)
- `title` (document title)
- `order_index` (1-based integer)

### 4. Check Chunk Count

```bash
cat data/chunks.json | grep -c '"chunk_id"'
```

**Expected**: Number greater than 0 (should be ~20-30 for current book)

### 5. Verify Determinism

```bash
# Run twice and compare
npx ts-node scripts/ingest-content.ts
cp data/chunks.json /tmp/chunks1.json
npx ts-node scripts/ingest-content.ts
diff data/chunks.json /tmp/chunks1.json
```

**Expected**: No diff output (files are identical)

### 6. Validate Against Schema

```bash
npx ajv validate -s specs/002-rag-content-chunking/contracts/chunk-schema.json -d data/chunks.json
```

**Expected**: `data/chunks.json valid`

## Validation Checklist

| # | Check | Command | Expected |
|---|-------|---------|----------|
| 1 | Script runs | `npx ts-node scripts/ingest-content.ts` | Exits 0 |
| 2 | Output created | `test -f data/chunks.json` | File exists |
| 3 | Chunk count > 0 | `grep -c chunk_id data/chunks.json` | Number > 0 |
| 4 | All fields present | Manual inspection | All 6 fields in each chunk |
| 5 | Clean text | Manual inspection | No markdown syntax |
| 6 | Deterministic | Run twice, diff | No differences |
| 7 | Schema valid | ajv validate | Valid |

## Common Issues

### Issue: "Cannot find module 'gray-matter'"

**Solution**: Install dependencies
```bash
npm install gray-matter remark remark-parse strip-markdown unified
```

### Issue: "No markdown files found"

**Solution**: Verify docs directory exists
```bash
ls docs/**/*.md
```

### Issue: "chunks.json is empty array"

**Solution**: Check if markdown files have content beyond frontmatter
```bash
wc -l docs/**/*.md
```

## Success Criteria Reference

From spec.md:

- [x] SC-001: 100% of markdown files processed
- [x] SC-002: Chunks are 300-700 tokens
- [x] SC-003: Total chunk count > 0
- [x] SC-004: Clean prose, no markdown artifacts
- [x] SC-005: Deterministic output
- [x] SC-006: All metadata fields present
- [x] SC-007: Completes in < 30 seconds
