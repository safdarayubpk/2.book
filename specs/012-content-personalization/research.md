# Research: Content Personalization Button

**Feature**: 012-content-personalization
**Date**: 2025-12-23

## Research Questions

### 1. How to inject a button into Docusaurus MDX pages?

**Decision**: Use Docusaurus theme swizzling to create a custom wrapper component that adds the PersonalizeButton to all doc pages.

**Rationale**: Docusaurus supports component swizzling via `src/theme/` directory. We can create a `DocItem/Layout` wrapper or use MDXComponents to inject the button at the top of each chapter.

**Alternatives Considered**:
- Manually add button to each MDX file - Rejected (not maintainable, repetitive)
- Custom Docusaurus plugin - Rejected (over-engineered for simple button)
- MDXComponents override - Selected (clean, centralized)

### 2. How to extract chapter content for personalization?

**Decision**: Send the full chapter content (or a truncated version) to the backend API, which passes it to OpenAI for rewriting.

**Rationale**: The chapter content is already rendered on the page. We can extract it from the DOM or pass the chapter slug to the backend to fetch from stored chunks.

**Alternatives Considered**:
- Extract from DOM on frontend - Viable but messy
- Fetch from Qdrant chunks by chapter - Selected (cleaner, server-side)
- Store full chapters in separate files - Rejected (duplication)

### 3. How to adapt content based on user profile?

**Decision**: Create a prompt template that instructs OpenAI to rewrite content based on:
- Programming level: Adjust technical depth and jargon
- Hardware background: Include/exclude robotics-specific details
- Learning goals: Emphasize relevant applications

**Rationale**: OpenAI's GPT-4o-mini can effectively rewrite educational content when given clear instructions about the target audience.

**Prompt Strategy**:
```
Rewrite the following chapter content for a reader with:
- Programming experience: {beginner|intermediate|advanced}
- Hardware/robotics background: {none|hobbyist|professional}
- Learning goals: {career_transition|academic|personal|upskilling}

Adapt the content by:
- Beginner: Use simpler language, more analogies, explain technical terms
- Intermediate: Balance explanation with technical details
- Advanced: Include deeper technical insights, assume prior knowledge

Maintain the same structure (headings, sections) but adapt the explanations.

Original content:
{chapter_content}
```

### 4. How to handle long chapter content?

**Decision**: Truncate or summarize chapter content to fit within OpenAI's context window (128k tokens for GPT-4o-mini). For chapters under 8000 tokens, send full content.

**Rationale**: Most chapters are short (per constitution principle II). If content exceeds limit, use key sections only.

**Alternatives Considered**:
- Chunk and personalize separately - Rejected (loses coherence)
- Summarize first, then personalize - Rejected (loses detail)
- Full content with truncation fallback - Selected

### 5. How to display personalized vs original content?

**Decision**: Replace the chapter content in-place with visual indicator (banner/badge). Store original content in React state for toggle.

**Rationale**: In-place replacement provides seamless reading experience. Visual indicator ensures user knows content is personalized.

**UI Pattern**:
- Default: "Personalize for Me" button at top of chapter
- Loading: Button shows spinner, "Personalizing..."
- Personalized: Banner "Content personalized for your level" + "Show Original" button
- Error: Toast notification with retry option

## Technical Decisions Summary

| Area | Decision | Rationale |
|------|----------|-----------|
| Button injection | MDXComponents wrapper | Centralized, maintainable |
| Content source | Qdrant chunks by chapter | Server-side, existing infrastructure |
| AI model | GPT-4o-mini | Cost-effective, sufficient quality |
| Content display | In-place replacement | Seamless UX |
| State management | React useState | Simple, no global state needed |
| API design | POST /personalize | RESTful, matches existing patterns |

## Dependencies

- Existing: OpenAI client (api.py), Qdrant chunks, AuthContext (user profile)
- New: PersonalizeButton component, /personalize endpoint

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Slow personalization (>15s) | Medium | High | Show progress, streaming response |
| Content too long for API | Low | Medium | Truncation with warning |
| Poor personalization quality | Low | Medium | Refine prompt, test with profiles |
| Rate limiting on OpenAI | Low | Low | Queue requests, show friendly error |
