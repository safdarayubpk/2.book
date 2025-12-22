#!/usr/bin/env python3
"""
Metadata Storage Pipeline for RAG

This script:
1. Loads chunks from data/chunks.json
2. Connects to Neon Postgres
3. Creates the documents table if it doesn't exist
4. Stores/updates metadata for each chunk (upsert)

Usage:
    python scripts/store-metadata.py
    python scripts/store-metadata.py --count
    python scripts/store-metadata.py --lookup doc-001-0001
    python scripts/store-metadata.py --source docs/chapter-1/index.md
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import psycopg2
from dotenv import load_dotenv


# Constants
BATCH_SIZE = 10


def load_env() -> None:
    """Load environment variables from .env file."""
    env_path = Path(__file__).parent.parent / ".env"
    if not env_path.exists():
        print(f"Error: .env file not found at {env_path}")
        print("Please copy data/.env.example to .env and add your credentials.")
        sys.exit(1)
    load_dotenv(env_path)

    if not os.getenv("DATABASE_URL"):
        print("Error: DATABASE_URL not configured in .env")
        print("Please add your Neon PostgreSQL connection string.")
        print("Format: postgresql://user:password@host/db?sslmode=require")
        sys.exit(1)


def load_chunks() -> List[Dict[str, Any]]:
    """Load and validate chunks from chunks.json."""
    chunks_path = Path(__file__).parent.parent / "data" / "chunks.json"
    if not chunks_path.exists():
        print(f"Error: chunks.json not found at {chunks_path}")
        print("Please run 'npm run ingest' first to generate chunks.")
        sys.exit(1)

    with open(chunks_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data.get("chunks", [])
    if not chunks:
        print("Error: No chunks found in chunks.json")
        sys.exit(1)

    # Validate required fields
    required_fields = ["chunk_id", "text", "source_path", "slug", "title", "order_index"]
    for i, chunk in enumerate(chunks):
        missing = [f for f in required_fields if f not in chunk]
        if missing:
            print(f"Error: Chunk {i} missing fields: {missing}")
            sys.exit(1)

    return chunks


def init_db_connection() -> psycopg2.extensions.connection:
    """Initialize and return PostgreSQL connection."""
    database_url = os.getenv("DATABASE_URL")
    try:
        conn = psycopg2.connect(database_url)
        return conn
    except psycopg2.Error as e:
        print(f"Error: Could not connect to database: {e}")
        sys.exit(1)


def create_table(conn: psycopg2.extensions.connection) -> None:
    """Create documents table if it doesn't exist."""
    create_sql = """
    CREATE TABLE IF NOT EXISTS documents (
        chunk_id      VARCHAR(50)   PRIMARY KEY,
        source_path   TEXT          NOT NULL,
        slug          VARCHAR(100)  NOT NULL,
        title         VARCHAR(255),
        order_index   INTEGER       NOT NULL,
        snippet       TEXT          NOT NULL,
        created_at    TIMESTAMP     DEFAULT NOW()
    );
    """

    create_index_source = """
    CREATE INDEX IF NOT EXISTS idx_documents_source_path ON documents(source_path);
    """

    create_index_slug = """
    CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
    """

    with conn.cursor() as cur:
        cur.execute(create_sql)
        cur.execute(create_index_source)
        cur.execute(create_index_slug)
    conn.commit()


def store_metadata(
    conn: psycopg2.extensions.connection,
    chunks: List[Dict[str, Any]]
) -> int:
    """Store chunk metadata with upsert (ON CONFLICT UPDATE)."""
    upsert_sql = """
    INSERT INTO documents (chunk_id, source_path, slug, title, order_index, snippet, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, NOW())
    ON CONFLICT (chunk_id) DO UPDATE SET
        source_path = EXCLUDED.source_path,
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        order_index = EXCLUDED.order_index,
        snippet = EXCLUDED.snippet;
    """

    total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE
    records_processed = 0

    try:
        with conn.cursor() as cur:
            for i in range(0, len(chunks), BATCH_SIZE):
                batch = chunks[i:i + BATCH_SIZE]
                batch_num = i // BATCH_SIZE + 1

                for chunk in batch:
                    cur.execute(upsert_sql, (
                        chunk["chunk_id"],
                        chunk["source_path"],
                        chunk["slug"],
                        chunk.get("title", ""),
                        chunk["order_index"],
                        chunk["text"]
                    ))
                    records_processed += 1

                print(f"  Batch {batch_num}/{total_batches}: {len(batch)} records upserted")

        conn.commit()
        return records_processed
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Error storing metadata: {e}")
        raise


def verify_count(conn: psycopg2.extensions.connection) -> int:
    """Return total count of records in documents table."""
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM documents")
        count = cur.fetchone()[0]
    return count


def show_count(conn: psycopg2.extensions.connection) -> None:
    """Display total record count."""
    count = verify_count(conn)
    print(f"Total records in database: {count}")


def lookup_chunk(conn: psycopg2.extensions.connection, chunk_id: str) -> None:
    """Look up and display metadata for a specific chunk_id."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT chunk_id, source_path, slug, title, order_index, snippet
            FROM documents
            WHERE chunk_id = %s
        """, (chunk_id,))
        row = cur.fetchone()

    if not row:
        print(f"Chunk not found: {chunk_id}")
        return

    chunk_id, source_path, slug, title, order_index, snippet = row

    # Truncate snippet for display
    max_len = 200
    display_snippet = snippet[:max_len] + "..." if len(snippet) > max_len else snippet

    print(f"Chunk ID: {chunk_id}")
    print(f"Source: {source_path}")
    print(f"Slug: {slug}")
    print(f"Title: {title or '(none)'}")
    print(f"Order: {order_index}")
    print(f"Snippet: \"{display_snippet}\"")


def filter_by_source(conn: psycopg2.extensions.connection, source_path: str) -> None:
    """Filter and display chunks by source_path."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT chunk_id, title, order_index
            FROM documents
            WHERE source_path = %s
            ORDER BY order_index
        """, (source_path,))
        rows = cur.fetchall()

    if not rows:
        print(f"No chunks found for source: {source_path}")
        return

    print(f"Chunks from: {source_path}")
    print(f"Found {len(rows)} chunks:")
    print()
    for chunk_id, title, order_index in rows:
        print(f"  [{order_index}] {chunk_id} - {title or '(no title)'}")


def main() -> None:
    """Main entry point with argument parsing."""
    parser = argparse.ArgumentParser(
        description="Store and query chunk metadata in PostgreSQL"
    )
    parser.add_argument(
        "--count",
        action="store_true",
        help="Display total record count in database"
    )
    parser.add_argument(
        "--lookup",
        metavar="CHUNK_ID",
        help="Look up metadata for a specific chunk_id"
    )
    parser.add_argument(
        "--source",
        metavar="PATH",
        help="Filter chunks by source_path"
    )

    args = parser.parse_args()

    # Load environment
    print("=" * 50)
    print("Metadata Storage Pipeline")
    print("=" * 50)
    print()

    print("Loading environment...")
    load_env()
    print()

    # Connect to database
    print("Connecting to database...")
    conn = init_db_connection()
    print("Connected.")
    print()

    # Create table
    print("Creating documents table...")
    create_table(conn)
    print("Table ready.")
    print()

    # Handle query modes
    if args.count:
        show_count(conn)
        conn.close()
        return

    if args.lookup:
        lookup_chunk(conn, args.lookup)
        conn.close()
        return

    if args.source:
        filter_by_source(conn, args.source)
        conn.close()
        return

    # Default: store metadata
    print("Loading chunks from data/chunks.json...")
    chunks = load_chunks()
    print(f"Found {len(chunks)} chunks to process.")
    print()

    print("Storing metadata...")
    records = store_metadata(conn, chunks)
    print()

    print("Verifying...")
    count = verify_count(conn)
    print(f"Total records in database: {count}")
    print()

    # Summary
    print("=" * 50)
    print("Summary")
    print("=" * 50)
    print(f"Chunks processed: {len(chunks)}")
    print(f"Records stored: {records}")
    print("Done!")

    conn.close()


if __name__ == "__main__":
    main()
