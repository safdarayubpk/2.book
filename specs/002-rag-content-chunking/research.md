# Research: Book Content Ingestion & Chunking for RAG Pipeline

**Feature**: 002-rag-content-chunking
**Date**: 2025-12-13
**Status**: Complete

## Research Questions

### 1. Runtime Choice: TypeScript vs Python

**Decision**: TypeScript

**Rationale**:
- Project already uses TypeScript (Docusaurus with TS config)
- Node.js 20+ is available (per package.json engines requirement)
- Single language stack simplifies maintenance
- gray-matter and remark are mature, well-maintained npm packages

**Alternatives Considered**:
- Python 3.11+ with python-frontmatter and mistune: Would require additional runtime, but offers simpler text processing. Rejected due to adding complexity to the stack.

---

### 2. Markdown Parsing Library

**Decision**: remark (unified ecosystem)

**Rationale**:
- remark is the most widely used markdown parser in the Node.js ecosystem
- Produces AST that can be traversed to selectively remove elements
- remark-stringify can output plain text
- Well-documented, stable API
- Used by many Docusaurus plugins internally

**Alternatives Considered**:
- marked: Faster but less AST control; harder to selectively strip elements
- markdown-it: Good plugin system but heavier; not needed for simple stripping
- Custom regex: Error-prone, doesn't handle edge cases well

---

### 3. Frontmatter Parsing

**Decision**: gray-matter

**Rationale**:
- Industry standard for frontmatter extraction in Node.js
- Handles YAML, JSON, and TOML frontmatter formats
- Returns both data (frontmatter) and content (body) cleanly separated
- Zero configuration needed for standard use case

**Alternatives Considered**:
- front-matter: Lighter but less feature-rich
- Manual regex parsing: Error-prone, especially with multiline values

---

### 4. Token Counting Strategy

**Decision**: Word-based approximation (words × 1.33 ≈ tokens)

**Rationale**:
- Spec allows simple approximation (word-based)
- Most embedding models (including MiniLM) use ~1.3 tokens per word for English
- No external tokenizer dependency required
- Deterministic and fast
- Acceptable accuracy for chunking purposes (not billing)

**Alternatives Considered**:
- tiktoken (OpenAI's tokenizer): Accurate but adds external dependency; overkill for chunking
- sentence-transformers tokenizer: Python-only, would require runtime switch
- Character-based estimation: Less accurate for mixed content

**Implementation**:
```typescript
function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return Math.ceil(words.length * 1.33);
}
```

---

### 5. Chunking Algorithm

**Decision**: Paragraph-first with sentence fallback

**Rationale**:
- Paragraphs are natural semantic boundaries
- If a paragraph exceeds target size, split on sentence boundaries
- Sentences are split using simple regex (period/question/exclamation followed by space)
- Accumulate until reaching 400 tokens, stop before exceeding 600

**Algorithm**:
1. Split text into paragraphs (double newline)
2. For each paragraph:
   - If paragraph fits in current chunk, add it
   - If adding paragraph would exceed 600 tokens:
     - If current chunk >= 400 tokens, finalize and start new
     - Else, split paragraph into sentences and add until limit
3. Handle remaining content

**Alternatives Considered**:
- Fixed character windows: Destroys semantic coherence
- Sliding window with overlap: Adds complexity, not needed for this scale
- Sentence-only splitting: Creates too many small chunks

---

### 6. Chunk ID Generation

**Decision**: `{doc-number}-{chunk-index}` format

**Rationale**:
- Document number derived from sorted file order (001, 002, etc.)
- Chunk index is 4-digit padded (0001, 0002, etc.)
- Stable across runs due to deterministic file sorting
- Human-readable and traceable

**Format**: `doc-001-0001`, `doc-001-0002`, `doc-002-0001`, etc.

**Alternatives Considered**:
- UUID: Not stable across runs
- Content hash: Changes if content changes, harder to track
- Path-based: Long and unwieldy

---

### 7. File Ordering Strategy

**Decision**: Alphabetical sort by relative path

**Rationale**:
- Deterministic and reproducible
- Natural ordering (chapter-1 before chapter-2)
- No configuration needed

**Implementation**:
```typescript
files.sort((a, b) => a.localeCompare(b));
```

---

### 8. Slug Generation

**Decision**: Path-based slug with extension removed

**Rationale**:
- Derive from relative path: `docs/chapter-1/index.md` → `chapter-1-index`
- Remove `docs/` prefix and `.md` extension
- Replace path separators with hyphens
- Consistent with Docusaurus URL generation

**Alternatives Considered**:
- Title-based slug: Requires additional normalization, may have duplicates
- Content hash: Not human-readable

---

### 9. Output Location

**Decision**: `data/chunks.json` at repository root

**Rationale**:
- Separate from source code (scripts/)
- Clear purpose (data output)
- Easy to gitignore if needed
- Consumed by downstream embedding pipeline

**Alternatives Considered**:
- `output/` directory: Generic, less clear purpose
- Same directory as script: Mixes code and data

---

## Dependencies Summary

| Package | Purpose | Version |
|---------|---------|---------|
| gray-matter | Frontmatter parsing | ^4.0.3 |
| remark | Markdown parsing | ^15.0.1 |
| remark-parse | Markdown AST | ^11.0.0 |
| strip-markdown | Remove markdown syntax | ^6.0.0 |
| unified | Processing pipeline | ^11.0.4 |

**Note**: All dependencies are dev dependencies since the script is a build-time tool.

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Markdown edge cases (nested lists, tables) | Use battle-tested remark parser; test with actual content |
| Non-deterministic file order | Explicit alphabetical sort before processing |
| Token count drift from actual embeddings | Accept approximation; 300-700 range provides buffer |
| Empty files creating zero chunks | Skip files with no extractable content |

---

## Next Steps

1. Generate data-model.md with entity definitions
2. Generate contracts/chunk-schema.json with JSON schema
3. Generate quickstart.md with validation steps
