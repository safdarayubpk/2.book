# Quickstart: User Authentication

**Feature**: 011-user-auth
**Date**: 2025-12-23

## Prerequisites

- Existing HuggingFace Spaces backend running (`scripts/api.py`)
- Neon PostgreSQL database with connection configured
- Docusaurus frontend with React components
- Environment variables configured

## Step 1: Database Setup

Run this SQL in Neon PostgreSQL console:

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    programming_level VARCHAR(50),
    hardware_background VARCHAR(50),
    learning_goals TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## Step 2: Add Backend Dependencies

Add to `requirements.txt`:
```
passlib[bcrypt]==1.7.4
PyJWT==2.8.0
```

## Step 3: Environment Variables

Add to `.env`:
```
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
```

## Step 4: Backend Auth Routes

Create `scripts/auth_routes.py` with:
- POST `/api/auth/sign-up` - Register with background fields
- POST `/api/auth/sign-in` - Login
- GET `/api/auth/session` - Get current user
- POST `/api/auth/sign-out` - Logout

## Step 5: Frontend Components

Create in `src/components/auth/`:
- `SignupForm.tsx` - 2-step signup form
- `LoginForm.tsx` - Login form
- `AuthModal.tsx` - Modal container
- `AuthForms.module.css` - Styles

## Step 6: Auth Context

Create `src/context/AuthContext.tsx`:
- User state management
- Session check on mount
- Sign in/out methods

## Step 7: Navbar Integration

Modify `src/theme/Navbar/index.tsx`:
- Show Sign In/Sign Up for guests
- Show user name + Sign Out for authenticated

## Verification

1. **Backend Test**:
```bash
# Sign up
curl -X POST http://localhost:8000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","programmingLevel":"beginner","hardwareBackground":"none","learningGoals":["personal"]}'

# Sign in
curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

2. **Frontend Test**:
- Open book site
- Click "Sign Up" in navbar
- Complete 2-step signup
- Verify user appears in navbar
- Refresh page, verify still logged in
- Click "Sign Out", verify logged out

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `scripts/auth_routes.py` | NEW | Auth endpoint handlers |
| `scripts/auth_utils.py` | NEW | Password/JWT helpers |
| `scripts/api.py` | MODIFY | Include auth router |
| `src/components/auth/*` | NEW | React auth components |
| `src/context/AuthContext.tsx` | NEW | Auth state management |
| `src/theme/Navbar/index.tsx` | MODIFY | Auth buttons |
| `requirements.txt` | MODIFY | Add passlib, PyJWT |
