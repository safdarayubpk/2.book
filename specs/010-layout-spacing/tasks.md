# Tasks: Docusaurus Layout Spacing & Sidebar Proximity Fix

**Input**: Design documents from `/specs/010-layout-spacing/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: Manual visual testing only - no automated tests required for CSS changes.

**Organization**: Tasks organized by user story to enable independent visual validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Target file**: `src/css/custom.css`
- All changes in single CSS file within the "Content-Centered Layout" section (lines 212-322)

---

## Phase 1: Setup (Audit Current Layout)

**Purpose**: Document baseline measurements before making changes

- [x] T001 Capture baseline screenshot at 1920px viewport width
- [x] T002 [P] Capture baseline screenshot at 1440px viewport width
- [x] T003 [P] Capture baseline screenshot at 1366px viewport width
- [x] T004 [P] Measure current whitespace gap between sidebar and content at 1920px
- [x] T005 Document current CSS variable values in src/css/custom.css (lines 217-222)

**Checkpoint**: Baseline documented - ready to implement changes

---

## Phase 2: User Story 1 - Wide Desktop Layout Optimization (Priority: P1) 🎯 MVP

**Goal**: Fix excessive spacing at 1920px viewport so sidebar, content, and TOC appear as a cohesive unit

**Independent Test**: View any doc page at 1920px and verify:
- Left sidebar within ~24px visual gap of content
- Right TOC within ~24px visual gap of content
- Layout appears centered and balanced

### Implementation for User Story 1

- [x] T006 [US1] Add new CSS variable `--layout-max-width: 1500px` in src/css/custom.css `:root` section (line ~217)
- [x] T007 [US1] Update `.docRoot` selector to add `max-width: var(--layout-max-width)` and `margin: 0 auto` in src/css/custom.css (line ~229)
- [x] T008 [US1] Increase `--layout-content-width` from 800px to 900px in src/css/custom.css (line ~218)
- [x] T009 [US1] Increase `--layout-gap` from 16px to 24px in src/css/custom.css (line ~221)
- [x] T010 [US1] Validate layout at 1920px viewport - verify sidebar-content gap reduced
- [x] T011 [US1] Validate symmetric spacing (left gutter ≈ right gutter) at 1920px

**Checkpoint**: Wide desktop layout (1920px) should now show cohesive sidebar-content-TOC grouping

---

## Phase 3: User Story 2 - Standard Desktop Layout (Priority: P1)

**Goal**: Ensure balanced layout at common desktop sizes (1366px, 1440px)

**Independent Test**: Resize browser to 1366px and 1440px and verify:
- All three columns fit without horizontal scroll
- Content readable with adequate width
- TOC feels connected to content headings

### Implementation for User Story 2

- [x] T012 [US2] Test layout at 1440px viewport - verify no horizontal scrollbar
- [x] T013 [US2] Test layout at 1366px viewport - verify all columns fit comfortably
- [x] T014 [US2] Verify content column width is adequate for readability (700-900px)
- [x] T015 [US2] If needed, adjust `--layout-max-width` to ensure 1366px works in src/css/custom.css
- [x] T016 [US2] Update 997px-1199px breakpoint gap from 16px to 20px in src/css/custom.css (line ~291)

**Checkpoint**: Standard desktop layouts (1366px, 1440px) should show balanced, readable layout

---

## Phase 4: User Story 3 - Responsive Preservation (Priority: P2)

**Goal**: Verify no regressions on tablet and mobile breakpoints

**Independent Test**: Resize from 1920px down to 375px and verify:
- TOC collapses correctly at 996px
- Mobile single-column layout works at 375px
- No horizontal scroll at any breakpoint

### Implementation for User Story 3

- [x] T017 [US3] Test tablet layout at 996px - verify TOC collapse behavior unchanged
- [x] T018 [US3] Test tablet layout at 768px - verify no horizontal scroll
- [x] T019 [US3] Test mobile layout at 375px - verify single-column layout works
- [x] T020 [US3] Test smooth transition when resizing from desktop to mobile
- [x] T021 [US3] If any regression found, fix tablet/mobile breakpoints in src/css/custom.css

**Checkpoint**: All responsive breakpoints work correctly - no regressions

---

## Phase 5: Polish & Documentation

**Purpose**: Final validation and documentation

- [x] T022 Add code comments documenting spacing rationale in src/css/custom.css
- [x] T023 [P] Test in dark mode - verify layout unchanged
- [x] T024 [P] Test with long chapter (many TOC headings) - verify spacing consistent
- [x] T025 Capture final screenshots at 1366px, 1440px, 1920px for comparison
- [x] T026 Update plan.md to mark tasks.md as complete
- [x] T027 Build project and verify no CSS errors with `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Audit)**: No dependencies - start immediately
- **Phase 2 (US1)**: Depends on Phase 1 - captures baseline before changes
- **Phase 3 (US2)**: Can start after T009 (gap change applied)
- **Phase 4 (US3)**: Can start after US2 validation
- **Phase 5 (Polish)**: Depends on all user stories passing

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - core implementation
- **User Story 2 (P1)**: Tests CSS applied in US1 at different viewports
- **User Story 3 (P2)**: Regression testing - requires US1/US2 CSS in place

### Within Each User Story

- Implementation tasks are sequential (CSS changes build on each other)
- Validation tasks can be parallelized ([P] marker)

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different viewport measurements)
- T023, T024 can run in parallel (different test scenarios)

---

## Parallel Example: Audit Phase

```bash
# Launch baseline captures in parallel:
Task: "Capture baseline screenshot at 1440px viewport width"
Task: "Capture baseline screenshot at 1366px viewport width"
Task: "Measure current whitespace gap between sidebar and content at 1920px"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Audit (5 tasks)
2. Complete Phase 2: US1 - Wide Desktop (6 tasks)
3. **STOP and VALIDATE**: Test 1920px layout independently
4. If satisfactory, deploy and get feedback

### Incremental Delivery

1. Audit baseline → Document current state
2. US1 (1920px) → Validate → Can deploy for wide-screen feedback
3. US2 (1366/1440px) → Validate → Can deploy for standard desktop feedback
4. US3 (responsive) → Validate → Full feature complete
5. Polish → Document → Final release

### Single Developer Strategy

Execute phases sequentially:
1. Phase 1: ~15 minutes (screenshots + measurements)
2. Phase 2: ~30 minutes (CSS changes + validation)
3. Phase 3: ~15 minutes (viewport testing)
4. Phase 4: ~15 minutes (regression testing)
5. Phase 5: ~15 minutes (documentation + build)

**Total estimated time**: ~90 minutes

---

## Notes

- All CSS changes in single file: `src/css/custom.css`
- Changes localized to "Content-Centered Layout" section (lines 212-322)
- No new files created - modification only
- Manual visual testing at multiple viewports
- Build verification required before commit
- Commit after each phase completion recommended
