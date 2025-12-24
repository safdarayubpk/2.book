# Tasks: Urdu Translation Button

**Input**: Design documents from `/specs/013-urdu-translation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/translate-api.yaml

**Tests**: Manual testing only (hackathon scope)

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add Urdu font support and base RTL styles

- [x] T001 [P] Add Google Fonts Noto Nastaliq Urdu import in src/css/custom.css
- [x] T002 [P] Add base RTL CSS styles for Urdu content in src/css/custom.css
- [x] T003 [P] Create TypeScript types for translation in src/types/translation.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create translation API client in src/services/translationApi.ts
- [x] T005 Create translation utility module in scripts/translation_utils.py
- [x] T006 Add /translate endpoint to scripts/api.py

**Checkpoint**: Backend endpoint working, API client ready

---

## Phase 3: User Story 1 - Translate Chapter to Urdu (Priority: P1) 🎯 MVP

**Goal**: Users can click a button to translate any chapter to Urdu with proper RTL display

**Independent Test**: Log in, navigate to chapter-1, click "Translate to Urdu", verify Urdu content displays with RTL formatting and code blocks preserved in English

### Implementation for User Story 1

- [x] T007 [P] [US1] Create useTranslation hook in src/hooks/useTranslation.ts
- [x] T008 [P] [US1] Create TranslateButton component in src/components/TranslateButton/TranslateButton.tsx
- [x] T009 [P] [US1] Create TranslateButton styles in src/components/TranslateButton/TranslateButton.module.css
- [x] T010 [US1] Extend DocItem/Content to inject TranslateButton in src/theme/DocItem/Content/index.tsx
- [x] T011 [US1] Add loading state with spinner during translation in TranslateButton.tsx
- [x] T012 [US1] Add translated content banner ("Content translated to Urdu") in TranslateButton.tsx
- [ ] T013 [US1] Test translation on chapter-1 and verify RTL display

**Checkpoint**: User Story 1 complete - translation working with RTL display

---

## Phase 4: User Story 2 - Restore Original English Content (Priority: P2)

**Goal**: Users can toggle back to original English content after viewing Urdu translation

**Independent Test**: After translating, click "Show Original" button, verify English content is restored without page reload

### Implementation for User Story 2

- [x] T014 [US2] Add original content caching to useTranslation hook in src/hooks/useTranslation.ts
- [x] T015 [US2] Add "Show Original" button state to TranslateButton in src/components/TranslateButton/TranslateButton.tsx
- [x] T016 [US2] Implement content toggle logic (Urdu ↔ English) in TranslateButton.tsx
- [ ] T017 [US2] Test toggle functionality - translate then restore original

**Checkpoint**: User Story 2 complete - can toggle between English and Urdu

---

## Phase 5: User Story 3 - Guest User Prompt (Priority: P3)

**Goal**: Unauthenticated users see signup prompt when clicking translate button

**Independent Test**: Log out, click "Translate to Urdu", verify signup prompt appears with link to registration

### Implementation for User Story 3

- [x] T018 [US3] Add auth state check to TranslateButton in src/components/TranslateButton/TranslateButton.tsx
- [x] T019 [US3] Create signup prompt UI for guests in TranslateButton.tsx
- [x] T020 [US3] Add link to signup/login flow in signup prompt
- [ ] T021 [US3] Test as logged-out user - verify prompt appears

**Checkpoint**: User Story 3 complete - guests see signup prompt

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and error handling

- [ ] T022 Test translation on all 7 pages (intro + chapter-1 through chapter-6)
- [ ] T023 Verify error handling for timeout (60+ seconds)
- [ ] T024 Verify error handling for API failures with retry option
- [ ] T025 Test RTL display on mobile viewport
- [ ] T026 Run quickstart.md validation checklist
- [ ] T027 Deploy backend changes to HuggingFace Spaces

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T003 (types) for API client
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational - core translation flow
- **User Story 2 (P2)**: Depends on US1 (extends TranslateButton with toggle)
- **User Story 3 (P3)**: Can start after Foundational (auth check independent of translation)

### Within Each Phase

- T001, T002, T003 can run in parallel (different files)
- T007, T008, T009 can run in parallel (different files)
- T010 depends on T008 (needs TranslateButton component)
- T014 depends on T007 (extends useTranslation hook)

---

## Parallel Opportunities

### Phase 1 (all parallel):
```
Task: Add Google Fonts import in src/css/custom.css
Task: Add RTL CSS styles in src/css/custom.css
Task: Create TypeScript types in src/types/translation.ts
```

### Phase 3 - User Story 1 (parallel models):
```
Task: Create useTranslation hook in src/hooks/useTranslation.ts
Task: Create TranslateButton component in src/components/TranslateButton/TranslateButton.tsx
Task: Create TranslateButton styles in src/components/TranslateButton/TranslateButton.module.css
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (fonts, RTL CSS, types)
2. Complete Phase 2: Foundational (API client, backend endpoint)
3. Complete Phase 3: User Story 1 (TranslateButton, translation flow)
4. **STOP and VALIDATE**: Test translation on chapter-1
5. Deploy and demo if ready

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add User Story 1 → Translation works → Deploy (MVP!)
3. Add User Story 2 → Toggle works → Deploy
4. Add User Story 3 → Guest prompt → Deploy
5. Polish → All chapters tested → Final deploy

---

## Notes

- No caching of translations (generated fresh each time per hackathon scope)
- 60-second timeout matches personalization feature
- RTL styles scoped to translated content container only
- Code blocks preserved in English via prompt engineering
- Mirrors personalization feature architecture for consistency
