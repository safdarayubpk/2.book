# Tasks: Content Personalization Button

**Input**: Design documents from `/specs/012-content-personalization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/personalize-api.yaml

**Tests**: Not requested - manual testing only (hackathon scope)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Create directory structure and TypeScript types

- [x] T001 Create PersonalizeButton component directory at src/components/PersonalizeButton/
- [x] T002 [P] Create personalization TypeScript types in src/types/personalization.ts
- [x] T003 [P] Create personalization API service file at src/services/personalizationApi.ts

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Backend endpoint and core personalization logic that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create personalization_utils.py in scripts/personalization_utils.py with prompt template and chapter content fetching
- [x] T005 Add PersonalizeRequest and PersonalizeResponse Pydantic models to scripts/api.py
- [x] T006 Implement POST /personalize endpoint in scripts/api.py
- [x] T007 Add chapter content fetching from Qdrant by slug in scripts/personalization_utils.py
- [x] T008 Implement OpenAI call with personalization prompt in scripts/personalization_utils.py
- [x] T009 Add error handling and timeout (30s) for personalization endpoint in scripts/api.py
- [x] T010 Test backend endpoint manually with curl

**Checkpoint**: Backend ready - frontend work can now begin ✅

---

## Phase 3: User Story 1 - Personalize Chapter Content (Priority: P1) ✅ MVP COMPLETE

**Goal**: Authenticated users can click "Personalize for Me" and see content adapted to their profile

**Independent Test**: Log in as beginner user, click personalize button on Chapter 1, verify content shows simpler explanations

### Implementation for User Story 1

- [x] T011 [P] [US1] Create usePersonalization hook in src/hooks/usePersonalization.ts with state management
- [x] T012 [P] [US1] Create PersonalizeButton.module.css with button styles in src/components/PersonalizeButton/
- [x] T013 [US1] Create PersonalizeButton.tsx component in src/components/PersonalizeButton/PersonalizeButton.tsx
- [x] T014 [US1] Implement personalize API call in src/services/personalizationApi.ts
- [x] T015 [US1] Add loading state (spinner) to PersonalizeButton while personalizing
- [x] T016 [US1] Display personalized content with "Personalized for your level" banner
- [x] T017 [US1] Inject PersonalizeButton into doc pages via src/theme/DocItem/Layout.tsx (swizzle)
- [x] T018 [US1] Connect button to AuthContext to get user profile
- [x] T019 [US1] Test personalization flow end-to-end with authenticated user

**Checkpoint**: User Story 1 complete - users can personalize content ✅

---

## Phase 4: User Story 2 - Restore Original Content (Priority: P2) ✅ COMPLETE

**Goal**: Users can toggle back to original content after personalizing

**Independent Test**: After personalizing, click "Show Original" and verify original content is restored

### Implementation for User Story 2

- [x] T020 [US2] Add originalContent state to usePersonalization hook in src/hooks/usePersonalization.ts
- [x] T021 [US2] Add "Show Original" button variant to PersonalizeButton.tsx
- [x] T022 [US2] Implement toggle logic between personalized and original content
- [x] T023 [US2] Update button text to "Personalize Again" when showing original
- [x] T024 [US2] Test toggle functionality between original and personalized content

**Checkpoint**: User Stories 1 AND 2 complete - full personalization toggle works ✅

---

## Phase 5: User Story 3 - Guest User Prompt (Priority: P3) ✅ COMPLETE

**Goal**: Unauthenticated users see signup prompt when clicking personalize button

**Independent Test**: As logged-out user, click personalize button, verify signup prompt appears

### Implementation for User Story 3

- [x] T025 [US3] Add guest detection logic using isAuthenticated from AuthContext
- [x] T026 [US3] Create signup prompt message in PersonalizeButton.tsx for guests
- [x] T027 [US3] Add "Sign Up" link that opens AuthModal in signup mode
- [x] T028 [US3] Style guest prompt with call-to-action styling in PersonalizeButton.module.css
- [x] T029 [US3] Test guest flow - verify prompt appears and signup link works

**Checkpoint**: All user stories complete ✅

---

## Phase 6: Polish & Cross-Cutting Concerns ✅ COMPLETE

**Purpose**: Error handling, edge cases, and deployment

- [x] T030 [P] Add error toast/message display for failed personalization
- [x] T031 [P] Add timeout handling with retry option for slow responses
- [x] T032 Verify button appears on all 7 pages (intro + 6 chapters)
- [x] T033 Test mobile responsiveness of PersonalizeButton
- [x] T034 Push backend changes to HuggingFace Spaces
- [x] T035 Verify deployment works end-to-end on production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 state management being in place
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses AuthContext but no story dependencies

### Within Each User Story

- Models/Types before services
- Services before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003 can run in parallel (different files)
- T011, T012 can run in parallel (different files)
- T030, T031 can run in parallel (different concerns)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch setup tasks in parallel:
Task: "Create personalization TypeScript types in src/types/personalization.ts"
Task: "Create personalization API service file at src/services/personalizationApi.ts"
```

## Parallel Example: User Story 1

```bash
# Launch initial US1 tasks in parallel:
Task: "Create usePersonalization hook in src/hooks/usePersonalization.ts"
Task: "Create PersonalizeButton.module.css with button styles"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test personalization end-to-end
5. Deploy/demo if ready - this delivers the core hackathon requirement

### Incremental Delivery

1. Complete Setup + Foundational → Backend ready
2. Add User Story 1 → Test independently → Deploy (MVP delivers 50 bonus points!)
3. Add User Story 2 → Test toggle → Deploy
4. Add User Story 3 → Test guest flow → Deploy
5. Each story adds polish without breaking previous stories

---

## File Summary

| Phase | File | Purpose |
|-------|------|---------|
| Setup | src/types/personalization.ts | TypeScript interfaces |
| Setup | src/services/personalizationApi.ts | API client |
| Foundational | scripts/personalization_utils.py | Backend logic |
| Foundational | scripts/api.py | /personalize endpoint |
| US1 | src/hooks/usePersonalization.ts | State hook |
| US1 | src/components/PersonalizeButton/PersonalizeButton.tsx | Button component |
| US1 | src/components/PersonalizeButton/PersonalizeButton.module.css | Styles |
| US1 | src/theme/DocItem/Layout.tsx | Inject into pages |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
