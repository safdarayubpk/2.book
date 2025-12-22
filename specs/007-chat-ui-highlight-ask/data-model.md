# Data Model: Chat UI + Highlight → Ask

**Feature**: 007-chat-ui-highlight-ask | **Date**: 2025-12-14

## Overview

This document defines TypeScript interfaces and state shapes for the Chat UI feature. All types are client-side only - the backend API contract is defined in `contracts/chat-api.md`.

---

## Core Types

### Chat Message

```typescript
// src/types/chat.ts

export type MessageRole = 'user' | 'assistant' | 'system';

export interface SourceCitation {
  /** Unique identifier for the chunk */
  chunkId: string;
  /** Display title of the source document */
  documentTitle: string;
  /** Section within the document */
  section: string;
  /** URL path to navigate to this section */
  url: string;
  /** Relevance score (0-1) */
  relevanceScore: number;
}

export interface ChatMessage {
  /** Unique identifier for this message */
  id: string;
  /** Who sent this message */
  role: MessageRole;
  /** Message content (may contain citation markers like [1]) */
  content: string;
  /** Timestamp when message was created */
  timestamp: number;
  /** Sources referenced in this message (assistant messages only) */
  sources?: SourceCitation[];
  /** Highlighted text context (user messages with highlight-to-ask only) */
  highlightedContext?: string;
}
```

### Conversation Session

```typescript
export interface ConversationSession {
  /** Session ID (UUID from backend) */
  sessionId: string;
  /** All messages in this conversation */
  messages: ChatMessage[];
  /** When session was created */
  createdAt: number;
  /** Last activity timestamp (for timeout) */
  lastActivity: number;
}
```

### Text Selection

```typescript
export interface TextSelection {
  /** The selected text content */
  text: string;
  /** Bounding rectangle for positioning the Ask AI button */
  rect: DOMRect;
  /** Source page URL where selection was made */
  sourceUrl: string;
}
```

---

## State Shapes

### Chat Panel State

```typescript
export interface ChatPanelState {
  /** Whether the chat panel is open */
  isOpen: boolean;
  /** Current session (null if no active session) */
  session: ConversationSession | null;
  /** Whether an API request is in progress */
  isLoading: boolean;
  /** Current error message (null if no error) */
  error: string | null;
  /** Draft message being typed */
  inputValue: string;
}
```

### Highlight State

```typescript
export interface HighlightState {
  /** Current text selection (null if nothing selected) */
  selection: TextSelection | null;
  /** Whether the Ask AI button is visible */
  isButtonVisible: boolean;
  /** Optional follow-up question for highlight-to-ask */
  followUpQuestion: string;
}
```

---

## API Request/Response Types

### Chat Request

```typescript
export interface ChatRequest {
  /** User's question or message */
  message: string;
  /** Optional session ID for multi-turn conversations */
  sessionId?: string;
  /** Optional highlighted text context */
  context?: string;
}
```

### Chat Response

```typescript
export interface ChatResponse {
  /** AI-generated response text */
  response: string;
  /** Session ID (new or existing) */
  sessionId: string;
  /** Source citations */
  sources: SourceCitation[];
  /** Tokens consumed */
  tokensUsed: number;
  /** Response generation time in ms */
  responseTimeMs: number;
}
```

### Error Response

```typescript
export interface ErrorResponse {
  /** Error details */
  detail: string | { msg: string; type: string }[];
}
```

---

## Storage Schema

### sessionStorage Key: `chat_session`

```typescript
// Stored as JSON string
interface StoredSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActivity: number;
}
```

**Storage Operations**:
```typescript
// Save session
sessionStorage.setItem('chat_session', JSON.stringify(session));

// Load session
const stored = sessionStorage.getItem('chat_session');
const session: StoredSession | null = stored ? JSON.parse(stored) : null;

// Clear session
sessionStorage.removeItem('chat_session');
```

---

## Validation Rules

### Message Content

| Field | Rule |
|-------|------|
| `message` | Required, 1-500 characters, non-empty after trim |
| `context` | Optional, max 500 characters (truncated if longer) |
| `sessionId` | Optional, valid UUID format if provided |

### Session Expiration

| Rule | Value |
|------|-------|
| Max inactivity | 30 minutes |
| Max messages | 20 (10 turns) |
| Storage cleanup | On load if expired |

---

## Type Guards

```typescript
// src/types/chat.ts

export function isUserMessage(msg: ChatMessage): boolean {
  return msg.role === 'user';
}

export function isAssistantMessage(msg: ChatMessage): boolean {
  return msg.role === 'assistant';
}

export function hasHighlightContext(msg: ChatMessage): msg is ChatMessage & { highlightedContext: string } {
  return msg.role === 'user' && typeof msg.highlightedContext === 'string';
}

export function isSessionValid(session: ConversationSession): boolean {
  const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  return Date.now() - session.lastActivity < TIMEOUT_MS;
}
```

---

## Component Props

### ChatPanel

```typescript
interface ChatPanelProps {
  /** Initial open state */
  defaultOpen?: boolean;
  /** Callback when panel opens/closes */
  onOpenChange?: (isOpen: boolean) => void;
}
```

### ChatMessage (display component)

```typescript
interface ChatMessageProps {
  /** The message to display */
  message: ChatMessage;
  /** Callback when a source citation is clicked */
  onSourceClick?: (source: SourceCitation) => void;
}
```

### HighlightAskButton

```typescript
interface HighlightAskButtonProps {
  /** Current text selection */
  selection: TextSelection;
  /** Callback when Ask AI is clicked */
  onAskClick: (selection: TextSelection) => void;
}
```

### ChatInput

```typescript
interface ChatInputProps {
  /** Current input value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when user submits */
  onSubmit: () => void;
  /** Whether input is disabled (loading state) */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}
```
