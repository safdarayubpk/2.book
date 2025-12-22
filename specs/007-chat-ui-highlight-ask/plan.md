# Implementation Plan: Chat UI + Highlight → Ask

**Branch**: `007-chat-ui-highlight-ask` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-chat-ui-highlight-ask/spec.md`

## Summary

Build a user-facing chat interface for the RAG AI Agent (Spec-006) with two primary interaction modes: a persistent chat panel accessible from any documentation page, and a highlight-to-ask workflow that allows users to select text and ask contextual questions. The implementation uses Docusaurus theme components (swizzling) with React for the frontend, connecting to the existing FastAPI backend via REST API.

## Technical Context

**Language/Version**: TypeScript 5.6, React 19.x
**Primary Dependencies**: @docusaurus/core 3.9.2, @docusaurus/theme-classic (for swizzling), React 19.x
**Storage**: Browser sessionStorage for conversation history (no additional backend storage)
**Testing**: Vitest for unit tests, Cypress or Playwright for E2E (optional)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - desktop and mobile
**Project Type**: Single project (Docusaurus theme extension)
**Performance Goals**: 500ms selection-to-button appearance, 10s max response time, no UI freezing
**Constraints**: <3s page load on 3G, no heavy dependencies, mobile-friendly (44x44px tap targets)
**Scale/Scope**: Single documentation site, 100 concurrent chat sessions supported by backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | PASS | Minimal UI: chat panel + floating button. No complex animations. |
| II. Mobile-Ready Performance | PASS | Touch-friendly 44x44px buttons, sessionStorage (no network for history), lazy component loading |
| III. RAG Accuracy | PASS | Leverages existing Spec-006 backend with citation display |
| IV. Personalization-Driven | N/A | Phase 2 concern - basic chat first |
| V. Free-Tier Compliance | PASS | No new infrastructure - uses existing backend on Railway |
| VI. Educational Focus | PASS | Source citations help users verify and learn from content |
| VII. AI-Native Experience | PASS | <2s response latency goal, seamless highlight-to-ask integration |
| VIII. Rapid Deployment | PASS | Deploys with existing Docusaurus to Vercel, no additional setup |

## Project Structure

### Documentation (this feature)

```text
specs/007-chat-ui-highlight-ask/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── chat-api.md      # API contract with backend
│   └── components.md    # Component interface contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ChatPanel/           # Main chat drawer/panel component
│   │   ├── index.tsx        # Main component
│   │   ├── ChatMessage.tsx  # Individual message display
│   │   ├── ChatInput.tsx    # Input field with submit
│   │   ├── SourcesList.tsx  # Citation display
│   │   └── styles.module.css
│   ├── HighlightAsk/        # Text selection handling
│   │   ├── index.tsx        # Selection detection + button
│   │   ├── HighlightButton.tsx
│   │   └── styles.module.css
│   └── ChatToggle/          # Floating action button to open chat
│       ├── index.tsx
│       └── styles.module.css
├── hooks/
│   ├── useChatSession.ts    # Session management hook
│   ├── useTextSelection.ts  # Text selection detection hook
│   └── useChatApi.ts        # API communication hook
├── services/
│   └── chatApi.ts           # API client for /chat endpoint
├── types/
│   └── chat.ts              # TypeScript interfaces
└── theme/
    └── Root.tsx             # Docusaurus swizzle to inject components

tests/
├── unit/
│   ├── useChatSession.test.ts
│   └── chatApi.test.ts
└── integration/
    └── ChatPanel.test.tsx
```

**Structure Decision**: Single project extending existing Docusaurus setup. Components live in `src/components/` following existing patterns (ChapterNav, ProgressIndicator). Theme swizzling via `src/theme/Root.tsx` to inject chat panel site-wide.

## Complexity Tracking

> No Constitution violations requiring justification.

---

## Phase 0: Research

See [research.md](./research.md) for:
- Docusaurus swizzling patterns for global components
- Text selection API browser compatibility
- Mobile touch selection handling
- Session storage patterns for chat history
- Existing component patterns in this codebase

## Phase 1: Design

See:
- [data-model.md](./data-model.md) - TypeScript interfaces and state shapes
- [contracts/](./contracts/) - API and component contracts
- [quickstart.md](./quickstart.md) - Development setup and verification steps
