# Implementation Plan: Mobile UX Optimization for Ask AI Chatbot

**Branch**: `015-mobile-chatbot-ux` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-mobile-chatbot-ux/spec.md`

## Summary

Fix mobile viewport cutoff issues in the Ask AI chatbot drawer by implementing dynamic viewport height (100dvh), flexbox layout restructuring, safe area padding, and keyboard-aware input positioning. This is a CSS-only fix targeting mobile viewports under 996px.

## Technical Context

**Language/Version**: CSS3 (with CSS Module overrides)
**Primary Dependencies**: Docusaurus 3.x, Infima CSS framework
**Storage**: N/A (no data changes)
**Testing**: Manual visual testing on mobile devices/emulators
**Target Platform**: Mobile web (iOS Safari 15+, Chrome Android 90+)
**Project Type**: Frontend CSS fix
**Performance Goals**: No impact on load time; immediate visual fix
**Constraints**: Changes scoped to <996px; no desktop layout changes
**Scale/Scope**: 2 CSS files to modify

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | PASS | CSS-only fix, no new components |
| II. Mobile-Ready Performance | PASS | Directly improves mobile UX |
| III. RAG Accuracy | N/A | No RAG changes |
| IV. Personalization-Driven | N/A | No personalization changes |
| V. Free-Tier Compliance | PASS | No infrastructure changes |
| VI. Educational Focus | PASS | Enables chatbot use on mobile |
| VII. AI-Native Experience | PASS | Fixes AI chatbot accessibility |
| VIII. Rapid Deployment | PASS | Simple CSS change, fast deploy |

## Project Structure

### Documentation (this feature)

```text
specs/015-mobile-chatbot-ux/
├── plan.md              # This file
├── research.md          # Current state analysis and CSS patterns
├── quickstart.md        # Mobile testing checklist
└── tasks.md             # Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ChatPanel/
│       ├── styles.module.css        # MODIFY: Add mobile viewport fixes
│       └── ChatInput.styles.module.css  # MODIFY: Add safe area padding
└── css/
    └── custom.css                   # MODIFY: Add mobile chatbot overrides
```

**Structure Decision**: Modifications to existing CSS files only. No new files needed. Mobile-specific styles will be added within @media (max-width: 996px) blocks.

## Current State Analysis

### Issue Identified

The ChatPanel uses `height: 100vh` (line 25 in styles.module.css) which doesn't account for:
- Mobile browser address/toolbar bars
- iOS home indicator (safe area)
- Software keyboard visibility

### Files to Modify

1. **src/components/ChatPanel/styles.module.css**
   - Line 25: `height: 100vh` → `height: 100dvh` for mobile
   - Add safe area padding

2. **src/components/ChatPanel/ChatInput.styles.module.css**
   - Add `padding-bottom: env(safe-area-inset-bottom)`
   - Ensure flex-shrink: 0 for input container

3. **src/css/custom.css**
   - Add mobile chatbot override section
   - Ensure 16px minimum font size for inputs (prevent iOS zoom)

## Implementation Phases

### Phase 1: Viewport Height Fix (P1 - Critical)
- Replace 100vh with 100dvh in mobile media query
- Add fallback for browsers without dvh support
- Test on iOS Safari and Chrome Android

### Phase 2: Flexbox Layout Restructure (P1)
- Verify header has flex-shrink: 0
- Verify messagesContainer has flex: 1 and overflow-y: auto
- Verify inputContainer has flex-shrink: 0

### Phase 3: Safe Area Compliance (P1)
- Add padding-bottom: env(safe-area-inset-bottom) to inputContainer
- Test on iPhone X+ devices with home indicator

### Phase 4: Keyboard Handling (P2)
- Test input visibility when keyboard appears
- Add 16px minimum font size to prevent iOS zoom
- Verify visual viewport behavior

### Phase 5: Light/Dark Mode Audit (P3)
- Verify all new styles work in both themes
- Test theme toggle with chatbot open

## Complexity Tracking

> No constitution violations - simple CSS fix.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| Files changed | 3 | styles.module.css, ChatInput.styles.module.css, custom.css |
| Code changes | CSS only | No JavaScript changes |
| Dependencies | 0 | None added |
| Risk | Low | Scoped to mobile only, reversible |
