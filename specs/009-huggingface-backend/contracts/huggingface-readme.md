# HuggingFace Space README Contract

**Feature**: 009-huggingface-backend
**Purpose**: Define the README.md file required for HuggingFace Space configuration

## README.md Specification

The HuggingFace Space requires a README.md with YAML frontmatter:

```markdown
---
title: Book RAG API
emoji: 📚
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Book RAG API

RAG-powered chatbot API for the Physical AI & Humanoid Robotics textbook.

## Endpoints

- `GET /health` - Health check
- `POST /chat` - Send chat message
- `POST /search` - Semantic search
- `DELETE /chat/sessions/{id}` - End session

## Usage

This API is designed to be called from the frontend at https://2-book.vercel.app

## Environment Variables

Configure these in Space Settings → Secrets:

- `COHERE_API_KEY`
- `OPENAI_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `DATABASE_URL`
```

## YAML Frontmatter Fields

| Field | Value | Description |
|-------|-------|-------------|
| title | Book RAG API | Display name in HuggingFace |
| emoji | 📚 | Icon shown in Space listing |
| colorFrom | blue | Gradient start color |
| colorTo | purple | Gradient end color |
| sdk | docker | Required: Use Docker SDK |
| app_port | 7860 | Port exposed by container |
| pinned | false | Whether to pin to profile |

## Required Fields

Only these fields are required:
- `sdk: docker`

All others are optional but recommended for better presentation.

## Space URL Format

Once deployed, the Space will be accessible at:

```
https://{username}-{space-name}.hf.space
```

Example: `https://safdarayubpk-book-rag-api.hf.space`
