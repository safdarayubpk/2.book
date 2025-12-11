# Tasks: Textbook Generation

**Input**: Design documents from `/specs/001-textbook-generation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: Docusaurus at repository root
- **docs/**: Chapter content (MDX files)
- **src/**: React components and custom CSS
- **static/**: Images and static assets

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Docusaurus project with TypeScript and basic configuration

- [X] T001 Initialize Docusaurus 3.x project with TypeScript template at repository root
- [X] T002 Configure docusaurus.config.ts with site metadata (title: "Physical AI & Humanoid Robotics", tagline, URL placeholders)
- [X] T003 [P] Configure sidebars.ts with chapter navigation structure
- [X] T004 [P] Create src/css/custom.css with mobile-first base styles (44x44px tap targets, responsive typography)
- [X] T005 [P] Create static/img/chapters/ directory structure for chapter images

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create docs/intro.md with welcome page content and textbook overview
- [X] T007 Create docs/chapter-1/_category_.json with sidebar metadata (label, position: 1)
- [X] T008 [P] Create docs/chapter-2/_category_.json with sidebar metadata (label, position: 2)
- [X] T009 [P] Create docs/chapter-3/_category_.json with sidebar metadata (label, position: 3)
- [X] T010 [P] Create docs/chapter-4/_category_.json with sidebar metadata (label, position: 4)
- [X] T011 [P] Create docs/chapter-5/_category_.json with sidebar metadata (label, position: 5)
- [X] T012 [P] Create docs/chapter-6/_category_.json with sidebar metadata (label, position: 6)
- [X] T013 Verify Docusaurus dev server runs successfully with `npm start`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Read Textbook Chapters (Priority: P1) MVP

**Goal**: Learners can read the Physical AI & Humanoid Robotics textbook with clean, mobile-friendly chapter pages

**Independent Test**: Navigate to any chapter URL (e.g., /docs/chapter-1) and verify content displays correctly on both desktop and mobile devices

### Implementation for User Story 1

- [X] T014 [P] [US1] Create docs/chapter-1/index.md with Chapter 1 content: "Introduction to Physical AI" (800-1500 words, frontmatter with title, description, sidebar_position)
- [X] T015 [P] [US1] Create docs/chapter-2/index.md with Chapter 2 content: "Humanoid Robot Architecture" (800-1500 words, frontmatter)
- [X] T016 [P] [US1] Create docs/chapter-3/index.md with Chapter 3 content: "Perception & Sensing" (800-1500 words, frontmatter)
- [X] T017 [P] [US1] Create docs/chapter-4/index.md with Chapter 4 content: "Motion & Control" (800-1500 words, frontmatter)
- [X] T018 [P] [US1] Create docs/chapter-5/index.md with Chapter 5 content: "Learning & Adaptation" (800-1500 words, frontmatter)
- [X] T019 [P] [US1] Create docs/chapter-6/index.md with Chapter 6 content: "Applications & Future" (800-1500 words, frontmatter)
- [X] T020 [US1] Update src/css/custom.css with chapter-specific styles (readable line length, image sizing, code block styling)
- [X] T021 [US1] Add placeholder images to static/img/chapters/ for each chapter (WebP format, optimized)
- [X] T022 [US1] Verify all 6 chapters render correctly with `npm run build` (no build errors)

**Checkpoint**: At this point, User Story 1 should be fully functional - learners can read all 6 chapters

---

## Phase 4: User Story 2 - Navigate Between Chapters (Priority: P2)

**Goal**: Learners can easily navigate between chapters using next/previous buttons and table of contents

**Independent Test**: From any chapter, verify next/previous buttons work and table of contents shows all chapters

### Implementation for User Story 2

- [X] T023 [US2] Create src/components/ChapterNav/index.tsx with Next/Previous chapter buttons component
- [X] T024 [US2] Create src/components/ChapterNav/styles.module.css with mobile-friendly button styles (44x44px touch targets)
- [X] T025 [US2] Update docusaurus.config.ts to enable docs pagination (next/previous in footer)
- [X] T026 [US2] Create src/pages/index.tsx with landing page featuring table of contents listing all chapters
- [X] T027 [US2] Update each chapter index.md to import and use ChapterNav component at bottom
- [X] T028 [US2] Verify navigation works on mobile (test with Chrome DevTools device emulation)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - learners can read and navigate chapters

---

## Phase 5: User Story 3 - View Chapter Progress (Priority: P3)

**Goal**: Learners can see their reading progress (requires auth feature for full functionality)

**Independent Test**: Verify progress indicator component renders correctly (stubbed without auth)

**Note**: This story creates a stubbed component. Full functionality requires the auth feature.

### Implementation for User Story 3

- [X] T029 [US3] Create src/components/ProgressIndicator/index.tsx with stubbed progress display (shows "Login to track progress" placeholder)
- [X] T030 [US3] Create src/components/ProgressIndicator/styles.module.css with progress bar styles
- [X] T031 [US3] Add ProgressIndicator to src/pages/index.tsx (landing page TOC)
- [X] T032 [US3] Add ProgressIndicator to docs sidebar via swizzling or custom theme component
- [X] T033 [US3] Document API interface expected from auth feature in src/components/ProgressIndicator/README.md

**Checkpoint**: All user stories should now be independently functional (progress is stubbed awaiting auth)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, deployment, and final validation

- [X] T034 Run Lighthouse performance audit and verify score >90 on chapter pages
- [X] T035 [P] Optimize images in static/img/chapters/ (compress, ensure WebP with fallbacks)
- [X] T036 [P] Add lazy loading attribute to all chapter images
- [X] T037 Test all pages on mobile devices (verify no horizontal scroll, touch targets work)
- [X] T038 Configure Vercel deployment (vercel.json or auto-detect)
- [ ] T039 Deploy to Vercel and verify all URLs work (/, /docs/intro, /docs/chapter-1 through /docs/chapter-6)
- [X] T040 Run quickstart.md validation checklist
- [ ] T041 Record 90-second demo video showing textbook reading experience

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (chapters) can start immediately after Phase 2
  - US2 (navigation) can start after Phase 2, but benefits from US1 content
  - US3 (progress) can start after Phase 2, independent of US1/US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - ChapterNav uses chapter paths from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Fully independent, stubbed component

### Within Each User Story

- Content files (index.md) can be created in parallel [P]
- Component files before integration with chapters
- Styling before final verification

### Parallel Opportunities

- All Setup tasks T003-T005 marked [P] can run in parallel
- All Foundational category tasks T007-T012 marked [P] can run in parallel
- All chapter content tasks T014-T019 marked [P] can run in parallel
- Polish tasks T035-T036 marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all chapter content creation in parallel:
Task: "Create docs/chapter-1/index.md with Chapter 1 content"
Task: "Create docs/chapter-2/index.md with Chapter 2 content"
Task: "Create docs/chapter-3/index.md with Chapter 3 content"
Task: "Create docs/chapter-4/index.md with Chapter 4 content"
Task: "Create docs/chapter-5/index.md with Chapter 5 content"
Task: "Create docs/chapter-6/index.md with Chapter 6 content"

# After all chapters complete, run sequentially:
Task: "Update src/css/custom.css with chapter-specific styles"
Task: "Add placeholder images to static/img/chapters/"
Task: "Verify all 6 chapters render correctly"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T013)
3. Complete Phase 3: User Story 1 (T014-T022)
4. **STOP and VALIDATE**: All 6 chapters readable on mobile
5. Deploy to Vercel if ready for demo

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (chapters) → Test reading experience → Deploy (MVP!)
3. Add User Story 2 (navigation) → Test navigation → Deploy
4. Add User Story 3 (progress stub) → Test component renders → Deploy
5. Complete Polish phase → Final deployment

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1)**

This delivers:
- 6 readable chapters on Physical AI & Humanoid Robotics
- Mobile-friendly layout
- Basic Docusaurus sidebar navigation (built-in)

User Stories 2 and 3 enhance the experience but are not required for initial demo.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US3 (progress) is stubbed - full implementation requires auth feature
- Chapter content (T014-T019) uses placeholder text - replace with actual course content
