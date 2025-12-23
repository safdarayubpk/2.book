# Better-Auth Setup Guide

## Framework-Specific Setup

### Docusaurus + FastAPI (Recommended for this project)

Since Docusaurus is a static site generator, auth must be handled via:
1. **Backend**: FastAPI (Python) or Express (Node.js) for auth API
2. **Frontend**: React components within Docusaurus for UI

#### Backend Setup (FastAPI)

```python
# backend/auth.py
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Better-auth requires a Node.js server, so we have two options:
# Option A: Use a separate Node.js service for auth
# Option B: Implement compatible endpoints in FastAPI

# Option B Implementation:
from passlib.hash import bcrypt
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")

@app.post("/api/auth/sign-up")
async def sign_up(request: Request):
    data = await request.json()
    # Hash password
    hashed = bcrypt.hash(data["password"])
    # Store user in database with custom fields
    user = {
        "email": data["email"],
        "password": hashed,
        "name": data["name"],
        "programming_level": data.get("programmingLevel"),
        "hardware_background": data.get("hardwareBackground"),
        "learning_goals": data.get("learningGoals"),
    }
    # Insert into Neon PostgreSQL
    # Return session token

@app.post("/api/auth/sign-in")
async def sign_in(request: Request):
    data = await request.json()
    # Verify credentials
    # Return session token

@app.get("/api/auth/session")
async def get_session(request: Request):
    # Validate token from cookie/header
    # Return user session
```

### Node.js/Express Backend (Native better-auth)

```typescript
// backend/server.ts
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import cors from "cors";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://your-domain.vercel.app"],
  credentials: true,
}));

// Mount better-auth handler
app.all("/api/auth/*", toNodeHandler(auth));

app.listen(8000, () => {
  console.log("Auth server running on port 8000");
});
```

## Database Schema

### Neon PostgreSQL Setup

```sql
-- Users table with custom fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    programming_level VARCHAR(50),
    hardware_background VARCHAR(50),
    learning_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_users_email ON users(email);
```

## Environment Variables

```env
# Auth
BETTER_AUTH_SECRET=your-32-char-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## CORS Configuration

Critical for cross-origin auth:

```typescript
// Allow credentials for cookies
app.use(cors({
  origin: true,
  credentials: true,
}));
```

## Cookie Settings for Production

```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
```
