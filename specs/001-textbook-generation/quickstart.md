# Quickstart: Textbook Generation

**Feature**: 001-textbook-generation
**Date**: 2025-12-09

## Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Git

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd 2.book
npm install
```

### 2. Start Development Server

```bash
npm start
```

The site will be available at `http://localhost:3000`.

### 3. View Chapters

Navigate to:
- http://localhost:3000/docs/intro - Introduction
- http://localhost:3000/docs/chapter-1 - Chapter 1
- etc.

## Development Workflow

### Adding a New Chapter

1. Create folder: `docs/chapter-N/`
2. Create content file: `docs/chapter-N/index.md`
3. Add frontmatter:

```yaml
---
sidebar_position: N
title: "Chapter Title"
description: "Brief description for SEO and TOC"
---

# Chapter Title

Your content here...
```

4. Update `sidebars.ts` if custom ordering needed

### Adding Images

1. Place images in `static/img/chapters/chapter-N/`
2. Use WebP format for optimal performance
3. Reference in MDX: `![Alt text](/img/chapters/chapter-N/image.webp)`

### Creating Custom Components

1. Create component in `src/components/ComponentName/`
2. Export from `src/components/ComponentName/index.tsx`
3. Import in MDX:

```mdx
import MyComponent from '@site/src/components/MyComponent';

<MyComponent prop="value" />
```

## Testing

### Performance Testing

```bash
npm run build
npm run serve

# In another terminal, run Lighthouse:
npx lighthouse http://localhost:3000/docs/chapter-1 --view
```

**Performance Targets**:
- Performance score: >90
- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.0s

### Mobile Testing

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (e.g., iPhone 12, Pixel 5)
4. Verify:
   - No horizontal scroll
   - Text readable without zoom
   - Tap targets >= 44x44px
   - Images scale appropriately

## Build & Deploy

### Build for Production

```bash
npm run build
```

Output is in `build/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

**Vercel Auto-Configuration**:
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

## Validation Checklist

Before considering the feature complete:

- [ ] All 6-8 chapters render correctly
- [ ] Each chapter loads in <3 seconds on simulated 3G
- [ ] Mobile layout works on all chapters
- [ ] Navigation (next/previous) works
- [ ] Table of contents lists all chapters
- [ ] Images lazy load and display correctly
- [ ] Lighthouse performance score >90
- [ ] Deployed URL accessible and stable

## Common Issues

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .docusaurus build node_modules/.cache
npm run build
```

### Images Not Loading

- Check file path matches exactly (case-sensitive)
- Ensure image is in `static/img/` directory
- Use absolute paths starting with `/img/`

### Sidebar Not Updating

- Check `_category_.json` in chapter folder
- Verify `sidebars.ts` configuration
- Restart dev server after changes

## Next Features

After this feature is complete:
1. **Auth Feature**: Enables progress tracking
2. **RAG Chatbot**: Uses chapter content for Q&A
3. **Personalization**: Adapts content to user background
4. **Translation**: Adds Urdu translation
