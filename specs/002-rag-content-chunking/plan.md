# Implementation Plan: Book Content Ingestion & Chunking for RAG Pipeline

**Branch**: `002-rag-content-chunking` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-rag-content-chunking/spec.md`

## Summary

Build a deterministic content ingestion pipeline that reads all Docusaurus markdown files from `/docs/**/*.md`, strips markdown syntax to extract clean text, splits content into semantic chunks of 400-600 tokens, and outputs structured JSON with full metadata for downstream RAG embedding. The pipeline must be local-only, reusable, and produce identical output on repeated runs.

## Technical Context

**Language/Version**: TypeScript 5.x (aligned with existing Docusaurus project) or Python 3.11+ (if user prefers)
**Primary Dependencies**:
- gray-matter (frontmatter parsing)
- marked or remark (markdown parsing)
- No external AI/embedding services

**Storage**: File-based output (chunks.json)
**Testing**: Manual verification + determinism check (run twice, compare outputs)
**Target Platform**: Local execution (Node.js 20+ or Python 3.11+)
**Project Type**: Single CLI script/module
**Performance Goals**: Process entire book (<30 seconds on standard hardware)
**Constraints**: No external APIs, no embeddings, local-only, deterministic output
**Scale/Scope**: 7 markdown files, ~6 chapters + intro, estimated 20-50 chunks total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies? | Status | Notes |
|-----------|----------|--------|-------|
| I. Simplicity-First | Yes | PASS | Single script, minimal dependencies, no complex architecture |
| II. Mobile-Ready Performance | No | N/A | Backend ingestion script, not user-facing |
| III. RAG Accuracy | Yes | PASS | This feature prepares content for RAG; chunking strategy supports retrieval quality |
| IV. Personalization-Driven | No | N/A | Content ingestion, not personalization |
| V. Free-Tier Compliance | Yes | PASS | No external services, local execution only |
| VI. Educational Focus | Yes | PASS | Prepares educational content for chatbot access |
| VII. AI-Native Experience | Yes | PASS | Enables RAG chatbot functionality |
| VIII. Rapid Deployment | Yes | PASS | Simple script, no deployment complexity |

**Gate Status**: PASS - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-rag-content-chunking/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - validation steps
├── contracts/           # Phase 1 output - JSON schema
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
scripts/
└── ingest-content.ts    # Main ingestion script (or .py if Python chosen)

data/
└── chunks.json          # Output file (generated, not committed)
```

**Structure Decision**: Single script in `scripts/` directory. Output to `data/` directory. Minimal footprint aligned with Simplicity-First principle.

## Complexity Tracking

> No violations to justify. Architecture is intentionally minimal.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
