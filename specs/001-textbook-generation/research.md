# Research: Textbook Generation

**Feature**: 001-textbook-generation
**Date**: 2025-12-09
**Status**: Complete

## Research Tasks

### 1. Docusaurus 3.x for Educational Content

**Decision**: Use Docusaurus 3.x with MDX for chapter content

**Rationale**:
- Constitution mandates "Docusaurus on Vercel" for frontend
- Docusaurus 3.x is the latest stable version with React 18 support
- MDX allows embedding React components in Markdown for interactive elements
- Built-in dark mode, responsive design, and search
- Automatic navigation sidebar generation
- Excellent mobile performance out of the box

**Alternatives Considered**:
- Next.js with MDX: More flexible but requires more configuration; Docusaurus is purpose-built for documentation/education
- VitePress: Vue-based, doesn't fit React ecosystem
- GitBook: Proprietary, free tier limitations

### 2. Mobile-First Performance Optimization

**Decision**: Use Docusaurus default optimizations + custom image handling

**Rationale**:
- Docusaurus provides automatic code splitting and lazy loading
- Images should use WebP format with fallbacks
- Use `loading="lazy"` attribute on all non-critical images
- Keep JavaScript bundle minimal by avoiding heavy dependencies

**Best Practices**:
- Use Docusaurus `@docusaurus/plugin-ideal-image` for automatic image optimization
- Implement skeleton loading for images
- Use system fonts to avoid font loading delays
- Minimize custom CSS (rely on Infima defaults)

**Performance Targets** (from constitution):
- Page load: <3 seconds on 3G
- Touch targets: minimum 44x44px
- Total reading: <45 minutes

### 3. Chapter Content Structure

**Decision**: One folder per chapter with index.md and assets

**Rationale**:
- Keeps related content together (text + images)
- Easy to reorder chapters by renaming folders
- Docusaurus automatically generates sidebar from folder structure
- Supports future additions (video, interactive diagrams)

**Chapter Structure**:
```
docs/chapter-N/
├── index.md          # Main chapter content
├── _category_.json   # Sidebar metadata (label, position)
└── assets/           # Chapter-specific images (optional)
```

**Content Guidelines** (from constitution):
- 6-8 chapters maximum
- Each chapter readable in under 7 minutes (~1,000-1,500 words)
- Short, clear, modern writing style
- Educational explanations only (no complex robotics code)

### 4. Navigation Components

**Decision**: Use Docusaurus built-in navigation + custom ChapterNav component

**Rationale**:
- Docusaurus provides sidebar navigation automatically
- Custom ChapterNav adds prominent next/previous buttons at chapter end
- Mobile: bottom navigation bar for easy thumb access
- Breadcrumbs for context awareness

**Components Needed**:
1. **ChapterNav**: Next/Previous buttons at bottom of each chapter
2. **TableOfContents**: Landing page component showing all chapters
3. **ProgressIndicator**: Shows reading progress (requires auth - separate feature)

### 5. Vercel Deployment Configuration

**Decision**: Standard Docusaurus Vercel deployment

**Rationale**:
- Vercel auto-detects Docusaurus projects
- Free tier sufficient for static site
- Automatic preview deployments for PRs
- Edge caching for global performance

**Configuration**:
- Build command: `npm run build`
- Output directory: `build`
- Node.js version: 18.x or 20.x

### 6. Chapter Topics (Physical AI & Humanoid Robotics)

**Decision**: 6 core chapters covering fundamentals to applications

**Proposed Chapter Outline**:
1. **Introduction to Physical AI**: What is Physical AI? Difference from traditional AI
2. **Humanoid Robot Architecture**: Sensors, actuators, control systems
3. **Perception & Sensing**: Computer vision, force sensing, proprioception
4. **Motion & Control**: Walking, grasping, whole-body coordination
5. **Learning & Adaptation**: Reinforcement learning, imitation learning
6. **Applications & Future**: Real-world use cases, industry trends, ethics

**Note**: Final chapter content will be provided by subject matter experts. This outline serves as a structural guide.

## Unresolved Items

None - all technical decisions are clear from the constitution and standard Docusaurus patterns.

## Dependencies on Other Features

| Feature | Dependency | Notes |
|---------|------------|-------|
| User Authentication | Progress tracking (FR-009, FR-010) | Progress indicator component will be stubbed; requires auth feature |
| RAG Chatbot | None | Textbook content will be used for RAG later |
| Personalization | None | Content adaptation is separate feature |
| Translation | None | Urdu translation is separate feature |
