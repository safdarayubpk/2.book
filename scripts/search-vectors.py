#!/usr/bin/env python3
"""
Semantic Search Verification Script for RAG Pipeline

This script provides semantic search functionality to verify the vector database.

Usage:
    python scripts/search-vectors.py "your search query"
    python scripts/search-vectors.py --count
    python scripts/search-vectors.py --inspect doc-001-0001
"""

import argparse
import hashlib
import os
import sys
from pathlib import Path
from typing import List, Optional

import cohere
from dotenv import load_dotenv
from qdrant_client import QdrantClient


# Constants
COLLECTION_NAME = "book_vectors"
COHERE_MODEL = "embed-english-v3.0"
DEFAULT_TOP_K = 3


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


def init_cohere_client() -> cohere.Client:
    """Initialize and return Cohere client."""
    api_key = os.getenv("COHERE_API_KEY")
    return cohere.Client(api_key)


def init_qdrant_client() -> QdrantClient:
    """Initialize and return Qdrant client."""
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    return QdrantClient(url=url, api_key=api_key)


def chunk_id_to_point_id(chunk_id: str) -> int:
    """Convert chunk_id to deterministic integer for Qdrant using MD5 hash."""
    hash_bytes = hashlib.md5(chunk_id.encode()).digest()
    return int.from_bytes(hash_bytes[:8], byteorder='big')


def embed_query(co: cohere.Client, query: str) -> List[float]:
    """Generate embedding for search query."""
    response = co.embed(
        texts=[query],
        model=COHERE_MODEL,
        input_type="search_query"
    )
    return response.embeddings[0]


def search(
    qdrant: QdrantClient,
    query_vector: List[float],
    top_k: int = DEFAULT_TOP_K
) -> List[dict]:
    """Perform semantic similarity search."""
    results = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_payload=True
    )
    return results.points


def display_results(results: List, query: str) -> None:
    """Format and print search results."""
    print(f'Query: "{query}"')
    print(f"Top {len(results)} results:")
    print()

    for i, result in enumerate(results, 1):
        score = result.score
        payload = result.payload
        title = payload.get("title", "Unknown")
        source = payload.get("source_path", "Unknown")
        text = payload.get("text", "")

        # Truncate text for display
        max_len = 100
        display_text = text[:max_len] + "..." if len(text) > max_len else text

        print(f"{i}. [Score: {score:.4f}] {title}")
        print(f"   Source: {source}")
        print(f'   Text: "{display_text}"')
        print()


def show_count(qdrant: QdrantClient) -> None:
    """Display vector count in collection."""
    try:
        info = qdrant.get_collection(COLLECTION_NAME)
        count = info.points_count
        print(f"Collection: {COLLECTION_NAME}")
        print(f"Vector count: {count}")
    except Exception as e:
        print(f"Error getting collection info: {e}")
        sys.exit(1)


def inspect_chunk(qdrant: QdrantClient, chunk_id: str) -> None:
    """Show full payload for a specific chunk_id."""
    point_id = chunk_id_to_point_id(chunk_id)

    try:
        results = qdrant.retrieve(
            collection_name=COLLECTION_NAME,
            ids=[point_id],
            with_payload=True
        )

        if not results:
            print(f"Chunk not found: {chunk_id}")
            return

        point = results[0]
        print(f"Vector ID: {point.id}")
        print("Payload:")

        payload = point.payload
        for key, value in payload.items():
            if key == "text":
                # Truncate long text
                display_val = value[:200] + "..." if len(value) > 200 else value
                print(f'  {key}: "{display_val}"')
            else:
                print(f"  {key}: {value}")

    except Exception as e:
        print(f"Error inspecting chunk: {e}")
        sys.exit(1)


def main() -> None:
    """Main entry point with argument parsing."""
    parser = argparse.ArgumentParser(
        description="Semantic search for RAG vector database"
    )
    parser.add_argument(
        "query",
        nargs="?",
        help="Search query text"
    )
    parser.add_argument(
        "--count",
        action="store_true",
        help="Display vector count in collection"
    )
    parser.add_argument(
        "--inspect",
        metavar="CHUNK_ID",
        help="Show full payload for a specific chunk_id"
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=DEFAULT_TOP_K,
        help=f"Number of results to return (default: {DEFAULT_TOP_K})"
    )

    args = parser.parse_args()

    # Load environment
    load_env()

    # Initialize clients
    qdrant = init_qdrant_client()

    if args.count:
        show_count(qdrant)
        return

    if args.inspect:
        inspect_chunk(qdrant, args.inspect)
        return

    if not args.query:
        parser.print_help()
        sys.exit(1)

    # Perform search
    co = init_cohere_client()
    query_vector = embed_query(co, args.query)
    results = search(qdrant, query_vector, top_k=args.top_k)
    display_results(results, args.query)


if __name__ == "__main__":
    main()
