#!/usr/bin/env python3
"""
Create users table for authentication.

Usage:
    python scripts/create_users_table.py
"""

import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv


def load_env() -> None:
    """Load environment variables from .env file."""
    env_path = Path(__file__).parent.parent / ".env"
    if not env_path.exists():
        print(f"Error: .env file not found at {env_path}")
        sys.exit(1)
    load_dotenv(env_path)

    if not os.getenv("DATABASE_URL"):
        print("Error: DATABASE_URL not configured in .env")
        sys.exit(1)


def create_users_table() -> None:
    """Create users table with personalization fields."""
    load_env()

    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()

    try:
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                programming_level VARCHAR(50) CHECK (
                    programming_level IN ('beginner', 'intermediate', 'advanced')
                ),
                hardware_background VARCHAR(50) CHECK (
                    hardware_background IN ('none', 'hobbyist', 'professional')
                ),
                learning_goals TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create index for email lookups
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        """)

        conn.commit()
        print("✓ Users table created successfully")

        # Verify table exists
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        print("\nTable structure:")
        for col_name, col_type in columns:
            print(f"  - {col_name}: {col_type}")

    except Exception as e:
        print(f"Error creating table: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    create_users_table()
