#!/usr/bin/env python3
"""
Personalization Utilities for Content Adaptation

This module provides functions for personalizing chapter content based on
user profiles using OpenAI's GPT model and Qdrant vector database.

Usage:
    from scripts.personalization_utils import personalize_chapter_content
"""

import logging
import time
from typing import List, Optional, Dict, Any

from openai import OpenAI
from qdrant_client import QdrantClient

# Configure logging
logger = logging.getLogger(__name__)

# Constants
COLLECTION_NAME = "book_vectors"
OPENAI_MODEL = "gpt-4o-mini"
MAX_CONTENT_TOKENS = 6000  # Leave room for prompt and response

# Valid chapter slugs
VALID_CHAPTER_SLUGS = [
    "intro",
    "chapter-1",
    "chapter-2",
    "chapter-3",
    "chapter-4",
    "chapter-5",
    "chapter-6",
]

# Personalization prompt template
PERSONALIZATION_PROMPT = """You are an expert educational content adapter. Your task is to rewrite the following textbook chapter content to be more accessible and relevant for a specific reader.

Reader Profile:
- Programming Experience: {programming_level}
- Hardware/Robotics Background: {hardware_background}
- Learning Goals: {learning_goals}

Adaptation Guidelines based on Programming Level:
- Beginner: Use simpler language, more analogies from everyday life, explain all technical terms, add more context and examples
- Intermediate: Balance technical details with clear explanations, assume basic programming knowledge
- Advanced: Include deeper technical insights, assume strong programming background, focus on advanced concepts and optimizations

Adaptation Guidelines based on Hardware Background:
- None: Explain hardware concepts from scratch, use software analogies where possible
- Hobbyist: Assume familiarity with basic electronics and Arduino/Raspberry Pi level projects
- Professional: Assume deep hardware knowledge, focus on advanced integration and optimization

Adaptation Guidelines based on Learning Goals:
- Career Transition: Emphasize practical skills and industry relevance
- Academic: Focus on theoretical foundations and research directions
- Personal: Make content engaging and relatable to personal projects
- Upskilling: Highlight how concepts build on existing knowledge

IMPORTANT RULES:
1. Maintain the same overall structure and section headings
2. Keep the same key concepts and information - do not add or remove topics
3. Adapt the EXPLANATIONS and EXAMPLES, not the core content
4. Use markdown formatting for headings, code blocks, and emphasis
5. Keep the adapted content approximately the same length as the original
6. Make the content feel personalized but professional

Original Chapter Content:
{chapter_content}

Please rewrite this chapter content adapted for the reader's profile. Output ONLY the adapted content in markdown format, no preamble or explanation."""


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
        # Search for chunks matching this chapter's slug
        # Use scroll to get all chunks for the chapter
        results, _ = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter={
                "must": [
                    {"key": "slug", "match": {"value": chapter_slug}}
                ]
            },
            limit=100,  # Should be enough for any chapter
            with_payload=True
        )

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


def build_profile_summary(
    programming_level: str,
    hardware_background: str,
    learning_goals: List[str]
) -> str:
    """
    Build a human-readable summary of the personalization profile.

    Args:
        programming_level: User's programming experience level
        hardware_background: User's hardware/robotics experience
        learning_goals: List of user's learning objectives

    Returns:
        Human-readable profile summary string
    """
    level_descriptions = {
        "beginner": "beginner programmers",
        "intermediate": "intermediate programmers",
        "advanced": "advanced programmers"
    }

    hardware_descriptions = {
        "none": "no hardware background",
        "hobbyist": "hobbyist hardware experience",
        "professional": "professional hardware background"
    }

    goal_descriptions = {
        "career_transition": "career transition",
        "academic": "academic study",
        "personal": "personal learning",
        "upskilling": "professional upskilling"
    }

    level_desc = level_descriptions.get(programming_level, programming_level)
    hardware_desc = hardware_descriptions.get(hardware_background, hardware_background)
    goals_desc = ", ".join([goal_descriptions.get(g, g) for g in learning_goals])

    return f"Adapted for {level_desc} with {hardware_desc}, focused on {goals_desc}"


def personalize_chapter_content(
    openai_client: OpenAI,
    qdrant_client: QdrantClient,
    chapter_slug: str,
    programming_level: str,
    hardware_background: str,
    learning_goals: List[str]
) -> Dict[str, Any]:
    """
    Personalize chapter content based on user profile.

    Args:
        openai_client: Initialized OpenAI client
        qdrant_client: Initialized Qdrant client
        chapter_slug: Chapter identifier
        programming_level: User's programming level (beginner/intermediate/advanced)
        hardware_background: User's hardware background (none/hobbyist/professional)
        learning_goals: List of user's learning goals

    Returns:
        Dict with personalized_content, original_title, metadata

    Raises:
        ValueError: If chapter slug is invalid or content not found
        RuntimeError: If OpenAI call fails
    """
    start_time = time.time()

    # Validate chapter slug
    if chapter_slug not in VALID_CHAPTER_SLUGS:
        raise ValueError(f"Invalid chapter_slug: must be one of {', '.join(VALID_CHAPTER_SLUGS)}")

    # Fetch chapter content from Qdrant
    chapter_data = get_chapter_content_from_qdrant(qdrant_client, chapter_slug)
    if not chapter_data:
        raise ValueError(f"Chapter content not found for slug: {chapter_slug}")

    original_title = chapter_data["title"]
    chapter_content = chapter_data["content"]

    # Truncate content if too long (rough estimate: 4 chars per token)
    max_chars = MAX_CONTENT_TOKENS * 4
    if len(chapter_content) > max_chars:
        logger.warning(f"Chapter content truncated from {len(chapter_content)} to {max_chars} chars")
        chapter_content = chapter_content[:max_chars] + "\n\n[Content truncated for processing...]"

    # Format learning goals for prompt
    goals_formatted = ", ".join(learning_goals)

    # Build the personalization prompt
    prompt = PERSONALIZATION_PROMPT.format(
        programming_level=programming_level,
        hardware_background=hardware_background,
        learning_goals=goals_formatted,
        chapter_content=chapter_content
    )

    # Call OpenAI for personalization
    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )

        personalized_content = response.choices[0].message.content
        tokens_used = response.usage.total_tokens if response.usage else 0

    except Exception as e:
        logger.error(f"OpenAI personalization failed: {e}")
        raise RuntimeError(f"Unable to personalize content: {str(e)}")

    # Calculate processing time
    processing_time_ms = int((time.time() - start_time) * 1000)

    # Build profile summary
    profile_summary = build_profile_summary(
        programming_level,
        hardware_background,
        learning_goals
    )

    logger.info(f"Personalization complete: {processing_time_ms}ms, {tokens_used} tokens")

    return {
        "chapter_slug": chapter_slug,
        "original_title": original_title,
        "personalized_content": personalized_content,
        "metadata": {
            "processing_time_ms": processing_time_ms,
            "tokens_used": tokens_used,
            "profile_summary": profile_summary
        }
    }
