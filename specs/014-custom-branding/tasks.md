# Tasks: Custom Branding for Physical AI Textbook

**Input**: Design documents from `/specs/014-custom-branding/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Manual visual testing only (static asset feature)

**Organization**: Tasks grouped by user story for independent validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Audit & Backup)

**Purpose**: Document current state and prepare for asset replacement

- [x] T001 Document current default assets in static/img/ (logo.svg, favicon.ico sizes and format)
- [x] T002 [P] Create backup directory static/img/backup/ for original Docusaurus assets
- [x] T003 [P] Copy original logo.svg to static/img/backup/logo-original.svg
- [x] T004 [P] Copy original favicon.ico to static/img/backup/favicon-original.ico

---

## Phase 2: Foundational (Asset Design)

**Purpose**: Create branding assets that MUST be complete before user story implementation

**⚠️ CRITICAL**: No file replacement can begin until assets are designed and validated

- [x] T005 Design logo SVG: geometric humanoid silhouette in cyan (#0891B2) with 200x200 viewBox
- [x] T006 Validate logo design: test visibility at 32px height minimum
- [x] T007 Design favicon: simplified logo icon optimized for 32x32 and 16x16 display
- [x] T008 Generate favicon.ico file from favicon design (32x32 pixels)

**Checkpoint**: Custom assets ready - file replacement can now begin

---

## Phase 3: User Story 1 - Custom Logo in Navbar (Priority: P1) 🎯 MVP

**Goal**: Users see professional custom logo reflecting robotics/AI theme in navbar

**Independent Test**: Navigate to any page, verify custom logo in navbar (not green dinosaur)

### Implementation for User Story 1

- [x] T009 [US1] Replace logo.svg in static/img/logo.svg with custom design
- [x] T010 [US1] Start dev server and verify logo appears in navbar (npm start)
- [x] T011 [US1] Test logo at desktop width (1280px+) for clear visibility
- [x] T012 [US1] Test logo on mobile viewport (375px) for appropriate sizing
- [x] T013 [US1] Verify logo click navigates to homepage

**Checkpoint**: User Story 1 complete - custom logo visible on all pages

---

## Phase 4: User Story 2 - Custom Favicon in Browser Tab (Priority: P2)

**Goal**: Users see distinctive favicon in browser tabs for quick identification

**Independent Test**: Open site in browser, verify custom favicon in tab (not dinosaur)

### Implementation for User Story 2

- [x] T014 [US2] Replace favicon.ico in static/img/favicon.ico with custom design
- [x] T015 [US2] Hard refresh browser (Ctrl+Shift+R) to clear cached favicon
- [x] T016 [US2] Verify favicon appears in browser tab
- [x] T017 [US2] Bookmark the page and verify favicon appears in bookmarks
- [x] T018 [US2] Test favicon recognizability at small tab sizes

**Checkpoint**: User Story 2 complete - custom favicon in browser tabs and bookmarks

---

## Phase 5: User Story 3 - Theme Consistency (Priority: P3)

**Goal**: Branding looks appropriate in both light and dark modes

**Independent Test**: Toggle between light/dark modes, verify logo visibility in both

### Implementation for User Story 3

- [x] T019 [US3] Test logo visibility in light mode (default)
- [x] T020 [US3] Toggle to dark mode and verify logo contrast
- [x] T021 [US3] If logo has contrast issues in dark mode: adjust SVG colors or add srcDark config
- [x] T022 [US3] Rapidly toggle themes to verify no flickering or transition issues
- [x] T023 [US3] Verify cohesive professional appearance in both themes

**Checkpoint**: User Story 3 complete - branding works in light and dark modes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and production readiness

- [x] T024 Visit all 7 pages (intro + chapter-1 through chapter-6) and verify logo
- [x] T025 Build production bundle (npm run build) and verify assets included
- [x] T026 Run quickstart.md validation checklist
- [x] T027 [P] Search page source for any remaining default Docusaurus branding
- [x] T028 Test in Chrome, Firefox, Safari, Edge (favicon compatibility)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No dependencies on Phase 1 but asset design should be complete before replacement
- **User Stories (Phase 3+)**: All depend on Foundational phase completion (assets designed)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T005-T006 (logo asset)
- **User Story 2 (P2)**: Depends on T007-T008 (favicon asset)
- **User Story 3 (P3)**: Depends on US1 (logo must be in place to test theme variations)

### Within Each Phase

- Setup tasks (T002-T004) can run in parallel
- Asset design should be sequential: logo concept → logo validation → favicon derived from logo
- User story implementation is sequential within each story but stories can overlap

---

## Parallel Opportunities

### Phase 1 (parallel backup tasks):
```
Task: Copy original logo.svg to static/img/backup/logo-original.svg
Task: Copy original favicon.ico to static/img/backup/favicon-original.ico
```

### After Foundational:
```
User Story 1 and User Story 2 can start in parallel (different files)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (backup originals)
2. Complete Phase 2: Foundational (design logo and favicon)
3. Complete Phase 3: User Story 1 (replace logo)
4. **STOP and VALIDATE**: Logo visible in navbar
5. Deploy and demo if ready

### Incremental Delivery

1. Setup + Foundational → Assets ready
2. Add User Story 1 → Logo works → Deploy (MVP!)
3. Add User Story 2 → Favicon works → Deploy
4. Add User Story 3 → Theme tested → Final Deploy
5. Polish → All pages validated → Production ready

---

## Notes

- All tasks are file-based with no code changes
- Favicon caching may require hard refresh (Ctrl+Shift+R) to see updates
- Logo should use transparent background for both light/dark mode compatibility
- Color palette: Cyan #0891B2 (primary), #06B6D4 (accent), #1E293B (dark neutral)
- If dark mode has contrast issues, Docusaurus supports `srcDark` in logo config
