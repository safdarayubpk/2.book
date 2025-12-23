"""
Authentication Utilities

Provides password hashing and JWT token management for the auth system.
"""

import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from passlib.context import CryptContext


# JWT Configuration
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Password hashing context - use argon2 (no 72-byte limit like bcrypt)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_secret_key() -> str:
    """Get the secret key from environment."""
    secret = os.getenv("BETTER_AUTH_SECRET")
    if not secret:
        raise ValueError("BETTER_AUTH_SECRET environment variable not set")
    return secret


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        password: Plain text password to verify
        password_hash: Stored bcrypt hash

    Returns:
        True if password matches, False otherwise
    """
    try:
        return pwd_context.verify(password, password_hash)
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    """
    Create a JWT access token.

    Args:
        user_id: User's UUID
        email: User's email

    Returns:
        Encoded JWT token string
    """
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, get_secret_key(), algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT access token.

    Args:
        token: JWT token string

    Returns:
        Decoded payload dict or None if invalid/expired
    """
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_token_expiry_seconds() -> int:
    """Get token expiry time in seconds for cookie max_age."""
    return JWT_EXPIRATION_DAYS * 24 * 60 * 60
