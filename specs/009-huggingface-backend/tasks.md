# Tasks: HuggingFace Backend Deployment

**Input**: Design documents from `/specs/009-huggingface-backend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual integration testing only (no automated tests required for this deployment feature)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (HuggingFace Space Creation)

**Purpose**: Create HuggingFace Space and configure secrets

- [x] T001 Create HuggingFace Space at https://huggingface.co/new-space with Docker SDK, name "book-rag-api"
- [x] T002 [P] Add COHERE_API_KEY secret in HuggingFace Space Settings → Repository secrets
- [x] T003 [P] Add OPENAI_API_KEY secret in HuggingFace Space Settings → Repository secrets
- [x] T004 [P] Add QDRANT_URL secret in HuggingFace Space Settings → Repository secrets
- [x] T005 [P] Add QDRANT_API_KEY secret in HuggingFace Space Settings → Repository secrets
- [x] T006 [P] Add DATABASE_URL secret in HuggingFace Space Settings → Repository secrets

---

## Phase 2: Foundational (Docker & API Configuration)

**Purpose**: Prepare deployment files and update backend code - MUST complete before any user story verification

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create Dockerfile in project root with Python 3.11-slim, user ID 1000, port 7860
- [x] T008 Update load_env() function in scripts/api.py to make .env file optional
- [x] T009 Update CORS middleware in scripts/api.py to add Vercel production domain and regex for preview deployments

**Checkpoint**: Foundation ready - deployment can proceed

---

## Phase 3: User Story 1 - Chatbot Works for Website Visitors (Priority: P1)

**Goal**: Deploy backend to HuggingFace so chatbot responds to user questions from Vercel frontend

**Independent Test**: Visit live Vercel site, open chatbot, ask "What is Physical AI?", receive answer with sources

### Implementation for User Story 1

- [x] T010 [US1] Push Dockerfile, requirements.txt, and scripts/ to HuggingFace Space repository
- [x] T011 [US1] Create README.md with HuggingFace YAML metadata (sdk: docker, app_port: 7860) in HuggingFace Space
- [x] T012 [US1] Wait for HuggingFace Space to build and show "Running" status
- [x] T013 [US1] Verify /health endpoint returns ok status at https://safdarayub-book-rag-api.hf.space/health
- [x] T014 [US1] Update API_BASE_URL in src/services/chatApi.ts to HuggingFace Space URL
- [x] T015 [US1] Rebuild frontend with npm run build and deploy to Vercel
- [x] T016 [US1] Test chatbot end-to-end: visit Vercel site, ask question, verify response with sources

**Checkpoint**: User Story 1 complete - chatbot works for all visitors

---

## Phase 4: User Story 2 - Backend Remains Available (Priority: P2)

**Goal**: Verify backend health checks work and service restarts automatically

**Independent Test**: Check health endpoint periodically, verify service responds after being idle

### Implementation for User Story 2

- [ ] T017 [US2] Verify Docker HEALTHCHECK is working by checking HuggingFace Space logs for health check entries
- [ ] T018 [US2] Test cold start by waiting for Space to sleep (if on free tier), then sending request
- [ ] T019 [US2] Verify frontend shows appropriate loading state during cold start (30-60 seconds)
- [ ] T020 [US2] Document cold start behavior in project README or notes

**Checkpoint**: User Story 2 complete - backend availability confirmed

---

## Phase 5: User Story 3 - Secure API Communication (Priority: P3)

**Goal**: Verify HTTPS is used and CORS properly restricts unauthorized origins

**Independent Test**: Check network requests use HTTPS, verify CORS headers in browser DevTools

### Implementation for User Story 3

- [ ] T021 [US3] Verify all API requests from frontend use HTTPS (check browser DevTools Network tab)
- [ ] T022 [US3] Verify CORS headers in response include Access-Control-Allow-Origin with Vercel domain
- [ ] T023 [US3] Test CORS rejection by making request from unauthorized origin (e.g., local HTML file)
- [ ] T024 [US3] Verify credentials are not exposed in browser (API keys only on backend)

**Checkpoint**: User Story 3 complete - secure communication verified

---

## Phase 6: Polish & Documentation

**Purpose**: Final cleanup and documentation updates

- [ ] T025 [P] Update project README.md with HuggingFace deployment information
- [ ] T026 [P] Commit all local changes (Dockerfile, api.py CORS, chatApi.ts URL) to main branch
- [ ] T027 Push changes to GitHub repository
- [ ] T028 Run quickstart.md validation - verify all steps documented accurately

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Core deployment
- **User Story 2 (P2)**: Can start after User Story 1 is deployed - Validates availability
- **User Story 3 (P3)**: Can start after User Story 1 is deployed - Validates security

### Within Each Phase

- T001 must complete before T002-T006 can be verified
- T007-T009 can run in parallel
- T010-T011 must complete before T012
- T012 must complete before T013-T016
- T014-T015 can run in parallel
- T016 depends on T015 completion

### Parallel Opportunities

```text
Phase 1 Parallel:
- T002, T003, T004, T005, T006 (all secrets can be added simultaneously)

Phase 2 Parallel:
- T007, T008, T009 (different files, no dependencies)

Phase 6 Parallel:
- T025, T026 (different files)
```

---

## Parallel Example: Phase 1 Secrets

```bash
# All secrets can be added at the same time in HuggingFace Settings:
Task: "Add COHERE_API_KEY secret"
Task: "Add OPENAI_API_KEY secret"
Task: "Add QDRANT_URL secret"
Task: "Add QDRANT_API_KEY secret"
Task: "Add DATABASE_URL secret"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create Space, add secrets)
2. Complete Phase 2: Foundational (Dockerfile, api.py updates)
3. Complete Phase 3: User Story 1 (deploy and verify chatbot works)
4. **STOP and VALIDATE**: Test chatbot from Vercel site
5. Deploy if ready - chatbot is now live!

### Incremental Delivery

1. Setup + Foundational → Deployment infrastructure ready
2. User Story 1 → **Chatbot works!** (MVP achieved)
3. User Story 2 → Availability verified
4. User Story 3 → Security verified
5. Polish → Documentation complete

### Estimated Time

| Phase | Time |
|-------|------|
| Phase 1: Setup | 5 min |
| Phase 2: Foundational | 5 min |
| Phase 3: User Story 1 | 10 min |
| Phase 4: User Story 2 | 5 min |
| Phase 5: User Story 3 | 5 min |
| Phase 6: Polish | 5 min |
| **Total** | **~35 min** |

---

## Notes

- This is a deployment feature - minimal code changes required
- Main work is configuration: Dockerfile, CORS, API URL
- HuggingFace build may take 2-5 minutes
- Cold start on free tier is expected (30-60 seconds)
- All API keys must be valid and have quota
- Vercel frontend must be already deployed and working locally
