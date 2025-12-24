# Research: Urdu Translation Button

**Feature**: 013-urdu-translation
**Date**: 2025-12-24

## Research Questions

### 1. How to implement RTL (Right-to-Left) text display in Docusaurus?

**Decision**: Use CSS `direction: rtl` and `text-align: right` on translated content container, with proper Urdu font stack.

**Rationale**: CSS-based RTL is the standard web approach and works across all browsers. Docusaurus/React supports dynamic style changes.

**Alternatives Considered**:
- HTML `dir="rtl"` attribute - Selected (combined with CSS)
- Separate RTL stylesheet - Rejected (over-engineered for single feature)
- RTL-specific component library - Rejected (unnecessary dependency)

### 2. Which font to use for Urdu text?

**Decision**: Use Google Fonts "Noto Nastaliq Urdu" as primary, with "Jameel Noori Nastaleeq" and system fallbacks.

**Rationale**: Noto Nastaliq Urdu is free, widely supported, and renders Nastaliq script correctly. Google Fonts CDN is fast and reliable.

**Font Stack**:
```css
font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', serif;
```

**Alternatives Considered**:
- System fonts only - Rejected (inconsistent Urdu rendering)
- Self-hosted fonts - Rejected (increases bundle size)
- Naskh fonts - Viable but Nastaliq preferred for readability

### 3. How to translate content while preserving code blocks?

**Decision**: Use OpenAI prompt engineering to explicitly preserve code blocks, technical terms, and markdown formatting.

**Rationale**: GPT-4o-mini can follow instructions to preserve specific content patterns when translating.

**Prompt Strategy**:
```
Translate the following content to Urdu. IMPORTANT:
1. Keep all code blocks (```) exactly as-is in English
2. Keep technical terms like "AI", "API", "robot" in English
3. Preserve all markdown formatting (headings, lists, bold, etc.)
4. Use proper Urdu grammar and natural phrasing
```

### 4. How to handle translation API timeout?

**Decision**: Set 60-second timeout (matching personalization), show loading state, provide retry on timeout.

**Rationale**: Translation of full chapters can take 20-40 seconds due to content length and API latency.

### 5. How to integrate TranslateButton alongside PersonalizeButton?

**Decision**: Add TranslateButton to the same DocItem/Content wrapper, displayed next to PersonalizeButton in a button group.

**Rationale**: Consistent UI pattern, single injection point, shared styling approach.

**UI Layout**:
```
[Personalize for Me] [Translate to Urdu]
```

## Technical Decisions Summary

| Area | Decision | Rationale |
|------|----------|-----------|
| RTL Support | CSS direction + dir attribute | Standard web approach |
| Font | Noto Nastaliq Urdu (Google Fonts) | Free, reliable, proper Nastaliq |
| Code Preservation | Prompt engineering | GPT follows explicit instructions |
| Timeout | 60 seconds | Matches personalization, allows for long content |
| Button Placement | Next to PersonalizeButton | Consistent UI pattern |
| API Pattern | POST /translate (mirrors /personalize) | Consistent backend architecture |

## Dependencies

- Existing: OpenAI client (api.py), Qdrant chunks, AuthContext
- New: TranslateButton component, /translate endpoint, RTL CSS styles

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Poor translation quality | Low | Medium | Use GPT-4o-mini with explicit Urdu instructions |
| RTL layout breaks | Low | Medium | Test on multiple browsers, isolate RTL to content area |
| Slow translation (>60s) | Medium | Medium | Show progress indicator, allow retry |
| Code blocks get translated | Low | High | Explicit prompt instructions to preserve code |
| Font loading slow | Low | Low | Use Google Fonts CDN, font-display: swap |
