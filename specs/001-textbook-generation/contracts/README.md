# API Contracts: Textbook Generation

**Feature**: 001-textbook-generation
**Date**: 2025-12-09

## Overview

This feature is a static Docusaurus site with no backend API requirements. All content is served as static files.

## Static Content Contracts

### Chapter Pages

**URL Pattern**: `/docs/chapter-{n}/`

**Response**: Static HTML (pre-rendered by Docusaurus)

**Example URLs**:
- `/docs/chapter-1/` - Introduction to Physical AI
- `/docs/chapter-2/` - Humanoid Robot Architecture
- `/docs/chapter-3/` - Perception & Sensing
- `/docs/chapter-4/` - Motion & Control
- `/docs/chapter-5/` - Learning & Adaptation
- `/docs/chapter-6/` - Applications & Future

### Landing Page

**URL**: `/`

**Response**: Static HTML with table of contents

### Assets

**URL Pattern**: `/img/chapters/{chapter-id}/{image-name}.webp`

**Response**: Optimized images (WebP with fallback)

## Future API Contracts (Auth Feature)

The following endpoints will be defined in the auth feature specification:

### Progress Tracking (Stubbed)

```
GET  /api/progress          # Get user's reading progress
POST /api/progress/complete # Mark chapter as completed
```

These endpoints are referenced by the ProgressIndicator component but require the auth feature to function.

## No Additional Contracts Required

This feature is entirely static. All dynamic functionality (progress tracking, personalization, chatbot) is handled by separate features.
