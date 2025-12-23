# Quickstart: Content Personalization Button

**Feature**: 012-content-personalization
**Date**: 2025-12-23

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Existing auth system working (user can sign in)
- OpenAI API key configured in backend

## Quick Test

### 1. Start Backend (if local)

```bash
cd /home/safdarayub/Desktop/claude/2.book
python3 -m uvicorn scripts.api:app --reload --port 8000
```

### 2. Start Frontend (if local)

```bash
npm start
```

### 3. Test Personalization Flow

1. Open http://localhost:3000/docs/chapter-1
2. Sign in with a test account
3. Click "Personalize for Me" button at top of chapter
4. Wait for content to be personalized (loading spinner)
5. See personalized content with "Content adapted for your level" banner
6. Click "Show Original" to restore

### 4. Test API Directly

```bash
curl -X POST https://safdarayub-book-rag-api.hf.space/personalize \
  -H "Content-Type: application/json" \
  -d '{
    "chapter_slug": "chapter-1",
    "user_profile": {
      "programming_level": "beginner",
      "hardware_background": "none",
      "learning_goals": ["personal"]
    }
  }'
```

## Implementation Checklist

### Backend Tasks

- [ ] Create `/personalize` endpoint in `api.py`
- [ ] Create `personalization_utils.py` with prompt template
- [ ] Add chapter content fetching from Qdrant
- [ ] Handle errors and timeouts gracefully

### Frontend Tasks

- [ ] Create `PersonalizeButton` component
- [ ] Create `usePersonalization` hook
- [ ] Inject button into chapter pages via MDXComponents
- [ ] Handle loading, error, and success states
- [ ] Add "Show Original" toggle functionality

### Integration Tasks

- [ ] Connect button to API
- [ ] Pass user profile from AuthContext
- [ ] Display personalized content in-place
- [ ] Test on all 7 pages (intro + 6 chapters)

## Key Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `scripts/api.py` | Modify | Add /personalize endpoint |
| `scripts/personalization_utils.py` | Create | Personalization logic and prompts |
| `src/components/PersonalizeButton/PersonalizeButton.tsx` | Create | Main button component |
| `src/components/PersonalizeButton/PersonalizeButton.module.css` | Create | Button styles |
| `src/hooks/usePersonalization.ts` | Create | State management hook |
| `src/theme/MDXComponents/index.tsx` | Create/Modify | Inject button into pages |

## Environment Variables

No new environment variables needed - uses existing:
- `OPENAI_API_KEY` (backend)
- `DATABASE_URL` (backend, for user profiles)

## Deployment

1. Push backend changes to HuggingFace:
   ```bash
   git push hf main
   ```

2. Frontend auto-deploys to Vercel on push to GitHub:
   ```bash
   git push origin main
   ```

## Verification

After deployment, verify:

1. ✅ Button appears on all chapter pages
2. ✅ Guest users see signup prompt when clicking
3. ✅ Logged-in users get personalized content
4. ✅ "Show Original" restores original content
5. ✅ Errors display user-friendly messages
6. ✅ Loading state shows during personalization
