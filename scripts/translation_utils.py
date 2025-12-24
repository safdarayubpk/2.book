#!/usr/bin/env python3
"""
Translation Utilities for Urdu Translation

This module provides functions for translating chapter content from English
to Urdu using OpenAI's GPT model and Qdrant vector database.

Feature: 013-urdu-translation

Usage:
    from scripts.translation_utils import translate_chapter_content
"""

import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional

from openai import OpenAI
from qdrant_client import QdrantClient

# Configure logging
logger = logging.getLogger(__name__)

# Constants
COLLECTION_NAME = "book_vectors"
OPENAI_MODEL = "gpt-4o-mini"
MAX_CONTENT_TOKENS = 6000  # Leave room for prompt and response

# Valid chapter slugs (same as personalization)
VALID_CHAPTER_SLUGS = [
    "intro",
    "chapter-1",
    "chapter-2",
    "chapter-3",
    "chapter-4",
    "chapter-5",
    "chapter-6",
]

# Translation prompt template
TRANSLATION_PROMPT = """You are an expert English to Urdu translator specializing in technical and educational content.

Translate the following textbook chapter content from English to Urdu.

IMPORTANT TRANSLATION RULES:
1. Keep all code blocks (```) exactly as-is in English - do NOT translate code
2. Keep technical terms like "AI", "API", "robot", "sensor", "GPU", "CPU", "Python", "JavaScript" in English
3. Preserve all markdown formatting (headings #, ##, ###, lists -, *, code blocks, bold **, italic *)
4. Use proper Urdu grammar and natural phrasing
5. Translate explanatory text, descriptions, and educational content to Urdu
6. Keep variable names, function names, and code examples in English
7. Keep URLs and file paths in English
8. Use Nastaliq script conventions for proper Urdu rendering

The output should be readable, educational Urdu text that maintains the technical accuracy of the original.

Original English Content:
{chapter_content}

Provide ONLY the Urdu translation in markdown format, no preamble or explanation."""

# Title translation prompt
TITLE_TRANSLATION_PROMPT = """Translate this English chapter title to Urdu. Keep technical terms in English if commonly used that way in Urdu technical education.

English: {title}

Urdu translation (just the translated title, no explanation):"""


def get_chapter_content_from_qdrant(
    qdrant_client: QdrantClient,
    chapter_slug: str
) -> Optional[Dict[str, Any]]:
    """
    Fetch chapter content from Qdrant by filtering on slug.

    Retrieves all chunks for a chapter and combines them into full content.

    Args:
        qdrant_client: Initialized Qdrant client
        chapter_slug: Chapter identifier (e.g., "chapter-1", "intro")

    Returns:
        Dict with 'title', 'content', and 'chunk_count' or None if not found
    """
    if chapter_slug not in VALID_CHAPTER_SLUGS:
        logger.warning(f"Invalid chapter slug: {chapter_slug}")
        return None

    try:
        # Build source_path pattern based on chapter_slug
        if chapter_slug == "intro":
            source_path_prefix = "docs/intro"
        else:
            source_path_prefix = f"docs/{chapter_slug}/"

        # Scroll through all chunks and filter by source_path prefix
        all_results = []
        offset = None

        while True:
            results, offset = qdrant_client.scroll(
                collection_name=COLLECTION_NAME,
                limit=100,
                offset=offset,
                with_payload=True
            )

            if not results:
                break

            # Filter for chunks matching this chapter
            for point in results:
                source_path = point.payload.get("source_path", "")
                if source_path.startswith(source_path_prefix):
                    all_results.append(point)

            if offset is None:
                break

        results = all_results

        if not results:
            logger.warning(f"No content found for chapter: {chapter_slug}")
            return None

        # Sort chunks by chunk_id to maintain order
        sorted_chunks = sorted(
            results,
            key=lambda x: x.payload.get("chunk_id", "")
        )

        # Extract title from first chunk
        title = sorted_chunks[0].payload.get("title", f"Chapter: {chapter_slug}")

        # Combine all chunk texts
        content_parts = []
        for chunk in sorted_chunks:
            text = chunk.payload.get("text", "")
            if text:
                content_parts.append(text)

        combined_content = "\n\n".join(content_parts)

        logger.info(f"Retrieved {len(sorted_chunks)} chunks for chapter '{chapter_slug}'")

        return {
            "title": title,
            "content": combined_content,
            "chunk_count": len(sorted_chunks)
        }

    except Exception as e:
        logger.error(f"Error fetching chapter content: {e}")
        return None


def translate_title(openai_client: OpenAI, title: str) -> str:
    """
    Translate chapter title to Urdu.

    Args:
        openai_client: Initialized OpenAI client
        title: English chapter title

    Returns:
        Urdu translated title
    """
    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "user", "content": TITLE_TRANSLATION_PROMPT.format(title=title)}
            ],
            temperature=0.3,
            max_tokens=200
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Title translation failed: {e}")
        # Return original title if translation fails
        return title


def translate_chapter_content(
    openai_client: OpenAI,
    qdrant_client: QdrantClient,
    chapter_id: str,
    user_id: str
) -> Dict[str, Any]:
    """
    Translate chapter content from English to Urdu.

    Args:
        openai_client: Initialized OpenAI client
        qdrant_client: Initialized Qdrant client
        chapter_id: Chapter identifier
        user_id: User ID (for logging/future caching)

    Returns:
        Dict with translated content, titles, and metadata

    Raises:
        ValueError: If chapter ID is invalid or content not found
        RuntimeError: If OpenAI call fails
    """
    start_time = time.time()

    # Validate chapter ID
    if chapter_id not in VALID_CHAPTER_SLUGS:
        raise ValueError(f"Invalid chapter_id: must be one of {', '.join(VALID_CHAPTER_SLUGS)}")

    # Fetch chapter content from Qdrant
    chapter_data = get_chapter_content_from_qdrant(qdrant_client, chapter_id)
    if not chapter_data:
        raise ValueError(f"Chapter content not found for id: {chapter_id}")

    original_title = chapter_data["title"]
    chapter_content = chapter_data["content"]

    logger.info(f"Translating chapter '{chapter_id}' for user '{user_id}'")

    # Truncate content if too long (rough estimate: 4 chars per token)
    max_chars = MAX_CONTENT_TOKENS * 4
    if len(chapter_content) > max_chars:
        logger.warning(f"Chapter content truncated from {len(chapter_content)} to {max_chars} chars")
        chapter_content = chapter_content[:max_chars] + "\n\n[مواد کو پروسیسنگ کے لیے مختصر کیا گیا...]"

    # Translate title
    translated_title = translate_title(openai_client, original_title)

    # Build the translation prompt
    prompt = TRANSLATION_PROMPT.format(chapter_content=chapter_content)

    # Call OpenAI for translation
    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent translations
            max_tokens=4000
        )

        translated_content = response.choices[0].message.content
        tokens_used = response.usage.total_tokens if response.usage else 0

    except Exception as e:
        logger.error(f"OpenAI translation failed: {e}")
        raise RuntimeError(f"Unable to translate content: {str(e)}")

    # Calculate processing time
    processing_time_ms = int((time.time() - start_time) * 1000)

    logger.info(f"Translation complete: {processing_time_ms}ms, {tokens_used} tokens")

    return {
        "chapter_id": chapter_id,
        "original_title": original_title,
        "translated_title": translated_title,
        "translated_content": translated_content,
        "source_language": "en",
        "target_language": "ur",
        "translated_at": datetime.utcnow().isoformat() + "Z",
        "metadata": {
            "processing_time_ms": processing_time_ms,
            "tokens_used": tokens_used,
            "user_id": user_id
        }
    }
