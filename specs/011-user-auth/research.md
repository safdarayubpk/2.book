# Research: User Authentication

**Feature**: 011-user-auth
**Date**: 2025-12-23

## Technology Decisions

### 1. Authentication Library Approach

**Decision**: Implement custom auth routes in FastAPI (not better-auth library directly)

**Rationale**:
- better-auth is a TypeScript library, but our backend is Python/FastAPI
- Implementing auth endpoints directly in FastAPI is simpler than running a separate Node.js service
- We'll use better-auth PATTERNS from our skill, not the library itself
- Password hashing: passlib with bcrypt
- Session tokens: PyJWT for stateless tokens

**Alternatives Considered**:
- better-auth library: Rejected - requires Node.js, adds complexity
- FastAPI-users: Rejected - overkill for our simple needs
- Auth0/Clerk: Rejected - external service, free tier limits

### 2. Session Management

**Decision**: JWT tokens stored in httpOnly cookies

**Rationale**:
- Cookies automatically sent with requests (credentials: include)
- httpOnly prevents XSS attacks
- JWT is stateless, no session table needed initially
- Can add session table later for revocation if needed

**Alternatives Considered**:
- Session table only: More secure but requires DB lookup on every request
- LocalStorage: Vulnerable to XSS, not recommended

### 3. Password Requirements

**Decision**: Minimum 8 characters, no complexity requirements

**Rationale**:
- NIST guidelines recommend length over complexity
- Educational platform, not banking - balance security with usability
- Can add complexity rules later if needed

### 4. CORS Configuration

**Decision**: Allow specific origins (Vercel frontend, localhost)

**Rationale**:
- HuggingFace Spaces backend needs explicit CORS for cookie auth
- credentials: true requires explicit origin (not *)
- Configure: https://*.vercel.app, http://localhost:3000

### 5. Database Schema

**Decision**: Add users table with background fields to existing Neon PostgreSQL

**Rationale**:
- Existing database already has connection
- Single table with all fields (not normalized)
- learning_goals as TEXT[] array for multi-select

**Schema**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    programming_level VARCHAR(50),
    hardware_background VARCHAR(50),
    learning_goals TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Frontend Component Strategy

**Decision**: React components with CSS modules, modal-based UI

**Rationale**:
- Docusaurus uses React, CSS modules already in use
- Modal keeps user on current page during auth
- Reuse component templates from better-auth skill assets

## Dependencies to Add

### Backend (requirements.txt)
```
passlib[bcrypt]==1.7.4
PyJWT==2.8.0
```

### Frontend (package.json)
No new dependencies - using existing React and Docusaurus.

## Integration Points

### 1. API Routes (add to scripts/api.py)
- POST /api/auth/sign-up
- POST /api/auth/sign-in
- GET /api/auth/session
- POST /api/auth/sign-out

### 2. CORS Update
Add to existing CORS middleware:
```python
allow_origins=[
    "https://2-book.vercel.app",
    "http://localhost:3000"
]
allow_credentials=True
```

### 3. Navbar Integration
Swizzle Docusaurus Navbar to add:
- Guest: "Sign In" / "Sign Up" buttons
- Logged in: User name + "Sign Out"

## Security Considerations

1. **Password Hashing**: bcrypt with default work factor
2. **Cookie Security**: httpOnly=True, secure=True in production, samesite=lax
3. **Token Expiry**: 7 days, refresh on activity
4. **Rate Limiting**: Consider adding after MVP (not in initial scope)

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Cross-domain cookies fail | Use samesite=none, secure=true |
| HuggingFace cold start delays | JWT is stateless, no DB hit for session check |
| Email enumeration | Generic "Invalid credentials" error |
