# Quickstart: Urdu Translation Button

**Feature**: 013-urdu-translation
**Date**: 2025-12-24

## Quick Test Guide

### Prerequisites

- Frontend running (`npm start`)
- Backend deployed on HuggingFace Spaces
- User logged in via Firebase Auth

### Test Steps

1. **Navigate to any chapter page**
   ```
   http://localhost:3000/docs/chapter-1
   ```

2. **Locate the translation button**
   - Should appear next to "Personalize for Me" button
   - Button text: "Translate to Urdu"

3. **Click the button**
   - Loading spinner should appear
   - Wait up to 60 seconds for translation

4. **Verify Urdu content**
   - Content displays right-to-left (RTL)
   - Code blocks remain in English
   - Proper Urdu font (Noto Nastaliq Urdu)
   - Banner indicates "Content translated to Urdu"

5. **Test restore functionality**
   - Click "Show Original" button
   - English content is restored

### Expected API Call

```bash
curl -X POST https://safdarayub-book-rag-api.hf.space/translate \
  -H "Content-Type: application/json" \
  -d '{
    "chapter_id": "chapter-1",
    "user_id": "test-user-id"
  }'
```

### Success Criteria Verification

| Criteria | How to Verify |
|----------|---------------|
| Single-click translation | Click button once, translation starts |
| Under 60 seconds | Time from click to content display |
| RTL formatting | Text flows right-to-left |
| Toggle works | Can switch between EN/UR without reload |
| All 7 pages | Check intro + chapters 1-6 |

### Common Issues

- **Button not visible**: Check user is logged in
- **Timeout error**: Backend cold start, retry after 30 seconds
- **Font not loading**: Check Google Fonts CDN connection
- **RTL broken**: Verify CSS `direction: rtl` applied to content area
