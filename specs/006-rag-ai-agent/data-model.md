# Data Model: RAG AI Agent

**Feature**: 006-rag-ai-agent
**Date**: 2025-12-14

## Entities

### ChatRequest

Request body for the chat endpoint.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| message | string | Yes | 1-500 chars | User's natural language query |
| session_id | string | No | UUID format | Session identifier for multi-turn; auto-generated if omitted |

### ChatResponse

Response body from the chat endpoint.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| session_id | string | Yes | Session identifier for follow-up queries |
| message | string | Yes | Agent's generated response with inline citations |
| sources | Source[] | Yes | List of sources used in the response |
| metadata | ResponseMetadata | Yes | Processing metadata |

### Source

A single source reference from the knowledge base.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chunk_id | string | Yes | Unique chunk identifier from RAG |
| title | string | No | Document title (if available) |
| slug | string | Yes | URL-friendly identifier for navigation |
| score | float | Yes | Relevance score (0-1) |

### ResponseMetadata

Processing information for debugging and monitoring.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| response_time_ms | integer | Yes | Total processing time in milliseconds |
| tokens_used | integer | No | LLM tokens consumed (if available) |
| context_chunks | integer | Yes | Number of RAG chunks used |

### ConversationTurn

A single exchange in a conversation (internal model).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | Yes | "user" or "assistant" |
| content | string | Yes | Message content |
| timestamp | datetime | Yes | When the turn occurred |

### Session

In-memory session state (internal model).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| session_id | string | Yes | Unique session identifier |
| turns | ConversationTurn[] | Yes | Ordered list of conversation turns |
| created_at | datetime | Yes | Session creation time |
| last_activity | datetime | Yes | Last interaction time |

## State Transitions

### Session Lifecycle

```
[New Request without session_id]
        |
        v
   +--------+
   | ACTIVE |<----+
   +--------+     |
        |         |
        v         |
 [Request with session_id]
        |
        v
   +--------+
   | ACTIVE |
   +--------+
        |
        | (30 min timeout or 10 turns reached)
        v
   +---------+
   | EXPIRED |
   +---------+
        |
        v
   [Garbage Collected]
```

### Request Processing Flow

```
[ChatRequest received]
        |
        v
+------------------+
| Validate request |
+------------------+
        |
        v
+------------------+
| Get/create       |
| session          |
+------------------+
        |
        v
+------------------+
| Call RAG search  |
| (POST /search)   |
+------------------+
        |
        v
+------------------+
| Build LLM prompt |
| with context     |
+------------------+
        |
        v
+------------------+
| Generate response|
| via OpenAI       |
+------------------+
        |
        v
+------------------+
| Update session   |
| memory           |
+------------------+
        |
        v
+------------------+
| Return response  |
| with sources     |
+------------------+
```

## Validation Rules

### ChatRequest Validation

- `message`: Required, 1-500 characters, non-empty after trimming
- `session_id`: Optional, must be valid UUID v4 if provided

### Session Validation

- Maximum 10 turns per session (sliding window)
- Session expires after 30 minutes of inactivity
- New session created if expired session_id provided

### Rate Limiting (Future Enhancement)

- Maximum 10 requests per minute per session
- Maximum 100 requests per hour per IP (if exposed publicly)

## Relationships

```
ChatRequest
    |
    +---> Session (1:1, via session_id)
              |
              +---> ConversationTurn (1:N, ordered by timestamp)

ChatResponse
    |
    +---> Source (1:N, from RAG results)
    |
    +---> ResponseMetadata (1:1)
```

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MAX_MESSAGE_LENGTH | 500 | Maximum characters in user message |
| MAX_TURNS | 10 | Maximum turns in sliding window |
| SESSION_TIMEOUT_MINUTES | 30 | Session expiration time |
| DEFAULT_TOP_K | 5 | Number of RAG results to retrieve |
| MAX_CONTEXT_TOKENS | 4000 | Maximum tokens for context window |
