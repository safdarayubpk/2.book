# Implementation Plan: Urdu Translation Button

**Branch**: `013-urdu-translation` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-urdu-translation/spec.md`

## Summary

Add a "Translate to Urdu" button to each chapter page that uses OpenAI to translate the chapter content from English to Urdu. The button appears on all 7 pages (intro + 6 chapters), calls a new backend endpoint, and displays translated content with proper RTL (right-to-left) formatting. Users can toggle back to the original English content.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.11 (backend)
**Primary Dependencies**: React 18.x, Docusaurus 3.x (frontend); FastAPI, OpenAI (backend)
**Storage**: Neon PostgreSQL (user profiles), Qdrant (chapter vectors) - existing
**Testing**: Manual testing (hackathon scope)
**Target Platform**: Web (Vercel frontend, HuggingFace Spaces backend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Translation response under 60 seconds
**Constraints**: Free tier limits, mobile-friendly UI, RTL text support
**Scale/Scope**: 7 pages (intro + 6 chapters), single user at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | ✅ PASS | Single button, minimal UI, reuses personalization patterns |
| II. Mobile-Ready Performance | ✅ PASS | Button is touch-friendly, loading state shown |
| III. RAG Accuracy | ✅ PASS | Uses existing chapter content for translation |
| IV. Personalization-Driven | ✅ PASS | Enables content access in native language |
| V. Free-Tier Compliance | ✅ PASS | Uses existing OpenAI API, no new services |
| VI. Educational Focus | ✅ PASS | Constitution explicitly requires Urdu translation |
| VII. AI-Native Experience | ✅ PASS | Seamless AI translation integration |
| VIII. Rapid Deployment | ✅ PASS | Simple addition to existing infrastructure |

**Gate Result**: ✅ All principles satisfied

**Constitution Reference**: Principle VI explicitly states "Urdu translation MUST be available for all chapters (one-click)"

## Project Structure

### Documentation (this feature)

```text
specs/013-urdu-translation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── translate-api.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Frontend (Docusaurus/React)
src/
├── components/
│   └── TranslateButton/
│       ├── TranslateButton.tsx           # Main button component
│       └── TranslateButton.module.css    # Includes RTL styles
├── context/
│   └── AuthContext.tsx                   # Existing - provides auth state
├── hooks/
│   └── useTranslation.ts                 # Hook for translation state
├── services/
│   └── translationApi.ts                 # Translation API client
├── types/
│   └── translation.ts                    # TypeScript types
└── theme/
    └── DocItem/
        └── Content/index.tsx             # Inject button (extends existing)

# Backend (FastAPI on HuggingFace)
scripts/
├── api.py                                # Add /translate endpoint
└── translation_utils.py                  # NEW: Translation logic

# Styles
src/css/
└── custom.css                            # Add RTL/Urdu font styles
```

**Structure Decision**: Extends existing web application structure with new component for translation button. Mirrors personalization feature architecture for consistency.

## Complexity Tracking

No violations - feature aligns with all constitution principles and is explicitly required by Principle VI.
