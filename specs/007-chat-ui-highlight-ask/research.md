# Research: Chat UI + Highlight → Ask

**Feature**: 007-chat-ui-highlight-ask | **Date**: 2025-12-14

## 1. Docusaurus Theme Swizzling

### Approach: Root Component Wrapper

Docusaurus supports "swizzling" - overriding theme components. For site-wide components (chat panel, highlight detection), we use the `Root` component wrapper pattern.

**Implementation**:
```bash
# Creates src/theme/Root.tsx
npx docusaurus swizzle @docusaurus/theme-classic Root --wrap
```

The `Root` wrapper wraps the entire application, making it ideal for:
- Global chat panel that persists across page navigation
- Text selection listeners that work on all doc pages
- Shared state providers (React Context)

**Reference**: [Docusaurus Swizzling Guide](https://docusaurus.io/docs/swizzling)

### Alternative Considered: Custom Plugin

A Docusaurus plugin could inject components, but:
- More complex setup
- Overkill for UI components
- Swizzling is the recommended approach for theme customization

**Decision**: Use `Root` wrapper swizzling.

---

## 2. Text Selection API

### Browser APIs

**`window.getSelection()`** - Works across all modern browsers:
```typescript
const selection = window.getSelection();
const selectedText = selection?.toString().trim();
const range = selection?.getRangeAt(0);
const rect = range?.getBoundingClientRect(); // Position for button
```

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Chrome Android |
|---------|--------|---------|--------|------|---------------|----------------|
| getSelection() | Yes | Yes | Yes | Yes | Yes | Yes |
| getRangeAt() | Yes | Yes | Yes | Yes | Yes | Yes |
| getBoundingClientRect() | Yes | Yes | Yes | Yes | Yes | Yes |

**Caveats**:
- Safari: Selection may be cleared when clicking outside
- Mobile: Touch selection triggers `selectionchange` event after user lifts finger

### Events

```typescript
// Desktop: mouse-based selection
document.addEventListener('mouseup', handleSelectionEnd);

// Mobile: touch-based selection
document.addEventListener('selectionchange', handleSelectionChange);

// Both: detect when selection is cleared
document.addEventListener('mousedown', handleSelectionStart);
```

---

## 3. Mobile Touch Selection

### Long-Press Selection Flow

1. User long-presses text (~500ms)
2. Browser shows selection handles
3. User adjusts selection
4. `selectionchange` event fires
5. Show "Ask AI" button near selection

### Implementation Considerations

- **Button Positioning**: Must not overlap with browser's native selection handles
- **Timing**: Debounce `selectionchange` to avoid flickering (300ms recommended)
- **Dismissal**: Hide button on tap outside selection area
- **Touch Target**: 44x44px minimum (Apple HIG, Google Material)

### Mobile-Specific Code

```typescript
// Detect touch device
const isTouchDevice = 'ontouchstart' in window;

// Position button above selection on mobile (below on desktop)
const buttonPosition = isTouchDevice
  ? { top: rect.top - 50 }  // Above, to avoid selection handles
  : { top: rect.bottom + 10 }; // Below
```

---

## 4. Session Storage Patterns

### Why sessionStorage?

- **Persistence**: Survives page refreshes within same tab
- **Scope**: Isolated per tab (multiple chats don't interfere)
- **Simplicity**: No backend storage needed for conversation history
- **Privacy**: Auto-cleared when tab closes

### Storage Structure

```typescript
interface StoredSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActivity: number;
}

// Key pattern
const STORAGE_KEY = 'chat_session';
```

### Expiration Handling

Per spec requirement (30-minute inactivity timeout):
```typescript
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function isSessionValid(session: StoredSession): boolean {
  return Date.now() - session.lastActivity < SESSION_TIMEOUT_MS;
}
```

### Storage Limits

- sessionStorage limit: ~5MB per origin
- Average message: ~500 bytes
- 10 turns (20 messages): ~10KB
- Ample headroom for conversation history

---

## 5. Existing Codebase Patterns

### Component Structure

Existing components follow this pattern:
```text
src/components/ComponentName/
├── index.tsx          # Main component export
├── styles.module.css  # CSS modules for scoped styles
└── [SubComponent.tsx] # Optional sub-components
```

**Example from ChapterNav**:
```typescript
// src/components/ChapterNav/index.tsx
import React from 'react';
import styles from './styles.module.css';

export default function ChapterNav({ currentChapter }): React.ReactElement {
  // ...
}
```

### CSS Patterns

- CSS Modules (`.module.css`) for scoped styling
- BEM-like naming within modules
- Custom properties from `src/css/custom.css` for theming

### Import Patterns

- `@docusaurus/Link` for internal navigation
- Absolute imports not configured (use relative)

---

## 6. Backend API Contract

### Existing Endpoint (from Spec-006)

```
POST /chat
Content-Type: application/json

{
  "message": "string (required, max 500 chars)",
  "session_id": "string (optional, UUID)",
  "context": "string (optional, highlighted text)"
}

Response:
{
  "response": "string",
  "session_id": "string",
  "sources": [
    {
      "chunk_id": "string",
      "document_title": "string",
      "section": "string",
      "url": "string",
      "relevance_score": number
    }
  ],
  "tokens_used": number,
  "response_time_ms": number
}
```

### CORS Configuration

Backend must allow requests from Vercel domain. Currently configured in `scripts/api.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will need to restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 7. Bundle Size Considerations

### Current Dependencies (from package.json)

- @docusaurus/core: 3.9.2 (already included)
- React 19.x (already included)
- No additional dependencies needed

### New Code Estimate

| Component | Estimated Size (minified) |
|-----------|---------------------------|
| ChatPanel | ~8KB |
| HighlightAsk | ~3KB |
| ChatToggle | ~1KB |
| Hooks | ~2KB |
| API Client | ~1KB |
| **Total** | **~15KB** |

This is well within acceptable limits for a Docusaurus site.

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Selection API inconsistent on Safari | Medium | Medium | Test on Safari, add fallback behavior |
| Mobile selection UX poor | Medium | High | Extensive mobile testing, position button carefully |
| Long AI responses freeze UI | Low | High | Use streaming (future), show loading state |
| Session storage full | Very Low | Low | Implement max message limit (20 messages) |
| CORS issues in production | Medium | High | Configure backend CORS properly before deployment |

---

## 9. Key Decisions

1. **Swizzle Root component** for global chat panel injection
2. **sessionStorage** for conversation persistence (no backend storage)
3. **CSS Modules** following existing codebase patterns
4. **Debounced selection** (300ms) to prevent UI flickering
5. **No new dependencies** - use built-in browser APIs and React
6. **Mobile-first button positioning** - above selection to avoid handles
