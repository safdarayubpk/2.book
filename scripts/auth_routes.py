"""
Authentication Routes

FastAPI router for user authentication endpoints:
- POST /api/auth/sign-up - Register new user with background info
- POST /api/auth/sign-in - Login existing user
- GET /api/auth/session - Get current session
- POST /api/auth/sign-out - Logout user
"""

import logging
import os
from enum import Enum
from typing import List, Optional

import psycopg2
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

from .auth_utils import (
    create_access_token,
    decode_access_token,
    get_token_expiry_seconds,
    hash_password,
    verify_password,
)


# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/auth", tags=["auth"])

# Cookie settings
COOKIE_NAME = "session_token"
COOKIE_SECURE = os.getenv("ENVIRONMENT", "production") == "production"
COOKIE_SAMESITE = "none" if COOKIE_SECURE else "lax"


# =============================================================================
# Enums and Models
# =============================================================================

class ProgrammingLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class HardwareBackground(str, Enum):
    none = "none"
    hobbyist = "hobbyist"
    professional = "professional"


class LearningGoal(str, Enum):
    career_transition = "career_transition"
    academic = "academic"
    personal = "personal"
    upskilling = "upskilling"


class SignUpRequest(BaseModel):
    """Sign up request with background information."""
    email: EmailStr
    password: str = Field(min_length=8)
    name: Optional[str] = None
    programmingLevel: ProgrammingLevel
    hardwareBackground: HardwareBackground
    learningGoals: List[LearningGoal] = Field(min_length=1)


class SignInRequest(BaseModel):
    """Sign in request."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User data returned in responses."""
    id: str
    email: str
    name: Optional[str] = None
    programmingLevel: Optional[str] = None
    hardwareBackground: Optional[str] = None
    learningGoals: Optional[List[str]] = None


class AuthResponse(BaseModel):
    """Response for successful auth operations."""
    user: UserResponse
    message: str


class SessionResponse(BaseModel):
    """Response for session check."""
    session: Optional[dict] = None


# =============================================================================
# Database Helpers
# =============================================================================

def get_db_connection():
    """Get database connection."""
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def user_to_response(row: tuple) -> UserResponse:
    """Convert database row to UserResponse."""
    return UserResponse(
        id=str(row[0]),
        email=row[1],
        name=row[2],
        programmingLevel=row[3],
        hardwareBackground=row[4],
        learningGoals=row[5] if row[5] else [],
    )


# =============================================================================
# Routes
# =============================================================================

@router.post("/sign-up", response_model=AuthResponse, status_code=201)
async def sign_up(request: SignUpRequest, response: Response):
    """
    Register a new user with email, password, and background information.

    Returns user data and sets session cookie.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (request.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Email already registered")

        # Hash password
        logger.info(f"Hashing password for {request.email}")
        password_hash = hash_password(request.password)
        logger.info("Password hashed successfully")

        # Convert learning goals to list of strings
        learning_goals = [goal.value for goal in request.learningGoals]
        logger.info(f"Learning goals: {learning_goals}")

        # Insert new user
        logger.info("Inserting user into database")
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, name, programming_level, hardware_background, learning_goals)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, email, name, programming_level, hardware_background, learning_goals
            """,
            (
                request.email,
                password_hash,
                request.name,
                request.programmingLevel.value,
                request.hardwareBackground.value,
                learning_goals,
            ),
        )

        row = cursor.fetchone()
        conn.commit()
        logger.info(f"User inserted: {row[0]}")

        user = user_to_response(row)
        logger.info(f"User response created: {user.id}")

        # Create and set session token
        logger.info("Creating access token")
        token = create_access_token(user.id, user.email)
        logger.info("Token created successfully")
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite=COOKIE_SAMESITE,
            max_age=get_token_expiry_seconds(),
        )

        logger.info(f"User registered: {user.email}")
        return AuthResponse(user=user, message="Account created successfully")

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Sign up error: {type(e).__name__}: {e}")
        # Include full error for debugging (remove in production)
        raise HTTPException(status_code=500, detail=f"Failed to create account: {type(e).__name__}: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/sign-in", response_model=AuthResponse)
async def sign_in(request: SignInRequest, response: Response):
    """
    Authenticate user with email and password.

    Returns user data and sets session cookie.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get user by email
        cursor.execute(
            """
            SELECT id, email, name, programming_level, hardware_background, learning_goals, password_hash
            FROM users WHERE email = %s
            """,
            (request.email,),
        )
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Verify password (password_hash is last column)
        if not verify_password(request.password, row[6]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user = user_to_response(row[:6])

        # Create and set session token
        token = create_access_token(user.id, user.email)
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite=COOKIE_SAMESITE,
            max_age=get_token_expiry_seconds(),
        )

        logger.info(f"User logged in: {user.email}")
        return AuthResponse(user=user, message="Login successful")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Sign in error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")
    finally:
        cursor.close()
        conn.close()


@router.get("/session", response_model=SessionResponse)
async def get_session(request: Request):
    """
    Get current session from cookie.

    Returns user data if authenticated, null session otherwise.
    """
    token = request.cookies.get(COOKIE_NAME)

    if not token:
        return SessionResponse(session=None)

    payload = decode_access_token(token)
    if not payload:
        return SessionResponse(session=None)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT id, email, name, programming_level, hardware_background, learning_goals
            FROM users WHERE id = %s
            """,
            (payload["sub"],),
        )
        row = cursor.fetchone()

        if not row:
            return SessionResponse(session=None)

        user = user_to_response(row)
        return SessionResponse(session={"user": user.model_dump()})

    except Exception as e:
        logger.error(f"Session check error: {e}")
        return SessionResponse(session=None)
    finally:
        cursor.close()
        conn.close()


@router.post("/sign-out")
async def sign_out(response: Response):
    """
    Sign out user by clearing session cookie.
    """
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )
    logger.info("User signed out")
    return {"success": True}
