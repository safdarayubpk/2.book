# API Contract: Chat UI → Backend

**Feature**: 007-chat-ui-highlight-ask | **Date**: 2025-12-14

## Overview

This document defines the API contract between the Chat UI frontend and the RAG AI Agent backend (Spec-006). The backend is already implemented in `scripts/api.py`.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Production | `https://{railway-app}.railway.app` (configured via environment variable) |

**Frontend Configuration**:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

---

## Endpoints

### POST /chat

Send a message to the AI agent and receive a response.

**Request**:
```http
POST /chat
Content-Type: application/json

{
  "message": "What is physical AI?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "context": "Physical AI refers to artificial intelligence..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's question (1-500 characters) |
| `session_id` | string | No | UUID for multi-turn conversation |
| `context` | string | No | Highlighted text context (max 500 chars) |

**Response (200 OK)**:
```json
{
  "response": "Physical AI refers to AI systems that interact with the physical world [1]. This includes robots, autonomous vehicles, and drones [2].",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "sources": [
    {
      "chunk_id": "chunk_001",
      "document_title": "Chapter 1: Introduction to Physical AI",
      "section": "What is Physical AI?",
      "url": "/docs/chapter-1#what-is-physical-ai",
      "relevance_score": 0.92
    },
    {
      "chunk_id": "chunk_002",
      "document_title": "Chapter 1: Introduction to Physical AI",
      "section": "Types of Physical AI Systems",
      "url": "/docs/chapter-1#types-of-physical-ai-systems",
      "relevance_score": 0.87
    }
  ],
  "tokens_used": 245,
  "response_time_ms": 1523
}
```

| Field | Type | Description |
|-------|------|-------------|
| `response` | string | AI-generated response with inline citations [1][2] |
| `session_id` | string | Session UUID (new if not provided in request) |
| `sources` | array | Source citations used in response |
| `tokens_used` | number | Total tokens consumed (prompt + completion) |
| `response_time_ms` | number | Time to generate response in milliseconds |

**Source Object**:
| Field | Type | Description |
|-------|------|-------------|
| `chunk_id` | string | Unique identifier for content chunk |
| `document_title` | string | Display title of source document |
| `section` | string | Section heading within document |
| `url` | string | Path to navigate to source |
| `relevance_score` | number | Similarity score (0-1) |

---

### Error Responses

**400 Bad Request** - Validation Error:
```json
{
  "detail": [
    {
      "loc": ["body", "message"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

**422 Unprocessable Entity** - Invalid JSON:
```json
{
  "detail": "Invalid JSON body"
}
```

**500 Internal Server Error** - Backend Error:
```json
{
  "detail": "An error occurred while processing your request"
}
```

**503 Service Unavailable** - AI Service Down:
```json
{
  "detail": "AI service is temporarily unavailable. Please try again later."
}
```

---

### DELETE /chat/sessions/{session_id}

Clear a conversation session.

**Request**:
```http
DELETE /chat/sessions/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK)**:
```json
{
  "message": "Session cleared",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (404 Not Found)**:
```json
{
  "detail": "Session not found"
}
```

---

### GET /health

Check backend health status.

**Request**:
```http
GET /health
```

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "qdrant": true,
    "postgres": true,
    "cohere": true,
    "openai": true
  }
}
```

---

## CORS Configuration

The backend must allow requests from the frontend domain:

```python
# scripts/api.py - Current configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict to Vercel domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production Recommendation**:
```python
allow_origins=[
    "http://localhost:3000",          # Development
    "https://physical-ai-textbook.vercel.app",  # Production
]
```

---

## Rate Limiting

| Constraint | Value |
|------------|-------|
| Requests per minute | 60 |
| Max message length | 500 characters |
| Max context length | 500 characters |
| Session timeout | 30 minutes |

---

## Frontend API Client

```typescript
// src/services/chatApi.ts

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  sources: SourceCitation[];
  tokens_used: number;
  response_time_ms: number;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send message');
  }

  return response.json();
}

export async function clearSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to clear session');
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## Sequence Diagrams

### Basic Chat Flow

```
User          ChatPanel        chatApi         Backend
  |               |               |               |
  |--type msg---->|               |               |
  |               |--sendChat---->|               |
  |               |               |--POST /chat-->|
  |               |               |<--response----|
  |               |<--ChatResponse|               |
  |<--display-----|               |               |
```

### Highlight-to-Ask Flow

```
User          HighlightAsk    ChatPanel      chatApi         Backend
  |               |               |              |               |
  |--select text->|               |              |               |
  |               |--show button--|              |               |
  |--click Ask--->|               |              |               |
  |               |--open panel-->|              |               |
  |               |--pass context>|              |               |
  |               |               |--sendChat--->|               |
  |               |               |  (w/context) |--POST /chat-->|
  |               |               |              |<--response----|
  |               |               |<--response---|               |
  |<--display-----|---------------|              |               |
```
