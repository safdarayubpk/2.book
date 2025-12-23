# Data Model: Content Personalization

**Feature**: 012-content-personalization
**Date**: 2025-12-23

## Entities

### User Profile (Existing)

Already defined in `users` table. Relevant fields for personalization:

| Field | Type | Values |
|-------|------|--------|
| programming_level | VARCHAR(50) | beginner, intermediate, advanced |
| hardware_background | VARCHAR(50) | none, hobbyist, professional |
| learning_goals | TEXT[] | career_transition, academic, personal, upskilling |

### Personalization Request (API Input)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chapter_slug | string | Yes | Chapter identifier (e.g., "chapter-1", "intro") |
| user_profile | object | Yes | User's background information |
| user_profile.programming_level | string | Yes | beginner/intermediate/advanced |
| user_profile.hardware_background | string | Yes | none/hobbyist/professional |
| user_profile.learning_goals | string[] | Yes | Array of learning goals |

### Personalization Response (API Output)

| Field | Type | Description |
|-------|------|-------------|
| chapter_slug | string | Echo of input chapter |
| personalized_content | string | AI-generated personalized content (markdown) |
| original_title | string | Original chapter title |
| metadata | object | Processing information |
| metadata.processing_time_ms | int | Time taken to personalize |
| metadata.tokens_used | int | OpenAI tokens consumed |
| metadata.profile_summary | string | Summary of personalization applied |

### Chapter Content (Internal)

Retrieved from Qdrant chunks by chapter slug:

| Field | Type | Description |
|-------|------|-------------|
| slug | string | Chapter identifier |
| title | string | Chapter title |
| content | string | Full chapter text (markdown) |
| sections | string[] | Section headings for structure preservation |

## State Management (Frontend)

### PersonalizationState

```typescript
interface PersonalizationState {
  isPersonalized: boolean;
  isLoading: boolean;
  error: string | null;
  originalContent: string | null;  // Stored when personalized
  personalizedContent: string | null;
  profileSummary: string | null;  // e.g., "Adapted for beginner programmers"
}
```

### Initial State

```typescript
const initialState: PersonalizationState = {
  isPersonalized: false,
  isLoading: false,
  error: null,
  originalContent: null,
  personalizedContent: null,
  profileSummary: null,
};
```

## Validation Rules

### Request Validation

- chapter_slug: Must match existing chapter (intro, chapter-1 through chapter-6)
- programming_level: Must be one of: beginner, intermediate, advanced
- hardware_background: Must be one of: none, hobbyist, professional
- learning_goals: Array must have at least one valid goal

### Response Validation

- personalized_content: Must not be empty
- personalized_content: Must preserve markdown heading structure
- processing_time_ms: Must be positive integer

## Data Flow

```
1. User clicks "Personalize Content"
   ↓
2. Frontend extracts chapter slug from URL
   ↓
3. Frontend gets user profile from AuthContext
   ↓
4. POST /personalize with {chapter_slug, user_profile}
   ↓
5. Backend fetches chapter content from Qdrant
   ↓
6. Backend calls OpenAI with personalization prompt
   ↓
7. Backend returns personalized_content
   ↓
8. Frontend stores original, displays personalized
   ↓
9. User can toggle "Show Original" / "Personalize"
```
