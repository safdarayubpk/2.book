# Research: Layout Spacing & Sidebar Proximity

**Feature**: 010-layout-spacing
**Date**: 2025-12-22

## Current State Analysis

### Existing Layout Variables

From `src/css/custom.css` (lines 217-222):

```css
:root {
  --layout-content-width: 800px;      /* Content column max width */
  --layout-sidebar-width: 260px;      /* Navigation sidebar width */
  --layout-toc-width: 240px;          /* TOC sidebar width */
  --layout-gap: 16px;                 /* Gap between elements */
}
```

### Current Layout Behavior

| Viewport | Left Sidebar | Content Area | TOC | Total Used | Whitespace |
|----------|--------------|--------------|-----|------------|------------|
| 1920px | 260px | 800px (max) | 240px | 1300px | 620px |
| 1440px | 260px | 800px (max) | 240px | 1300px | 140px |
| 1366px | 260px | 800px (max) | 240px | 1300px | 66px |
| 1200px | 220px | 800px (max) | 200px | 1220px | -20px (tight) |

**Key Finding**: At 1920px, there's 620px of horizontal whitespace (~310px each side of content), creating visual disconnection between sidebars and content.

### Docusaurus Theme Classes

Relevant CSS selectors from the classic theme:

- `.docsWrapper` - Outer docs container
- `.docRoot` - Main flex container (sidebar + content + TOC)
- `.docSidebarContainer` - Left navigation sidebar
- `.docMainContainer` - Main content area container
- `.theme-doc-toc-desktop` - Right TOC sidebar
- `.tableOfContents` - TOC list container
- `.markdown` - Content prose wrapper

## Design Research

### Typography Best Practices

**Optimal Line Length**: 45-75 characters for readability (source: Butterick's Practical Typography)

At 16px font size:
- 45 chars ≈ 450px
- 65 chars ≈ 650px (ideal)
- 75 chars ≈ 750px
- 100 chars ≈ 1000px (maximum before readability degrades)

**Current**: 800px ≈ 80 characters/line (acceptable)
**Proposed**: 900px ≈ 90 characters/line (still acceptable)

### Spacing Guidelines

**Proximity Principle** (Gestalt): Elements close together are perceived as related.

Recommended spacing ranges:
- **Tight grouping**: 8-16px (elements clearly related)
- **Moderate grouping**: 16-32px (elements logically connected)
- **Separation**: 32-64px (distinct sections)
- **Major division**: 64px+ (independent regions)

**Current 16px gap**: Good proximity, but content floats in whitespace
**Proposed 24px gap**: Maintains proximity while adding breathing room

### Container Width Strategies

| Strategy | Pros | Cons |
|----------|------|------|
| **Fixed max-width** | Predictable, consistent | Doesn't adapt to screens |
| **Fluid percentage** | Adapts to all screens | May feel inconsistent |
| **Clamped (min/max)** | Best of both | Slightly complex |
| **Breakpoint-based** | Full control | More CSS to maintain |

**Chosen**: Fixed max-width container (1500px) with centered layout

## Decision Documentation

### Decision 1: Content Column Width

**Question**: What should the content column max-width be?

**Options**:
1. Keep 800px - Safe, proven readability
2. Increase to 900px - Better density, still readable
3. Increase to 1000px - Maximum before line length issues
4. Make fluid - Adapts but may feel inconsistent

**Decision**: Increase to 900px

**Rationale**:
- 900px provides ~90 characters/line (within acceptable range)
- Reduces whitespace gaps by 100px
- Maintains good readability on all desktop sizes
- Simple change with predictable results

**Alternatives Rejected**:
- 1000px: Risk of lines being too long
- Fluid: Adds complexity for marginal benefit

---

### Decision 2: Layout Container Max-Width

**Question**: Should we constrain the overall layout container?

**Options**:
1. No constraint - Layout fills entire viewport
2. 1400px max - Tight grouping, may feel cramped at 1440px
3. 1500px max - Balanced, comfortable at all widths
4. 1600px max - Looser, still some whitespace at 1920px

**Decision**: 1500px max-width

**Rationale**:
- At 1920px: 210px margins each side (acceptable)
- At 1440px: 30px margins (tight but comfortable)
- At 1366px: No margins (full width used)
- Keeps all elements grouped as cohesive unit

**Alternatives Rejected**:
- No constraint: Doesn't solve the whitespace problem
- 1400px: Too tight at 1440px viewport
- 1600px: Still too much whitespace at 1920px

---

### Decision 3: Gutter Size

**Question**: What gap should be between columns?

**Options**:
1. 16px (current) - Tight
2. 24px - Moderate
3. 32px - Comfortable
4. Proportional - Scales with viewport

**Decision**: 24px fixed

**Rationale**:
- Provides visual breathing room without excess space
- Symmetric left and right (matches FR-003)
- Consistent across all viewport widths
- Industry standard for component spacing

**Alternatives Rejected**:
- 16px: Feels cramped with wider content
- 32px: Too much separation
- Proportional: Inconsistent experience

---

## Implementation Notes

### CSS Changes Summary

```css
/* BEFORE */
:root {
  --layout-content-width: 800px;
  --layout-sidebar-width: 260px;
  --layout-toc-width: 240px;
  --layout-gap: 16px;
}

/* AFTER */
:root {
  --layout-max-width: 1500px;         /* NEW */
  --layout-content-width: 900px;      /* CHANGED: 800 → 900 */
  --layout-sidebar-width: 260px;      /* UNCHANGED */
  --layout-toc-width: 240px;          /* UNCHANGED */
  --layout-gap: 24px;                 /* CHANGED: 16 → 24 */
}

.docRoot {
  max-width: var(--layout-max-width); /* NEW */
  margin: 0 auto;                     /* NEW */
}
```

### Breakpoint Adjustments

**997px-1199px** (current):
```css
@media (min-width: 997px) and (max-width: 1199px) {
  :root {
    --layout-sidebar-width: 220px;
    --layout-toc-width: 200px;
    --layout-gap: 16px;
  }
}
```

**Recommended change**: Increase gap to 20px for consistency

### Responsive Preservation

No changes needed for:
- Tablet (768px-996px)
- Mobile (<768px)

These breakpoints already handle collapsed states correctly.

## Verification Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Content width at 1920px | 800px | 900px | +100px |
| Total whitespace at 1920px | ~620px | ~210px | -66% |
| Left gutter visual distance | ~310px | 24px | -92% |
| Right gutter visual distance | ~310px | 24px | -92% |
| Symmetric balance | No | Yes | ✓ |

## References

- Butterick's Practical Typography: Line Length
- Material Design: Layout Grid
- Docusaurus Theme Architecture
- Gestalt Principles of Design
