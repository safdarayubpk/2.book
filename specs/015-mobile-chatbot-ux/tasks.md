# Tasks: Mobile UX Optimization for Ask AI Chatbot

**Input**: Design documents from `/specs/015-mobile-chatbot-ux/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Manual visual testing only (CSS-only feature)

**Organization**: Tasks grouped by user story for independent validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Baseline Audit)

**Purpose**: Document current state and verify CSS structure

- [x] T001 Audit current ChatPanel height property in src/components/ChatPanel/styles.module.css
- [x] T002 [P] Audit current ChatInput styles in src/components/ChatPanel/ChatInput.styles.module.css
- [x] T003 [P] Verify existing mobile media queries in both CSS files

---

## Phase 2: Foundational (CSS Infrastructure)

**Purpose**: Add core CSS fixes that all user stories depend on

**⚠️ CRITICAL**: These changes enable all mobile fixes

- [x] T004 Add @media (max-width: 996px) block to src/components/ChatPanel/styles.module.css if not exists
- [x] T005 Add flex-shrink: 0 to .inputContainer in src/components/ChatPanel/ChatInput.styles.module.css

**Checkpoint**: CSS infrastructure ready for mobile-specific fixes

---

## Phase 3: User Story 1 - Send Button Visible on Mobile (Priority: P1) 🎯 MVP

**Goal**: Send button and input area fully visible on mobile without browser UI cutoff

**Independent Test**: Open chatbot on mobile (375px), verify Send button visible at bottom without scrolling

### Implementation for User Story 1

- [x] T006 [US1] Add height: 100vh fallback in @media (max-width: 996px) for .chatPanel in src/components/ChatPanel/styles.module.css
- [x] T007 [US1] Add height: 100dvh override after fallback in @media (max-width: 996px) for .chatPanel in src/components/ChatPanel/styles.module.css
- [x] T008 [US1] Add padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) to .inputContainer in @media (max-width: 996px) in src/components/ChatPanel/ChatInput.styles.module.css
- [x] T009 [US1] Start dev server (npm start) and test on mobile emulator at 375px width
- [ ] T010 [US1] Verify Send button visible on iPhone Safari emulation (with browser toolbar) - MANUAL TEST
- [ ] T011 [US1] Verify safe area padding on iPhone X+ emulation (with home indicator) - MANUAL TEST

**Checkpoint**: User Story 1 complete - Send button visible on all mobile viewports

---

## Phase 4: User Story 2 - Input Stays Visible with Keyboard (Priority: P2)

**Goal**: Input field remains visible when software keyboard appears

**Independent Test**: Tap input on mobile, verify it stays above keyboard while typing

### Implementation for User Story 2

- [x] T012 [US2] Add font-size: 16px to .textarea in @media (max-width: 996px) in src/components/ChatPanel/ChatInput.styles.module.css
- [x] T013 [US2] Verify flex: 1 and overflow-y: auto on .messagesContainer in src/components/ChatPanel/styles.module.css
- [ ] T014 [US2] Test keyboard interaction on real mobile device or emulator - MANUAL TEST
- [ ] T015 [US2] Verify input remains visible when typing with keyboard open - MANUAL TEST
- [ ] T016 [US2] Test keyboard dismiss returns input to normal position - MANUAL TEST

**Checkpoint**: User Story 2 complete - keyboard handling works correctly

---

## Phase 5: User Story 3 - Character Counter Visibility (Priority: P3)

**Goal**: Character counter clearly visible on mobile viewports

**Independent Test**: Type message on mobile, verify character counter visible and updates

### Implementation for User Story 3

- [x] T017 [US3] Verify .charCounter styles in src/components/ChatPanel/ChatInput.styles.module.css
- [x] T018 [US3] Verify .footer flex layout keeps counter visible on mobile
- [ ] T019 [US3] Test character counter visibility on 375px width - MANUAL TEST
- [ ] T020 [US3] Test character counter updates while typing - MANUAL TEST

**Checkpoint**: User Story 3 complete - character counter visible on mobile

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, edge cases, and regression testing

- [ ] T021 Test on very small screen (320px width) - verify input area functional - MANUAL TEST
- [ ] T022 Test landscape orientation on mobile - MANUAL TEST
- [ ] T023 Test tablet portrait mode (768px width) - MANUAL TEST
- [ ] T024 Toggle light/dark mode with chatbot open - verify all elements visible - MANUAL TEST
- [ ] T025 Verify desktop layout unchanged (test at 1280px width) - MANUAL TEST
- [x] T026 Build production bundle (npm run build) and verify CSS included
- [ ] T027 Run quickstart.md validation checklist - MANUAL TEST

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 audit
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational - core viewport fix
- **User Story 2 (P2)**: Can start after US1 (keyboard handling builds on viewport fix)
- **User Story 3 (P3)**: Independent - counter visibility can be tested anytime after Foundational

### Within Each Phase

- T001, T002, T003 can run in parallel (different files/concerns)
- T006, T007, T008 must be sequential (same file, dependent changes)
- T012-T016 are sequential (iterative testing)

---

## Parallel Opportunities

### Phase 1 (parallel audit tasks):
```
Task: Audit ChatPanel styles in src/components/ChatPanel/styles.module.css
Task: Audit ChatInput styles in src/components/ChatPanel/ChatInput.styles.module.css
```

### After Foundational:
```
User Story 1 and User Story 3 can start in parallel (different concerns)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (audit current CSS)
2. Complete Phase 2: Foundational (add flex-shrink)
3. Complete Phase 3: User Story 1 (100dvh + safe area)
4. **STOP and VALIDATE**: Send button visible on mobile
5. Deploy and demo if ready

### Incremental Delivery

1. Setup + Foundational → CSS infrastructure ready
2. Add User Story 1 → Send button works → Deploy (MVP!)
3. Add User Story 2 → Keyboard works → Deploy
4. Add User Story 3 → Counter visible → Deploy
5. Polish → All edge cases tested → Final Deploy

---

## Notes

- All tasks are CSS-only with no JavaScript changes
- Use @media (max-width: 996px) to scope changes to mobile only
- 100dvh has good browser support (Safari 15.4+, Chrome 108+)
- env(safe-area-inset-bottom) is widely supported on iOS 11.2+
- Test on real devices when possible; emulators may not show keyboard behavior accurately
- font-size: 16px on inputs prevents iOS Safari auto-zoom
