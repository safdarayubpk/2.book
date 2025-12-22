# Quickstart: Chat UI + Highlight → Ask

**Feature**: 007-chat-ui-highlight-ask | **Date**: 2025-12-14

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Backend API running (Spec-006)

---

## 1. Development Setup

### Start Backend (Terminal 1)

```bash
cd /home/safdarayub/Desktop/claude/2.book

# Start the RAG AI Agent API
python -m uvicorn scripts.api:app --host 0.0.0.0 --port 8000 --reload
```

Verify backend is running:
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","services":{"qdrant":true,"postgres":true,"cohere":true,"openai":true}}
```

### Start Frontend (Terminal 2)

```bash
cd /home/safdarayub/Desktop/claude/2.book

# Install dependencies (if needed)
npm install

# Start Docusaurus dev server
npm start
```

Frontend runs at: http://localhost:3000

---

## 2. Swizzle Root Component

Create the Root wrapper for global component injection:

```bash
npx docusaurus swizzle @docusaurus/theme-classic Root --wrap --typescript
```

This creates `src/theme/Root.tsx`.

---

## 3. Create Type Definitions

Create `src/types/chat.ts`:
```typescript
export type MessageRole = 'user' | 'assistant' | 'system';

export interface SourceCitation {
  chunkId: string;
  documentTitle: string;
  section: string;
  url: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  sources?: SourceCitation[];
  highlightedContext?: string;
}

export interface ConversationSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActivity: number;
}
```

---

## 4. Create API Client

Create `src/services/chatApi.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  sources: Array<{
    chunk_id: string;
    document_title: string;
    section: string;
    url: string;
    relevance_score: number;
  }>;
  tokens_used: number;
  response_time_ms: number;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}
```

---

## 5. Verification Steps

### Step 1: Verify Backend Connection

Open browser console on http://localhost:3000 and run:
```javascript
fetch('http://localhost:8000/health').then(r => r.json()).then(console.log)
```

Expected output:
```json
{"status":"healthy","services":{"qdrant":true,"postgres":true,"cohere":true,"openai":true}}
```

### Step 2: Verify Chat API

```javascript
fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'What is physical AI?' })
}).then(r => r.json()).then(console.log)
```

Expected: Response with `response`, `session_id`, `sources` fields.

### Step 3: Verify Root Component

After swizzling, check that `src/theme/Root.tsx` exists and wraps children:
```typescript
// src/theme/Root.tsx
import React from 'react';

export default function Root({children}) {
  return <>{children}</>;
}
```

### Step 4: Verify CSS Modules

Create a test component to ensure CSS modules work:
```typescript
// src/components/Test/index.tsx
import React from 'react';
import styles from './styles.module.css';

export default function Test() {
  return <div className={styles.test}>CSS Modules working!</div>;
}
```

```css
/* src/components/Test/styles.module.css */
.test {
  color: green;
  font-weight: bold;
}
```

---

## 6. Directory Structure (After Setup)

```text
src/
├── components/
│   ├── ChapterNav/          # (existing)
│   ├── ProgressIndicator/   # (existing)
│   └── Test/                # (verification)
├── css/
│   └── custom.css           # (existing)
├── pages/
│   └── index.tsx            # (existing)
├── services/
│   └── chatApi.ts           # (new)
├── types/
│   └── chat.ts              # (new)
└── theme/
    └── Root.tsx             # (new - swizzled)
```

---

## 7. Common Issues

### CORS Error

**Symptom**: `Access-Control-Allow-Origin` error in console

**Fix**: Ensure backend CORS is configured:
```python
# scripts/api.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specific origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Backend Not Running

**Symptom**: `fetch failed` or `ECONNREFUSED`

**Fix**: Start the backend server:
```bash
python -m uvicorn scripts.api:app --host 0.0.0.0 --port 8000
```

### Port Already in Use

**Symptom**: `Address already in use`

**Fix**:
```bash
# Kill process on port 8000
fuser -k 8000/tcp

# Or find and kill
lsof -ti:8000 | xargs kill -9
```

### TypeScript Errors

**Symptom**: Type errors after creating new files

**Fix**: Run type check to identify issues:
```bash
npm run typecheck
```

---

## 8. Next Steps

After completing quickstart verification:

1. Run `/speckit.tasks` to generate implementation tasks
2. Implement components in dependency order:
   - Types → API Client → Hooks → Components → Integration
3. Test each component in isolation before integration
4. Run full E2E test: select text → Ask AI → receive response
