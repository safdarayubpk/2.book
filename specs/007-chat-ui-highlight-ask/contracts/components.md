# Component Contracts: Chat UI + Highlight → Ask

**Feature**: 007-chat-ui-highlight-ask | **Date**: 2025-12-14

## Overview

This document defines the interface contracts between React components in the Chat UI feature.

---

## Component Hierarchy

```
Root (theme/Root.tsx)
├── ChatProvider (context)
│   ├── ChatPanel
│   │   ├── ChatHeader
│   │   ├── ChatMessages
│   │   │   └── ChatMessage (×n)
│   │   │       └── SourcesList
│   │   └── ChatInput
│   ├── ChatToggle
│   └── HighlightAsk
│       └── HighlightButton
└── {children} (Docusaurus content)
```

---

## Context Provider

### ChatContext

```typescript
// src/context/ChatContext.tsx

interface ChatContextValue {
  // State
  isOpen: boolean;
  session: ConversationSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  sendMessage: (message: string, context?: string) => Promise<void>;
  clearSession: () => void;
}

// Usage
const { isOpen, sendMessage } = useChatContext();
```

**Contract**:
- `openPanel`: Opens the chat panel
- `closePanel`: Closes the panel without clearing session
- `togglePanel`: Toggles open/closed state
- `sendMessage`: Sends message, handles loading/error states
- `clearSession`: Clears session from storage and backend

---

## Components

### ChatPanel

**Props**:
```typescript
interface ChatPanelProps {
  // No external props - uses ChatContext
}
```

**Behavior**:
- Renders as a slide-in drawer from the right
- Shows/hides based on `isOpen` from context
- Preserves scroll position when minimized
- Traps focus when open (accessibility)

**CSS Contract**:
```css
.chatPanel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  max-width: 100vw; /* Mobile: full width */
  z-index: 1000;
}
```

---

### ChatMessage

**Props**:
```typescript
interface ChatMessageProps {
  message: ChatMessage;
  onSourceClick?: (source: SourceCitation) => void;
}
```

**Behavior**:
- Renders user messages aligned right, assistant left
- Parses citation markers [1][2] and makes them clickable
- Displays highlighted context if present (user messages)
- Shows timestamp on hover

**Rendering Contract**:
```typescript
// Citation parsing
const parseCitations = (content: string, sources: SourceCitation[]): ReactNode => {
  // Convert [1] to clickable links
  // Match citation number to sources array index
};
```

---

### ChatInput

**Props**:
```typescript
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number; // default: 500
}
```

**Behavior**:
- Submit on Enter (Shift+Enter for newline)
- Disabled state during loading
- Character counter near limit
- Auto-resize textarea (max 4 lines)

**Accessibility**:
```typescript
<textarea
  aria-label="Type your message"
  aria-describedby="char-counter"
  disabled={disabled}
/>
```

---

### SourcesList

**Props**:
```typescript
interface SourcesListProps {
  sources: SourceCitation[];
  onSourceClick: (source: SourceCitation) => void;
}
```

**Behavior**:
- Renders collapsible list of sources
- Shows document title, section, relevance indicator
- Click navigates to source URL
- Sorts by relevance score descending

**Display Contract**:
```typescript
// Relevance indicator
const getRelevanceLabel = (score: number): string => {
  if (score >= 0.9) return 'High relevance';
  if (score >= 0.7) return 'Medium relevance';
  return 'Related';
};
```

---

### ChatToggle

**Props**:
```typescript
interface ChatToggleProps {
  // No props - uses ChatContext
}
```

**Behavior**:
- Floating action button (FAB) in bottom-right
- Shows chat icon when closed, X when open
- Badge shows unread count (future enhancement)
- Hidden when panel is open on mobile

**Position Contract**:
```css
.chatToggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  z-index: 999;
}
```

---

### HighlightAsk

**Props**:
```typescript
interface HighlightAskProps {
  // No props - uses internal state and ChatContext
}
```

**Behavior**:
- Listens for text selection events
- Shows floating "Ask AI" button near selection
- Debounces selection detection (300ms)
- Passes highlighted text as context to chat

**Selection Detection Contract**:
```typescript
// Only show button when:
// 1. Selection is non-empty (after trim)
// 2. Selection is within doc content (not in chat panel)
// 3. Selection is at least 3 characters

const shouldShowButton = (selection: Selection | null): boolean => {
  if (!selection) return false;
  const text = selection.toString().trim();
  if (text.length < 3) return false;

  // Check selection is in doc content
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  return isInDocContent(container);
};
```

---

### HighlightButton

**Props**:
```typescript
interface HighlightButtonProps {
  position: { top: number; left: number };
  onAsk: () => void;
  onAskWithQuestion: (question: string) => void;
}
```

**Behavior**:
- Positioned absolutely near selection
- Click shows input for optional follow-up question
- Submit sends highlight + question to chat
- Escape or click-outside dismisses

**Position Contract**:
```typescript
// Calculate position to avoid viewport overflow
const calculatePosition = (
  selectionRect: DOMRect,
  buttonSize: { width: number; height: number }
): { top: number; left: number } => {
  const padding = 8;
  let top = selectionRect.bottom + padding;
  let left = selectionRect.left + (selectionRect.width / 2) - (buttonSize.width / 2);

  // Clamp to viewport
  const maxLeft = window.innerWidth - buttonSize.width - padding;
  left = Math.max(padding, Math.min(left, maxLeft));

  // If below viewport, show above selection
  if (top + buttonSize.height > window.innerHeight - padding) {
    top = selectionRect.top - buttonSize.height - padding;
  }

  return { top, left };
};
```

---

## Hooks

### useChatSession

```typescript
interface UseChatSessionReturn {
  session: ConversationSession | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, context?: string) => Promise<void>;
  clearSession: () => void;
}

const useChatSession = (): UseChatSessionReturn;
```

**Contract**:
- Manages session state in sessionStorage
- Handles session expiration (30 min)
- Limits conversation to 20 messages
- Updates `lastActivity` on each message

---

### useTextSelection

```typescript
interface UseTextSelectionReturn {
  selection: TextSelection | null;
  clearSelection: () => void;
}

const useTextSelection = (): UseTextSelectionReturn;
```

**Contract**:
- Returns null when no selection
- Debounces changes (300ms)
- Clears on click outside
- Ignores selections in excluded elements

---

### useChatApi

```typescript
interface UseChatApiReturn {
  sendMessage: (request: ChatRequest) => Promise<ChatResponse>;
  isHealthy: boolean;
}

const useChatApi = (): UseChatApiReturn;
```

**Contract**:
- Handles API communication
- Throws typed errors for UI handling
- Checks health on mount

---

## Event Flow

### User Sends Message

```
1. User types in ChatInput
2. User presses Enter
3. ChatInput calls onSubmit
4. ChatPanel calls sendMessage(value)
5. useChatSession:
   a. Adds user message to session
   b. Sets isLoading = true
   c. Calls API via useChatApi
   d. Adds assistant message to session
   e. Updates sessionStorage
   f. Sets isLoading = false
6. ChatMessages re-renders with new messages
```

### User Uses Highlight-to-Ask

```
1. User selects text on doc page
2. useTextSelection detects selection
3. HighlightAsk shows HighlightButton
4. User clicks "Ask AI"
5. HighlightButton shows optional question input
6. User submits (with or without question)
7. HighlightAsk:
   a. Opens ChatPanel via context
   b. Calls sendMessage(question, highlightedText)
8. Normal chat flow continues
```

---

## Accessibility Requirements

| Component | Requirements |
|-----------|-------------|
| ChatPanel | Focus trap when open, Escape to close, aria-modal="true" |
| ChatToggle | aria-label, aria-expanded, keyboard accessible |
| ChatInput | aria-label, aria-describedby for counter |
| ChatMessage | role="log", aria-live="polite" for new messages |
| HighlightButton | aria-label, keyboard accessible (Tab, Enter) |
| SourcesList | aria-expanded for collapsible, links have descriptive text |
