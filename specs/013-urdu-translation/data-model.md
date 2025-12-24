# Data Model: Urdu Translation

**Feature**: 013-urdu-translation
**Date**: 2025-12-24

## Entities

### TranslateRequest

Request payload sent from frontend to backend.

```typescript
interface TranslateRequest {
  chapter_id: string;      // e.g., "intro", "chapter-1", ..., "chapter-6"
  user_id: string;         // Firebase UID for authenticated user
}
```

### TranslateResponse

Response payload from backend translation endpoint.

```typescript
interface TranslateResponse {
  chapter_id: string;           // Echo back the requested chapter
  original_title: string;       // Original English title
  translated_title: string;     // Urdu translated title
  translated_content: string;   // Full Urdu translation (markdown)
  source_language: "en";        // Always English
  target_language: "ur";        // Always Urdu
  translated_at: string;        // ISO 8601 timestamp
}
```

### TranslateError

Error response structure.

```typescript
interface TranslateError {
  error: string;     // Error code: "validation_error" | "not_found" | "translation_failed" | "timeout"
  message: string;   // Human-readable error message
}
```

### TranslationState (Frontend)

Client-side state for managing translation UI.

```typescript
interface TranslationState {
  isLoading: boolean;           // True while translation in progress
  isTranslated: boolean;        // True when showing Urdu content
  error: string | null;         // Error message if translation failed
  originalContent: string;      // Cached original English content
  translatedContent: string | null;  // Urdu content when available
}
```

## Data Flow

```
┌─────────────┐     POST /translate      ┌─────────────┐
│   Frontend  │  ───────────────────────>│   Backend   │
│  (React)    │     TranslateRequest     │  (FastAPI)  │
└─────────────┘                          └─────────────┘
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │  Qdrant Vector   │
                                    │    Database      │
                                    │ (get chapter)    │
                                    └──────────────────┘
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │    OpenAI API    │
                                    │  (GPT-4o-mini)   │
                                    │   Translation    │
                                    └──────────────────┘
                                               │
                                               ▼
┌─────────────┐   TranslateResponse  ┌─────────────┐
│   Frontend  │  <───────────────────│   Backend   │
│  (display)  │                      │  (FastAPI)  │
└─────────────┘                      └─────────────┘
```

## No Caching

Per hackathon scope, translations are generated fresh each time. No database storage of translations.
