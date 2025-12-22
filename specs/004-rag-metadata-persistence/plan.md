# Implementation Plan: RAG Metadata Persistence

**Branch**: `004-rag-metadata-persistence` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-rag-metadata-persistence/spec.md`

## Summary

Implement a Python script to persist chunk metadata from `chunks.json` to Neon Postgres, enabling citation lookup for RAG responses. Uses psycopg2 with upsert pattern for idempotent operations.

## Technical Context

**Language/Version**: Python 3.x (matching existing scripts)
**Primary Dependencies**: psycopg2-binary, python-dotenv
**Storage**: Neon Serverless PostgreSQL (free tier)
**Testing**: Manual verification via CLI flags (--count, --lookup, --source)
**Target Platform**: Linux/macOS development environment
**Project Type**: Single project (script-based pipeline)
**Performance Goals**: < 30 seconds for 15 chunks, < 100ms per lookup
**Constraints**: Must stay within Neon free tier limits
**Scale/Scope**: 15 chunks (current), designed for hundreds

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | ✅ Pass | Single script, raw SQL, no ORM |
| II. Mobile-Ready Performance | ✅ N/A | Backend script, not user-facing |
| III. RAG Accuracy | ✅ Supports | Enables citation lookup for RAG |
| IV. Personalization-Driven | ✅ N/A | Infrastructure feature |
| V. Free-Tier Compliance | ✅ Pass | Neon free tier sufficient |
| VI. Educational Focus | ✅ N/A | Backend infrastructure |
| VII. AI-Native Experience | ✅ Supports | Powers AI chatbot citations |
| VIII. Rapid Deployment | ✅ Pass | Simple script, no new services |

## Project Structure

### Documentation (this feature)

```text
specs/004-rag-metadata-persistence/
├── plan.md              # This file
├── research.md          # Technology decisions (psycopg2, upsert strategy)
├── data-model.md        # Schema and query patterns
├── quickstart.md        # Setup and usage guide
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
scripts/
├── embed-vectors.py     # Existing: vectors to Qdrant
├── search-vectors.py    # Existing: semantic search verification
└── store-metadata.py    # New: metadata to Neon Postgres

data/
└── chunks.json          # Input: source of truth for chunk data
```

**Structure Decision**: Single `scripts/` directory for pipeline scripts. Follows established pattern from Spec-003. No separate tests directory for this feature (verification via CLI flags).

## Complexity Tracking

> **No violations to document**

The implementation follows all constitution principles without requiring complexity justifications.

## Implementation Overview

### Phase 1: Core Infrastructure

1. **Environment Setup**
   - Add `DATABASE_URL` to `.env.example`
   - Install `psycopg2-binary` dependency

2. **Database Schema**
   - Create `documents` table with upsert support
   - Add indexes for `source_path` and `slug`

3. **Store Metadata Script**
   - Load chunks from `chunks.json`
   - Connect to Neon Postgres
   - Upsert all records in single transaction
   - Log progress (batch N/M)

### Phase 2: Verification & CLI

4. **Verification Features**
   - `--count`: Show total records
   - `--lookup CHUNK_ID`: Retrieve single record
   - `--source PATH`: Filter by source_path

5. **Testing**
   - Run twice, verify idempotency
   - Verify all 15 records stored
   - Test lookup performance (< 100ms)

## Artifacts Generated

| Artifact | Status | Purpose |
|----------|--------|---------|
| research.md | ✅ Complete | Technology decisions |
| data-model.md | ✅ Complete | Schema and queries |
| quickstart.md | ✅ Complete | Setup and usage |
| tasks.md | ✅ Complete | Implementation tasks |

## Next Steps

Run `/speckit.tasks` to generate the task breakdown for implementation.
