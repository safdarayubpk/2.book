#!/usr/bin/env python3
"""
Embedding Generation & Vector Storage Pipeline for RAG

This script:
1. Loads chunks from data/chunks.json
2. Generates embeddings using Cohere API (embed-english-v3.0)
3. Stores vectors in Qdrant Cloud with full metadata payloads

Usage:
    python scripts/embed-vectors.py
"""

import hashlib
import json
import os
import sys
import time
from pathlib import Path
from typing import List, Dict, Any

import cohere
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct


# Constants
COLLECTION_NAME = "book_vectors"
VECTOR_SIZE = 1024
BATCH_SIZE = 10
MAX_RETRIES = 3
COHERE_MODEL = "embed-english-v3.0"


def load_env() -> None:
    """Load environment variables from .env file."""
    env_path = Path(__file__).parent.parent / ".env"
    if not env_path.exists():
        print(f"Error: .env file not found at {env_path}")
        print("Please copy data/.env.example to .env and add your credentials.")
        sys.exit(1)
    load_dotenv(env_path)

    required_vars = ["COHERE_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"]
    missing = [v for v in required_vars if not os.getenv(v)]
    if missing:
        print(f"Error: Missing environment variables: {', '.join(missing)}")
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


def chunk_id_to_point_id(chunk_id: str) -> int:
    """Convert chunk_id to deterministic integer for Qdrant using MD5 hash."""
    hash_bytes = hashlib.md5(chunk_id.encode()).digest()
    return int.from_bytes(hash_bytes[:8], byteorder='big')


def init_cohere_client() -> cohere.Client:
    """Initialize and return Cohere client."""
    api_key = os.getenv("COHERE_API_KEY")
    return cohere.Client(api_key)


def init_qdrant_client() -> QdrantClient:
    """Initialize and return Qdrant client."""
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    return QdrantClient(url=url, api_key=api_key)


def embed_with_retry(
    co: cohere.Client,
    texts: List[str],
    input_type: str = "search_document"
) -> List[List[float]]:
    """Generate embeddings with exponential backoff retry."""
    for attempt in range(MAX_RETRIES):
        try:
            response = co.embed(
                texts=texts,
                model=COHERE_MODEL,
                input_type=input_type
            )
            return response.embeddings
        except cohere.errors.TooManyRequestsError:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f"  Error: {e}, retrying in {wait}s...")
                time.sleep(wait)
            else:
                raise
    return []


def batch_embed(
    co: cohere.Client,
    chunks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Process chunks in batches and generate embeddings."""
    results = []
    total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        # Warn about short chunks
        for chunk in batch:
            if len(chunk["text"]) < 10:
                print(f"  Warning: Short chunk detected: {chunk['chunk_id']} ({len(chunk['text'])} chars)")

        texts = [c["text"] for c in batch]
        embeddings = embed_with_retry(co, texts)

        for chunk, embedding in zip(batch, embeddings):
            results.append({
                "chunk": chunk,
                "embedding": embedding
            })

        print(f"  Batch {batch_num}/{total_batches}: {len(batch)} chunks embedded")

    return results


def ensure_collection(qdrant: QdrantClient) -> None:
    """Create book_vectors collection if it doesn't exist."""
    collections = qdrant.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME not in collection_names:
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )
        print(f"Collection '{COLLECTION_NAME}' created.")
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")


def build_vector_points(
    embedded_chunks: List[Dict[str, Any]]
) -> List[PointStruct]:
    """Build VectorPoint objects with payload for Qdrant."""
    points = []
    for item in embedded_chunks:
        chunk = item["chunk"]
        embedding = item["embedding"]

        point = PointStruct(
            id=chunk_id_to_point_id(chunk["chunk_id"]),
            vector=embedding,
            payload={
                "chunk_id": chunk["chunk_id"],
                "text": chunk["text"],
                "source_path": chunk["source_path"],
                "slug": chunk["slug"],
                "title": chunk["title"],
                "order_index": chunk["order_index"]
            }
        )
        points.append(point)

    return points


def upsert_vectors(qdrant: QdrantClient, points: List[PointStruct]) -> None:
    """Batch upsert vectors to Qdrant."""
    total_batches = (len(points) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(points), BATCH_SIZE):
        batch = points[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=batch
        )

        print(f"  Batch {batch_num}/{total_batches}: {len(batch)} vectors upserted")


def main() -> None:
    """Main pipeline orchestration."""
    print("=" * 50)
    print("Embeddings Generation & Vector Storage Pipeline")
    print("=" * 50)
    print()

    # Load environment
    print("Loading environment...")
    load_env()
    print()

    # Load chunks
    print("Loading chunks from data/chunks.json...")
    chunks = load_chunks()
    print(f"Found {len(chunks)} chunks to process.")
    print()

    # Initialize clients
    print("Connecting to Qdrant...")
    qdrant = init_qdrant_client()
    ensure_collection(qdrant)
    print()

    print("Initializing Cohere client...")
    co = init_cohere_client()
    print()

    # Generate embeddings
    print("Generating embeddings with Cohere...")
    embedded_chunks = batch_embed(co, chunks)
    print()

    # Build vector points
    print("Building vector points...")
    points = build_vector_points(embedded_chunks)
    print(f"Created {len(points)} vector points.")
    print()

    # Upsert to Qdrant
    print("Upserting vectors to Qdrant...")
    upsert_vectors(qdrant, points)
    print()

    # Summary
    print("=" * 50)
    print("Summary")
    print("=" * 50)
    print(f"Chunks processed: {len(chunks)}")
    print(f"Vectors stored: {len(points)}")
    print(f"Collection: {COLLECTION_NAME}")
    print("Done!")


if __name__ == "__main__":
    main()
