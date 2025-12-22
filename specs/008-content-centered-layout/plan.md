# Implementation Plan: Content-Centered Layout with Aligned Sidebars

**Branch**: `008-content-centered-layout` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-content-centered-layout/spec.md`

## Summary

Implement a content-centered documentation layout that constrains reading width (1100-1200px max), positions left navigation and right TOC adjacent to the content container rather than viewport edges, and maintains responsive behavior across all breakpoints. All changes are CSS-only modifications to `src/css/custom.css` without JavaScript or component swizzling.

## Technical Context

**Language/Version**: TypeScript 5.x / CSS3 (Docusaurus theme customization)
**Primary Dependencies**: Docusaurus 3.x, Infima CSS framework (built-in)
**Storage**: N/A (CSS-only feature)
**Testing**: Visual regression testing, manual viewport testing
**Target Platform**: Web (desktop 1920px+, tablet 768-996px, mobile <768px)
**Project Type**: Single (Docusaurus frontend only)
**Performance Goals**: <50ms additional render time, no layout shift (CLS = 0)
**Constraints**: CSS-only (no JavaScript), must work with existing Chat UI panel, maintain Infima variable compatibility
**Scale/Scope**: Affects docs pages only, ~200 lines of CSS additions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|-----------|--------|---------------|
| I. Simplicity-First | PASS | CSS-only changes, no new components, easily understandable |
| II. Mobile-Ready Performance | PASS | No bundle size increase, CSS is minimal, layout optimized for mobile |
| III. RAG Accuracy | N/A | Layout feature, no RAG involvement |
| IV. Personalization-Driven | N/A | Layout feature, no content changes |
| V. Free-Tier Compliance | PASS | Zero infrastructure cost, CSS only |
| VI. Educational Focus | PASS | Improves reading comfort for educational content |
| VII. AI-Native Experience | PASS | Does not interfere with Chat UI panel |
| VIII. Rapid Deployment | PASS | No deployment changes required |

**Gate Result**: PASS - All applicable principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/008-content-centered-layout/
├── plan.md              # This file
├── research.md          # Docusaurus CSS class research
├── data-model.md        # N/A (CSS-only feature)
├── quickstart.md        # Verification steps
└── contracts/           # N/A (no API)
```

### Source Code (repository root)

```text
src/
├── css/
│   └── custom.css       # PRIMARY: All layout changes here
├── theme/
│   └── Root.tsx         # EXISTS: Chat UI integration (no changes needed)
└── components/
    └── ChatPanel/       # EXISTS: Must not break with new layout
```

**Structure Decision**: Single project, CSS-only modifications. All layout changes in `src/css/custom.css`. No component swizzling required as Docusaurus exposes CSS variables and class selectors for layout customization.

## Complexity Tracking

> No violations - CSS-only approach is the simplest solution.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
