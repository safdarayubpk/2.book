# Implementation Plan: User Authentication with Background Collection

**Branch**: `011-user-auth` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-user-auth/spec.md`

## Summary

Implement complete user authentication system with signup (including background questions for personalization), signin, and session management. Uses FastAPI backend (on HuggingFace Spaces) with Neon PostgreSQL for storage and React components in Docusaurus frontend.

**Reusable Intelligence**: This implementation uses the `auth-agent` subagent (`.claude/agents/auth-agent.md`) and `better-auth` skill (`.claude/skills/better-auth/`) for patterns and component templates.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, uvicorn, passlib, PyJWT (backend); React 18.x, Docusaurus 3.x (frontend)
**Storage**: Neon PostgreSQL (existing - add users/sessions tables)
**Testing**: Manual testing, curl/Postman for API
**Target Platform**: Web (Vercel frontend, HuggingFace Spaces backend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: < 2 second auth response times
**Constraints**: Free tier compliance (Neon, HuggingFace Spaces)
**Scale/Scope**: Single user authentication, session-based

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | ✅ PASS | Minimal auth UI, 2-step signup, no complex flows |
| II. Mobile-Ready Performance | ✅ PASS | Touch-friendly forms, fast cookie auth |
| III. RAG Accuracy | N/A | Not RAG-related feature |
| IV. Personalization-Driven | ✅ PASS | Collects background for future personalization |
| V. Free-Tier Compliance | ✅ PASS | Uses existing Neon PostgreSQL |
| VI. Educational Focus | ✅ PASS | Background questions inform learning adaptation |
| VII. AI-Native Experience | ✅ PASS | Better-auth patterns, < 2s response |
| VIII. Rapid Deployment | ✅ PASS | Adds to existing HuggingFace backend |

## Project Structure

### Documentation (this feature)

```text
specs/011-user-auth/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── auth-api.yaml    # OpenAPI spec for auth endpoints
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
# Backend (existing scripts/ folder on HuggingFace Spaces)
scripts/
├── api.py               # MODIFY: Add auth routes
├── auth_routes.py       # NEW: Auth endpoint handlers
└── auth_utils.py        # NEW: Password hashing, JWT helpers

# Frontend (existing src/ folder in Docusaurus)
src/
├── components/
│   └── auth/            # NEW: Auth components
│       ├── SignupForm.tsx
│       ├── LoginForm.tsx
│       ├── AuthModal.tsx
│       └── AuthForms.module.css
├── context/
│   ├── ChatContext.tsx  # EXISTING
│   └── AuthContext.tsx  # NEW: Auth state management
├── hooks/
│   └── useAuth.ts       # NEW: Auth hook
└── theme/
    └── Navbar/          # MODIFY: Add auth buttons
        └── index.tsx
```

**Structure Decision**: Extend existing web application structure. Backend auth added to `scripts/api.py`. Frontend components in `src/components/auth/`.

## Complexity Tracking

No constitution violations. Implementation follows simplicity-first approach with minimal new files.
