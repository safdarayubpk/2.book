# Data Model: HuggingFace Backend Deployment

**Feature**: 009-huggingface-backend
**Date**: 2025-12-22

## Overview

This feature is primarily a deployment/configuration change. No new data entities are introduced. This document describes the configuration entities involved.

## Configuration Entities

### 1. HuggingFace Space Configuration

**Location**: `README.md` (YAML frontmatter for HuggingFace)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Display name of the Space |
| emoji | string | No | Emoji icon for the Space |
| colorFrom | string | No | Gradient start color |
| colorTo | string | No | Gradient end color |
| sdk | string | Yes | Must be "docker" |
| app_port | integer | No | Port to expose (default: 7860) |
| pinned | boolean | No | Pin to profile |

**Example**:
```yaml
---
title: Book RAG API
emoji: 📚
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---
```

---

### 2. Docker Configuration

**Location**: `Dockerfile`

| Component | Value | Description |
|-----------|-------|-------------|
| Base Image | python:3.11-slim | Python runtime |
| User ID | 1000 | HuggingFace required user |
| Working Dir | /home/user/app | Application directory |
| Exposed Port | 7860 | API port |
| Entry Command | uvicorn scripts.api:app | FastAPI startup |

---

### 3. Environment Secrets

**Location**: HuggingFace Space Settings → Secrets

| Secret Name | Format | Description |
|-------------|--------|-------------|
| COHERE_API_KEY | string | Cohere API key for embeddings |
| OPENAI_API_KEY | string | OpenAI API key for chat |
| QDRANT_URL | URL | Qdrant Cloud instance URL |
| QDRANT_API_KEY | string | Qdrant Cloud API key |
| DATABASE_URL | postgres:// | Neon PostgreSQL connection string |

**Validation Rules**:
- All secrets are required for startup
- Missing secrets cause startup failure with error log
- Secrets are never logged or exposed

---

### 4. CORS Configuration

**Location**: `scripts/api.py` → CORSMiddleware

| Field | Type | Value |
|-------|------|-------|
| allow_origins | list[string] | localhost + Vercel domains |
| allow_credentials | boolean | true |
| allow_methods | list[string] | GET, POST, DELETE, OPTIONS |
| allow_headers | list[string] | * (all) |

**Allowed Origins**:
```python
[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://2-book.vercel.app",
    "https://*.vercel.app"  # Preview deployments
]
```

---

### 5. Frontend API Configuration

**Location**: `src/services/chatApi.ts`

| Field | Type | Current | New |
|-------|------|---------|-----|
| API_BASE_URL | string | http://localhost:8000 | https://{username}-{space}.hf.space |

---

## Data Flow

```
┌─────────────────┐                    ┌─────────────────────────┐
│ Vercel Frontend │                    │ HuggingFace Space       │
│ (Docusaurus)    │                    │ (Docker Container)      │
│                 │                    │                         │
│ chatApi.ts      │───── HTTPS ──────►│ scripts/api.py          │
│ API_BASE_URL    │     /chat         │ FastAPI + CORS          │
│                 │◄──── JSON ────────│                         │
└─────────────────┘                    └───────────┬─────────────┘
                                                   │
                                       ┌───────────┼───────────┐
                                       ▼           ▼           ▼
                                 ┌─────────┐ ┌─────────┐ ┌─────────┐
                                 │ Qdrant  │ │ Neon    │ │ OpenAI  │
                                 │ Cloud   │ │ Postgres│ │ API     │
                                 │(vectors)│ │(metadata│ │(chat)   │
                                 └─────────┘ └─────────┘ └─────────┘
```

## State Management

| State Type | Storage | Persistence |
|------------|---------|-------------|
| Chat Sessions | In-memory (api.py) | Lost on container restart |
| Vector Data | Qdrant Cloud | Persistent |
| Metadata | Neon PostgreSQL | Persistent |
| User Data | None | N/A |

**Note**: Chat sessions are stored in-memory and will be lost when the HuggingFace Space restarts or sleeps. This is acceptable for the current use case.
