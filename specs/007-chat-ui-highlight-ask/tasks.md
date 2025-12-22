# Tasks: Chat UI + Highlight → Ask

**Input**: Design documents from `/specs/007-chat-ui-highlight-ask/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, at repository root (Docusaurus theme extension)
- Paths based on plan.md structure:
  - Components: `src/components/`
  - Hooks: `src/hooks/`
  - Services: `src/services/`
  - Types: `src/types/`
  - Theme: `src/theme/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, type definitions, and Docusaurus swizzling

- [X] T001 Swizzle Root component: `npx docusaurus swizzle @docusaurus/theme-classic Root --wrap --typescript` (creates src/theme/Root.tsx)
- [X] T002 [P] Create TypeScript interfaces in src/types/chat.ts (MessageRole, SourceCitation, ChatMessage, ConversationSession, TextSelection)
- [X] T003 [P] Create API client in src/services/chatApi.ts (sendChatMessage, clearSession, checkHealth functions)
- [X] T004 [P] Create environment config for API_BASE_URL in src/services/chatApi.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and context that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create ChatContext provider in src/context/ChatContext.tsx with state (isOpen, session, isLoading, error) and actions (openPanel, closePanel, togglePanel, sendMessage, clearSession)
- [X] T006 Create useChatSession hook in src/hooks/useChatSession.ts (session state, sessionStorage persistence, 30-min timeout, 20-message limit)
- [X] T007 [P] Create useChatApi hook in src/hooks/useChatApi.ts (API communication wrapper, health check on mount)
- [X] T008 [P] Create useTextSelection hook in src/hooks/useTextSelection.ts (selection detection, 300ms debounce, clearSelection)
- [X] T009 Integrate ChatContext provider in src/theme/Root.tsx to wrap all children

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Chat Interaction (Priority: P1) - MVP

**Goal**: User can open chat panel, type questions, and receive AI responses with source citations

**Independent Test**: Open chat panel on any doc page, type "What is physical AI?", receive response with inline citations [1][2] and clickable source links

### Implementation for User Story 1

- [X] T010 [P] [US1] Create ChatToggle FAB component in src/components/ChatToggle/index.tsx (56x56px button, fixed bottom-right, chat icon)
- [X] T011 [P] [US1] Create ChatToggle styles in src/components/ChatToggle/styles.module.css (position, z-index, hover states)
- [X] T012 [P] [US1] Create ChatPanel container in src/components/ChatPanel/index.tsx (slide-in drawer, 400px width, focus trap)
- [X] T013 [P] [US1] Create ChatPanel styles in src/components/ChatPanel/styles.module.css (position fixed, transitions, responsive max-width)
- [X] T014 [P] [US1] Create ChatInput component in src/components/ChatPanel/ChatInput.tsx (textarea, 500 char limit, Enter to submit, Shift+Enter newline)
- [X] T015 [P] [US1] Create ChatInput styles in src/components/ChatPanel/ChatInput.styles.module.css (auto-resize, character counter)
- [X] T016 [US1] Create ChatMessage component in src/components/ChatPanel/ChatMessage.tsx (user/assistant styling, timestamp, citation parsing)
- [X] T017 [P] [US1] Create ChatMessage styles in src/components/ChatPanel/ChatMessage.styles.module.css (left/right alignment, message bubbles)
- [X] T018 [US1] Create SourcesList component in src/components/ChatPanel/SourcesList.tsx (collapsible list, relevance indicator, clickable links)
- [X] T019 [P] [US1] Create SourcesList styles in src/components/ChatPanel/SourcesList.styles.module.css (compact list, hover states)
- [X] T020 [US1] Implement citation parsing utility in src/components/ChatPanel/utils.ts (convert [1][2] markers to clickable spans)
- [X] T021 [US1] Integrate ChatToggle and ChatPanel in src/theme/Root.tsx
- [X] T022 [US1] Add loading indicator (spinner/dots) to ChatPanel during API requests
- [X] T023 [US1] Implement source navigation: clicking citation scrolls to source in SourcesList, clicking source navigates to doc URL

**Checkpoint**: At this point, User Story 1 should be fully functional - users can chat with AI and see source citations

---

## Phase 4: User Story 2 - Highlight → Ask Workflow (Priority: P1)

**Goal**: User can select text on doc pages and ask contextual questions about the selection

**Independent Test**: Select text about "embedding retrieval" on any doc page, click "Ask AI" button, optionally add question, receive contextual response

### Implementation for User Story 2

- [X] T024 [P] [US2] Create HighlightButton component in src/components/HighlightAsk/HighlightButton.tsx (positioned near selection, "Ask AI" label)
- [X] T025 [P] [US2] Create HighlightButton styles in src/components/HighlightAsk/styles.module.css (floating button, 44x44px touch target)
- [X] T026 [US2] Create HighlightAsk container in src/components/HighlightAsk/index.tsx (selection listener, button positioning logic)
- [X] T027 [US2] Implement button positioning in src/components/HighlightAsk/index.tsx (above selection on mobile, below on desktop, viewport clamping)
- [X] T028 [US2] Add optional follow-up question input to HighlightButton (inline text field when button clicked)
- [X] T029 [US2] Integrate HighlightAsk with ChatContext (open panel, pass highlighted text as context)
- [X] T030 [US2] Update ChatMessage to display highlighted context for user messages in src/components/ChatPanel/ChatMessage.tsx
- [X] T031 [US2] Add HighlightAsk component to src/theme/Root.tsx
- [X] T032 [US2] Implement mobile touch selection handling (long-press detection, selectionchange event)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can chat directly OR via highlight-to-ask

---

## Phase 5: User Story 3 - Multi-Turn Conversation (Priority: P2)

**Goal**: User can ask follow-up questions that reference previous conversation context

**Independent Test**: Ask "What is physical AI?", receive response, then ask "What are some examples?" without restating topic - AI should understand context

### Implementation for User Story 3

- [X] T033 [US3] Update useChatSession to preserve session_id across messages in src/hooks/useChatSession.ts
- [X] T034 [US3] Update sendMessage in ChatContext to pass session_id to API in src/context/ChatContext.tsx
- [X] T035 [US3] Display full conversation history in ChatPanel (scroll to bottom on new message)
- [X] T036 [US3] Preserve conversation on panel close/reopen within same session
- [X] T037 [US3] Add "New Conversation" button to ChatPanel header to start fresh session
- [X] T038 [US3] Implement session expiration notification (30-min timeout warning)

**Checkpoint**: At this point, multi-turn conversations work with context preservation

---

## Phase 6: User Story 4 - Source Attribution Display (Priority: P2)

**Goal**: Users can verify AI responses via numbered citations with clickable source links

**Independent Test**: Ask any question, verify response has [1][2] citations, verify sources list shows document title, section, and relevance, verify clicking navigates to section

### Implementation for User Story 4

- [X] T039 [US4] Enhance SourcesList with relevance indicator (High/Medium/Related labels) in src/components/ChatPanel/SourcesList.tsx
- [X] T040 [US4] Add section slug display to each source item in SourcesList
- [X] T041 [US4] Implement smooth scroll navigation when clicking source link (use Docusaurus router)
- [X] T042 [US4] Style inline citations as clickable links with hover state in ChatMessage
- [X] T043 [US4] Add visual connection between inline citation numbers and sources list

**Checkpoint**: At this point, full source attribution is working with clickable navigation

---

## Phase 7: User Story 5 - Error Handling and Feedback (Priority: P3)

**Goal**: System displays friendly error messages and handles edge cases gracefully

**Independent Test**: Disconnect network, submit query, verify timeout error with retry button appears. Query non-existent topic, verify "no relevant content" message.

### Implementation for User Story 5

- [X] T044 [US5] Create ErrorMessage component in src/components/ChatPanel/ErrorMessage.tsx (friendly message, retry button)
- [X] T045 [P] [US5] Create ErrorMessage styles in src/components/ChatPanel/ErrorMessage.styles.module.css
- [X] T046 [US5] Implement network timeout detection (5-second timeout) in useChatApi
- [X] T047 [US5] Handle "no relevant content" response from backend (display suggestion to rephrase)
- [X] T048 [US5] Add retry functionality to ErrorMessage (re-submit last message)
- [X] T049 [US5] Implement input validation (empty message, whitespace-only, max 500 chars) in ChatInput
- [X] T050 [US5] Handle rapid submission (queue messages, process sequentially) in useChatSession
- [X] T051 [US5] Add session expiration handling (auto-start new session, notify user)

**Checkpoint**: At this point, all error cases are handled gracefully

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T052 [P] Add aria-labels and keyboard navigation to all interactive elements
- [X] T053 [P] Implement focus trap in ChatPanel (Tab cycling, Escape to close)
- [X] T054 Mobile responsiveness: ChatPanel full-width on screens <768px
- [X] T055 Add CSS custom properties for theming (colors from src/css/custom.css)
- [X] T056 Optimize bundle: lazy-load ChatPanel and HighlightAsk components
- [X] T057 Add aria-live regions for new message announcements
- [X] T058 Run quickstart.md validation to verify all verification steps pass
- [X] T059 Final integration test: complete user journey (highlight → ask → multi-turn → verify sources)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but US1 (Basic Chat) should complete first as US2 (Highlight) opens the chat panel
  - US3 (Multi-Turn) and US4 (Sources) can proceed in parallel after US1
  - US5 (Error Handling) can proceed after US1
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 (opens chat panel via context)
- **User Story 3 (P2)**: Depends on US1 (extends chat functionality)
- **User Story 4 (P2)**: Depends on US1 (enhances existing SourcesList)
- **User Story 5 (P3)**: Depends on US1 (adds error handling to existing components)

### Within Each User Story

- Styles can run in parallel with components
- Components before integration
- Core implementation before enhancement

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different files)
- T007, T008 can run in parallel (different hooks)
- T010-T015, T017, T019 can run in parallel (different component files)
- T024, T025 can run in parallel (different files)
- T044, T045 can run in parallel (different files)
- T052, T053 can run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all component files in parallel:
Task T010: "Create ChatToggle FAB component in src/components/ChatToggle/index.tsx"
Task T011: "Create ChatToggle styles in src/components/ChatToggle/styles.module.css"
Task T012: "Create ChatPanel container in src/components/ChatPanel/index.tsx"
Task T013: "Create ChatPanel styles in src/components/ChatPanel/styles.module.css"
Task T014: "Create ChatInput component in src/components/ChatPanel/ChatInput.tsx"
Task T015: "Create ChatInput styles in src/components/ChatPanel/ChatInput.styles.module.css"
Task T017: "Create ChatMessage styles in src/components/ChatPanel/ChatMessage.styles.module.css"
Task T019: "Create SourcesList styles in src/components/ChatPanel/SourcesList.styles.module.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009)
3. Complete Phase 3: User Story 1 (T010-T023)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - users can now chat with AI

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Highlight-to-ask working
4. Add User Story 3 → Test independently → Multi-turn conversations
5. Add User Story 4 → Test independently → Enhanced source attribution
6. Add User Story 5 → Test independently → Error handling complete
7. Complete Polish → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Basic Chat) - PRIORITY
   - Developer B: Prepare User Story 2 components (can create files, cannot integrate until US1 done)
3. After US1 complete:
   - Developer A: User Story 3 (Multi-Turn)
   - Developer B: User Story 2 (Highlight → Ask)
   - Developer C: User Story 4 (Source Attribution)
4. User Story 5 can be done by anyone after US1

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend API (Spec-006) must be running for testing
- Use sessionStorage for conversation persistence (no backend storage needed for history)
