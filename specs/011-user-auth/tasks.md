# Tasks: User Authentication with Background Collection

**Input**: Design documents from `/specs/011-user-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing via curl/Postman (no automated tests requested)

**Organization**: Tasks grouped by user story for independent implementation

**Reusable Intelligence**: Use `auth-agent` subagent and `better-auth` skill from `.claude/` for patterns and templates

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `scripts/` (existing FastAPI on HuggingFace Spaces)
- **Frontend**: `src/` (existing Docusaurus)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and database schema

- [x] T001 Add passlib[bcrypt] and PyJWT to requirements.txt
- [x] T002 Add BETTER_AUTH_SECRET to .env file (generate with openssl rand -base64 32)
- [x] T003 Create users table in Neon PostgreSQL using schema from data-model.md
- [x] T004 [P] Create TypeScript types for auth in src/types/auth.ts

---

## Phase 2: Foundational (Backend Auth Infrastructure)

**Purpose**: Core auth utilities and routes that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create auth utilities in scripts/auth_utils.py (password hashing with bcrypt, JWT encode/decode)
- [x] T006 Create auth routes file scripts/auth_routes.py with FastAPI router
- [x] T007 Update CORS in scripts/api.py to allow credentials and Vercel origins
- [x] T008 Include auth router in scripts/api.py main app

**Checkpoint**: Backend auth infrastructure ready - frontend work can begin

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) MVP

**Goal**: Visitors can create accounts with email/password and complete background questionnaire

**Independent Test**: Create account via signup form, verify user appears in database with all background fields, verify auto-login after signup

### Backend Implementation for US1

- [x] T009 [US1] Implement POST /api/auth/sign-up endpoint in scripts/auth_routes.py
- [x] T010 [US1] Add email uniqueness check and 409 conflict response
- [x] T011 [US1] Set httpOnly session cookie on successful signup

### Frontend Implementation for US1

- [x] T012 [P] [US1] Create AuthContext provider in src/context/AuthContext.tsx
- [x] T013 [P] [US1] Create useAuth hook in src/hooks/useAuth.ts
- [x] T014 [P] [US1] Create SignupForm component (2-step) in src/components/auth/SignupForm.tsx
- [x] T015 [P] [US1] Create AuthForms.module.css styles in src/components/auth/AuthForms.module.css
- [x] T016 [US1] Create AuthModal wrapper in src/components/auth/AuthModal.tsx
- [x] T017 [US1] Connect SignupForm to POST /api/auth/sign-up with credentials:include
- [x] T018 [US1] Add form validation (email format, password 8+ chars, required background fields)

**Checkpoint**: Users can sign up with background questions - verify with curl and browser

---

## Phase 4: User Story 2 - Returning User Login (Priority: P1)

**Goal**: Registered users can sign in and have session persist across navigation/refresh

**Independent Test**: Sign in with valid credentials, navigate pages, refresh browser - verify still logged in

### Backend Implementation for US2

- [x] T019 [US2] Implement POST /api/auth/sign-in endpoint in scripts/auth_routes.py
- [x] T020 [US2] Add password verification with passlib bcrypt
- [x] T021 [US2] Return generic "Invalid credentials" error (no email enumeration)
- [x] T022 [US2] Implement GET /api/auth/session endpoint in scripts/auth_routes.py

### Frontend Implementation for US2

- [x] T023 [P] [US2] Create LoginForm component in src/components/auth/LoginForm.tsx
- [x] T024 [US2] Connect LoginForm to POST /api/auth/sign-in
- [x] T025 [US2] Add session check on app mount in AuthContext (call GET /api/auth/session)
- [x] T026 [US2] Persist user state in AuthContext after successful login

**Checkpoint**: Users can log in and session persists - verify with browser refresh

---

## Phase 5: User Story 3 - User Logout (Priority: P2)

**Goal**: Logged-in users can sign out and clear their session

**Independent Test**: Log in, click sign out, verify session cleared, refresh shows logged-out state

### Backend Implementation for US3

- [x] T027 [US3] Implement POST /api/auth/sign-out endpoint in scripts/auth_routes.py
- [x] T028 [US3] Clear session cookie in sign-out response

### Frontend Implementation for US3

- [x] T029 [US3] Add signOut method to AuthContext
- [x] T030 [US3] Connect sign out button to POST /api/auth/sign-out

**Checkpoint**: Users can fully log out - verify cookie is cleared

---

## Phase 6: User Story 4 - Auth State in Navigation (Priority: P2)

**Goal**: Navbar shows login/signup for guests, user name + logout for authenticated users

**Independent Test**: View navbar as guest (shows Sign In/Sign Up), log in (shows name + Sign Out), log out (reverts)

### Frontend Implementation for US4

- [x] T031 [US4] Swizzle Docusaurus Navbar component to src/theme/NavbarItem/ComponentTypes.tsx
- [x] T032 [US4] Add AuthProvider wrapper to Docusaurus Root component
- [x] T033 [US4] Add auth buttons to navbar (Sign In, Sign Up for guests)
- [x] T034 [US4] Show user name/email and Sign Out button when logged in
- [x] T035 [US4] Make auth buttons mobile-friendly (touch targets 44x44px minimum)

**Checkpoint**: Navbar correctly reflects auth state - full auth flow works end-to-end

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, deployment, error handling improvements

- [x] T036 Add loading states to auth forms during API calls
- [x] T037 Add error boundary for auth component failures
- [ ] T038 Test auth flow on HuggingFace Spaces production backend
- [x] T039 Update CORS origins for production Vercel domain
- [x] T040 Verify cookie settings work cross-domain (samesite, secure)
- [ ] T041 Run quickstart.md validation with curl commands
- [ ] T042 Deploy backend changes to HuggingFace Spaces
- [ ] T043 Deploy frontend changes to Vercel

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────►
                    │
                    ▼
Phase 2 (Foundational) ──────────────────────────────────────►
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
Phase 3 (US1)   Phase 4 (US2)   Phase 5 (US3)  ──► Phase 6 (US4)
    │               │               │                    │
    └───────────────┴───────────────┴────────────────────┘
                                                         │
                                                         ▼
                                              Phase 7 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Signup) | Phase 2 | Foundational complete |
| US2 (Login) | Phase 2 | Foundational complete (parallel with US1) |
| US3 (Logout) | Phase 2 | Foundational complete (parallel with US1, US2) |
| US4 (Navbar) | US1, US2, US3 | All auth endpoints working |

### Within Each User Story

- Backend endpoints before frontend components
- AuthContext before components that use it
- Core functionality before error handling

---

## Parallel Opportunities

### Phase 1 Parallel Tasks
```
T001 (requirements.txt) ─┬─ parallel
T002 (.env)             ─┤
T003 (database)         ─┤
T004 (TypeScript types) ─┘
```

### Phase 3 (US1) Parallel Tasks
```
T012 (AuthContext)      ─┬─ parallel (frontend)
T013 (useAuth hook)     ─┤
T014 (SignupForm)       ─┤
T015 (CSS styles)       ─┘
```

### Phase 4 (US2) Parallel Tasks
```
T023 (LoginForm)        ─── can run parallel with backend tasks
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dependencies, database)
2. Complete Phase 2: Foundational (auth utils, routes structure)
3. Complete Phase 3: User Story 1 (signup with background questions)
4. **STOP and VALIDATE**: Test signup flow end-to-end
5. Users can create accounts with personalization data stored

### Incremental Delivery

1. Setup + Foundational → Backend auth infrastructure ready
2. Add US1 (Signup) → Test → Deploy (MVP - accounts can be created)
3. Add US2 (Login) → Test → Deploy (returning users supported)
4. Add US3 (Logout) → Test → Deploy (full session lifecycle)
5. Add US4 (Navbar) → Test → Deploy (polished UX)
6. Polish phase → Final deployment

---

## Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1: Setup | T001-T004 (4) | - |
| Phase 2: Foundational | T005-T008 (4) | - |
| Phase 3: US1 Signup | T009-T018 (10) | P1 MVP |
| Phase 4: US2 Login | T019-T026 (8) | P1 |
| Phase 5: US3 Logout | T027-T030 (4) | P2 |
| Phase 6: US4 Navbar | T031-T035 (5) | P2 |
| Phase 7: Polish | T036-T043 (8) | - |
| **TOTAL** | **43 tasks** | |

---

## Notes

- Use `auth-agent` subagent (`.claude/agents/auth-agent.md`) for implementation guidance
- Use `better-auth` skill templates from `.claude/skills/better-auth/assets/components/`
- All cookies must use httpOnly=True, secure=True (production), samesite=lax
- Backend URL: https://safdarayubpk-2book-backend.hf.space
- Frontend needs credentials: 'include' for all auth API calls
- Commit after each task or logical group
