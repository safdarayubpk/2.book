# Contracts: Book Content Ingestion & Chunking

This directory contains the JSON Schema definition for the ingestion pipeline output.

## Files

| File | Description |
|------|-------------|
| `chunk-schema.json` | JSON Schema for `chunks.json` output file |

## Usage

### Validation with Node.js (ajv)

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from './chunk-schema.json';
import chunks from '../../data/chunks.json';

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(chunks);

if (!valid) {
  console.error('Validation errors:', validate.errors);
} else {
  console.log('chunks.json is valid');
}
```

### Validation with CLI (ajv-cli)

```bash
npx ajv validate -s contracts/chunk-schema.json -d data/chunks.json
```

## Schema Overview

The output file contains:

```json
{
  "chunks": [
    {
      "chunk_id": "doc-001-0001",
      "text": "Clean text content...",
      "source_path": "docs/chapter-1/index.md",
      "slug": "chapter-1-index",
      "title": "Introduction to Physical AI",
      "order_index": 1
    }
  ],
  "metadata": {
    "generated_at": "2025-12-13T10:00:00Z",
    "total_documents": 7,
    "total_chunks": 25,
    "version": "1.0.0"
  }
}
```

## Field Constraints

| Field | Constraint |
|-------|-----------|
| `chunk_id` | Pattern: `doc-NNN-NNNN` (e.g., `doc-001-0001`) |
| `text` | Non-empty string |
| `source_path` | Pattern: `docs/.*\.md` |
| `slug` | Pattern: `[a-z0-9-]+` |
| `title` | Non-empty string |
| `order_index` | Integer >= 1 |
