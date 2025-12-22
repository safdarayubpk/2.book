# Tasks: Content-Centered Layout with Aligned Sidebars

**Input**: Design documents from `/specs/008-content-centered-layout/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Docusaurus frontend)
- Paths based on plan.md structure:
  - CSS: `src/css/custom.css`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: CSS variable definitions and documentation

- [x] T001 Add CSS custom properties for layout dimensions in src/css/custom.css (--layout-max-width, --layout-content-width, --layout-sidebar-width, --layout-toc-width, --layout-gap)
- [x] T002 Add CSS comment section header for centered layout styles in src/css/custom.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base container centering that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add .docRoot max-width and margin:auto centering rule in src/css/custom.css
- [x] T004 Add .docsWrapper justify-content:center rule in src/css/custom.css

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Comfortable Reading Experience (Priority: P1) - MVP

**Goal**: User can read content comfortably with bounded width (1100-1200px max) and optimal line length (70-90 characters)

**Independent Test**: Open any documentation page on a 1920px+ monitor. Content should be centered with max-width constraint, and line length should not exceed 80-100 characters.

### Implementation for User Story 1

- [x] T005 [US1] Add .docMainContainer max-width constraint in src/css/custom.css
- [x] T006 [US1] Add .container margin:auto centering in src/css/custom.css
- [x] T007 [US1] Add content width constraint to .markdown selector in src/css/custom.css
- [x] T008 [US1] Verify line length is 70-90 characters by testing with sample content

**Checkpoint**: At this point, User Story 1 should be fully functional - content is centered with bounded width

---

## Phase 4: User Story 2 - Unified Navigation-Content Grouping (Priority: P1)

**Goal**: Left navigation sidebar is positioned adjacent to the content container, not stretched to viewport edge

**Independent Test**: View any documentation page and confirm the left navigation appears as part of the same "block" as the content, with consistent 24-32px spacing.

### Implementation for User Story 2

- [x] T009 [US2] Add .docSidebarContainer width constraint (--layout-sidebar-width) in src/css/custom.css
- [x] T010 [US2] Add .docSidebarContainer flex:0 0 auto to prevent stretching in src/css/custom.css
- [x] T011 [US2] Add margin/gap between sidebar and content area in src/css/custom.css
- [x] T012 [US2] Ensure sidebar scrolls independently with overflow-y:auto in src/css/custom.css

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - content centered and nav adjacent

---

## Phase 5: User Story 3 - Accessible Table of Contents (Priority: P2)

**Goal**: Right TOC is positioned immediately to the right of content container with 24-32px spacing

**Independent Test**: Navigate to a long documentation page with multiple headings. TOC should be immediately visible in proximity to the content.

### Implementation for User Story 3

- [x] T013 [US3] Add .tableOfContents width constraint (--layout-toc-width) in src/css/custom.css
- [x] T014 [US3] Add gap between content and TOC using margin-left in src/css/custom.css
- [x] T015 [US3] Ensure TOC sticky positioning is preserved in src/css/custom.css
- [x] T016 [US3] Prevent TOC from floating to viewport edge on wide screens in src/css/custom.css

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Responsive Layout Adaptation (Priority: P2)

**Goal**: Layout adapts gracefully to different screen sizes with appropriate breakpoints

**Independent Test**: Resize browser from 1920px down to 768px. Layout should transition smoothly at each breakpoint.

### Implementation for User Story 4

- [x] T017 [US4] Add @media (min-width: 1440px) rules for large desktop layout in src/css/custom.css
- [x] T018 [US4] Add @media (min-width: 1200px) rules for desktop layout in src/css/custom.css
- [x] T019 [US4] Add @media (min-width: 997px) rules for desktop with TOC in src/css/custom.css
- [x] T020 [US4] Add @media (max-width: 996px) rules for tablet (TOC collapses) in src/css/custom.css
- [x] T021 [US4] Add @media (max-width: 767px) rules for mobile layout in src/css/custom.css
- [x] T022 [US4] Test all breakpoints: 1920px, 1440px, 1200px, 996px, 768px

**Checkpoint**: All user stories should now be independently functional across all breakpoints

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T023 [P] Verify Chat UI FAB and panel are not affected by layout changes
- [x] T024 [P] Verify dark/light theme toggle works correctly with new layout
- [x] T025 [P] Verify search functionality is not broken
- [x] T026 Test edge case: short content page (less than one screen)
- [x] T027 Test edge case: page without TOC headings
- [x] T028 Test edge case: very long navigation list
- [x] T029 Run npm run build to verify no CSS errors
- [x] T030 Run quickstart.md validation to verify all verification steps pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority and can proceed in parallel
  - US3 and US4 are both P2 priority and can proceed in parallel after P1 stories
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 4 (P2)**: Depends on US1, US2, US3 being at least structurally complete (needs all selectors defined)

### Within Each User Story

- CSS rules can be added in any order within a story
- Core implementation before edge cases
- Story complete before final integration testing

### Parallel Opportunities

- T001, T002 can run in parallel (different concerns)
- T005, T006, T007 can run in parallel (different selectors)
- T009, T010, T011, T012 can run in parallel (different aspects of sidebar)
- T013, T014, T015, T016 can run in parallel (different aspects of TOC)
- T017, T018, T019, T020, T021 can run in parallel (different breakpoints)
- T023, T024, T025 can run in parallel (different verification areas)

---

## Parallel Example: User Story 2

```bash
# Launch all sidebar-related CSS rules in parallel:
Task T009: "Add .docSidebarContainer width constraint in src/css/custom.css"
Task T010: "Add .docSidebarContainer flex:0 0 auto in src/css/custom.css"
Task T011: "Add margin/gap between sidebar and content in src/css/custom.css"
Task T012: "Ensure sidebar scrolls independently in src/css/custom.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T004)
3. Complete Phase 3: User Story 1 (T005-T008)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - content is now centered

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Content centered (MVP!)
3. Add User Story 2 → Test independently → Navigation aligned
4. Add User Story 3 → Test independently → TOC positioned
5. Add User Story 4 → Test independently → Fully responsive
6. Complete Polish → Production ready

### Parallel Team Strategy

With multiple developers (though this is CSS-only, one file):

1. Complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1 + 2 (P1 priority)
   - Developer B: Prepare User Stories 3 + 4 CSS rules
3. All stories integrate into single custom.css file

---

## Notes

- All tasks modify a single file: `src/css/custom.css`
- [P] tasks = different CSS selectors, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- CSS-only feature: no JavaScript, no component changes
- Must not break existing Chat UI panel (fixed positioning, separate z-index)
