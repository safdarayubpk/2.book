#!/usr/bin/env python3
"""
Setup script for better-auth integration.
Creates necessary files and database schema for authentication.
"""

import os
import sys
import secrets
import subprocess

def generate_secret():
    """Generate a secure 32-byte secret key."""
    return secrets.token_urlsafe(32)

def create_env_file(project_root: str, database_url: str = None):
    """Create or update .env file with auth variables."""
    env_path = os.path.join(project_root, '.env')

    secret = generate_secret()

    env_content = f"""# Authentication (better-auth)
BETTER_AUTH_SECRET={secret}
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL={database_url or 'postgresql://user:password@localhost:5432/dbname'}
"""

    if os.path.exists(env_path):
        print(f"Appending to existing .env file at {env_path}")
        with open(env_path, 'a') as f:
            f.write("\n" + env_content)
    else:
        print(f"Creating new .env file at {env_path}")
        with open(env_path, 'w') as f:
            f.write(env_content)

    return secret

def create_auth_lib(project_root: str, framework: str = 'fastapi'):
    """Create auth library file based on framework."""
    lib_dir = os.path.join(project_root, 'lib')
    os.makedirs(lib_dir, exist_ok=True)

    if framework == 'fastapi':
        auth_file = os.path.join(project_root, 'backend', 'auth_routes.py')
        os.makedirs(os.path.dirname(auth_file), exist_ok=True)

        content = '''"""
Authentication routes for FastAPI backend.
Compatible with better-auth client SDK.
"""
from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel, EmailStr
from passlib.hash import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from typing import Optional
import psycopg2

router = APIRouter(prefix="/api/auth")

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    programmingLevel: Optional[str] = None
    hardwareBackground: Optional[str] = None
    learningGoals: Optional[list[str]] = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@router.post("/sign-up")
async def sign_up(data: SignUpRequest, response: Response):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Check if user exists
        cur.execute("SELECT id FROM users WHERE email = %s", (data.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password and create user
        password_hash = bcrypt.hash(data.password)
        cur.execute(
            """
            INSERT INTO users (email, password_hash, name, programming_level, hardware_background, learning_goals)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, email, name
            """,
            (data.email, password_hash, data.name, data.programmingLevel,
             data.hardwareBackground, data.learningGoals)
        )
        user = cur.fetchone()
        conn.commit()

        # Create session token
        token = create_token(str(user[0]))

        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=os.getenv("NODE_ENV") == "production",
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        return {"user": {"id": user[0], "email": user[1], "name": user[2]}}

    finally:
        cur.close()
        conn.close()

@router.post("/sign-in")
async def sign_in(data: SignInRequest, response: Response):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id, email, name, password_hash FROM users WHERE email = %s",
            (data.email,)
        )
        user = cur.fetchone()

        if not user or not bcrypt.verify(data.password, user[3]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token(str(user[0]))

        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=os.getenv("NODE_ENV") == "production",
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        return {"user": {"id": user[0], "email": user[1], "name": user[2]}}

    finally:
        cur.close()
        conn.close()

@router.get("/session")
async def get_session(request: Request):
    token = request.cookies.get("session_token")

    if not token:
        return {"session": None}

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["sub"]

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, email, name, programming_level, hardware_background, learning_goals
            FROM users WHERE id = %s
            """,
            (user_id,)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user:
            return {"session": None}

        return {
            "session": {
                "user": {
                    "id": user[0],
                    "email": user[1],
                    "name": user[2],
                    "programmingLevel": user[3],
                    "hardwareBackground": user[4],
                    "learningGoals": user[5],
                }
            }
        }

    except jwt.ExpiredSignatureError:
        return {"session": None}
    except jwt.InvalidTokenError:
        return {"session": None}

@router.post("/sign-out")
async def sign_out(response: Response):
    response.delete_cookie("session_token")
    return {"success": True}
'''

        with open(auth_file, 'w') as f:
            f.write(content)

        print(f"Created {auth_file}")

def main():
    if len(sys.argv) < 2:
        print("Usage: setup-auth.py <project_root> [database_url]")
        sys.exit(1)

    project_root = sys.argv[1]
    database_url = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"Setting up authentication in {project_root}")

    secret = create_env_file(project_root, database_url)
    print(f"Generated secret: {secret[:10]}...")

    create_auth_lib(project_root)

    print("\nSetup complete! Next steps:")
    print("1. Update DATABASE_URL in .env with your Neon connection string")
    print("2. Run database migrations to create user tables")
    print("3. Add auth routes to your FastAPI app")

if __name__ == "__main__":
    main()
