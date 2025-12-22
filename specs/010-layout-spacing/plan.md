# Implementation Plan: Docusaurus Layout Spacing & Sidebar Proximity Fix

**Branch**: `010-layout-spacing` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-layout-spacing/spec.md`

## Summary

Reduce excessive horizontal spacing between left sidebar, main content, and right TOC on desktop viewports (≥1280px) to improve visual cohesion and navigation efficiency. This is a CSS-only enhancement modifying existing layout variables in `src/css/custom.css` with no structural changes to Docusaurus components.

## Technical Context

**Language/Version**: CSS3 (within Docusaurus 3.x TypeScript/React project)
**Primary Dependencies**: Docusaurus classic theme, Infima CSS framework
**Storage**: N/A (CSS-only feature)
**Testing**: Manual visual testing at multiple viewport widths
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web (frontend only)
**Performance Goals**: No impact on load time (CSS variables only)
**Constraints**: Changes limited to CSS overrides; preserve responsive breakpoints
**Scale/Scope**: Single CSS file modification (`src/css/custom.css`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity-First | ✅ PASS | CSS variable adjustments only; no new components |
| II. Mobile-Ready Performance | ✅ PASS | No impact on bundle size or load time; preserving mobile breakpoints |
| III. RAG Accuracy | ✅ N/A | No RAG changes |
| IV. Personalization-Driven | ✅ N/A | No personalization changes |
| V. Free-Tier Compliance | ✅ PASS | No infrastructure changes |
| VI. Educational Focus | ✅ PASS | Improves readability and navigation |
| VII. AI-Native Experience | ✅ N/A | No AI feature changes |
| VIII. Rapid Deployment | ✅ PASS | CSS changes deploy instantly via Vercel |

**Gate Status**: ✅ ALL PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/010-layout-spacing/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Layout analysis and decisions
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
└── css/
    └── custom.css       # Target file for CSS modifications
```

**Structure Decision**: Single file modification - all layout spacing changes consolidated in existing `custom.css` within the "Content-Centered Layout" section (lines 212-322).

## Complexity Tracking

No violations - this is a minimal CSS-only change.

---

## Phase 0: Layout Analysis & Decisions

### Current Layout Analysis

**Existing CSS Variables** (from `src/css/custom.css:217-222`):
```css
:root {
  --layout-content-width: 800px;      /* Content column max width */
  --layout-sidebar-width: 260px;      /* Navigation sidebar width */
  --layout-toc-width: 240px;          /* TOC sidebar width */
  --layout-gap: 16px;                 /* Gap between elements */
}
```

**Current Layout Model**:
- Total width at 1920px: `260px (sidebar) + flex-grow content + 240px (TOC) = 1920px`
- Content area: `1920 - 260 - 240 = 1420px` available for main content container
- Content max-width: 800px (constrained within 1420px available space)
- **Gap between sidebar and content**: ~310px of whitespace on each side at 1920px
- **Gap between content and TOC**: Same ~310px of whitespace

**Problem**: At 1920px, there's approximately 620px total of horizontal whitespace distributed around the 800px content column, creating visual disconnection.

### Design Decisions

#### Decision 1: Content Max-Width Range

**Options Considered**:
| Option | Width | Characters/Line | Tradeoff |
|--------|-------|-----------------|----------|
| A | 720px | ~65-75 | Too narrow, wastes wide screen space |
| B | 800px (current) | ~75-85 | Good readability, excessive gaps on wide screens |
| C | 900px | ~85-95 | Balanced density, slightly wider than ideal |
| D | Fluid (min 800px, max 1000px) | 75-100 | Adapts to viewport, may feel inconsistent |

**Chosen Approach**: Option D - Fluid width with min 800px, max 1000px

**UX Rationale**:
- Maintains optimal reading width at smaller desktops (1366px)
- Expands gracefully on larger screens to reduce whitespace gaps
- Stays within typography best practices (max ~100 characters/line)
- Creates tighter visual grouping with sidebars

---

#### Decision 2: Left Sidebar Gutter Size

**Options Considered**:
| Option | Gap | Visual Effect |
|--------|-----|---------------|
| A | 16px (current) | Tight but may feel cramped |
| B | 24px | Balanced proximity with breathing room |
| C | 32px | More separation, still connected |
| D | Proportional (2%) | Scales with viewport, may feel unstable |

**Chosen Approach**: Option B - 24px fixed gutter

**UX Rationale**:
- 24px provides enough visual separation to distinguish sidebar from content
- Consistent spacing at all desktop viewport widths (predictable experience)
- Close enough to feel connected without overlapping during transitions

---

#### Decision 3: Right TOC Proximity

**Options Considered**:
| Option | Gap | Visual Effect |
|--------|-----|---------------|
| A | 16px | Very tight, TOC feels attached to content |
| B | 24px (match left) | Symmetric layout, balanced appearance |
| C | 32px | More breathing room, slightly detached |

**Chosen Approach**: Option B - 24px (symmetric with left sidebar)

**UX Rationale**:
- Symmetric spacing creates balanced, intentional page framing
- TOC remains contextually linked to headings it references
- Matches left sidebar gutter for visual harmony (FR-003)

---

#### Decision 4: Wide Desktop Behavior (>1440px)

**Options Considered**:
| Option | Behavior | Effect at 1920px |
|--------|----------|------------------|
| A | Fixed max-width container | Content stays 1400px, centered |
| B | Fluid with content expansion | Content grows to 1000px, sidebars closer |
| C | Proportional gaps | Gaps scale with viewport |

**Chosen Approach**: Option A - Fixed max-width container (1500px) with centered layout

**UX Rationale**:
- Prevents infinite spacing growth on ultra-wide monitors
- Content, sidebar, and TOC stay grouped as a cohesive unit
- Consistent experience regardless of monitor width
- At 1920px: 1500px container centered with 210px margin each side

---

### Proposed Layout Model

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Viewport (1920px)                               │
│  ┌─────┐                    ┌───────────────────────────────┐                │
│  │     │                    │         max-width: 1500px     │                │
│  │     │                    │  ┌──────┬─────────────┬─────┐ │                │
│  │     │      210px         │  │260px │   900px     │240px│ │     210px      │
│  │     │      margin        │  │ Left │   Content   │ TOC │ │     margin     │
│  │     │                    │  │      │   (fluid)   │     │ │                │
│  │     │                    │  └──────┴─────────────┴─────┘ │                │
│  │     │                    │         24px gaps             │                │
│  └─────┘                    └───────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**New CSS Variables**:
```css
:root {
  --layout-max-width: 1500px;         /* Maximum layout container width */
  --layout-content-width: 900px;      /* Content column max width (increased) */
  --layout-content-min-width: 800px;  /* Content column min width */
  --layout-sidebar-width: 260px;      /* Navigation sidebar width (unchanged) */
  --layout-toc-width: 240px;          /* TOC sidebar width (unchanged) */
  --layout-gap: 24px;                 /* Gap between elements (increased from 16px) */
}
```

---

## Phase 1: Implementation Strategy

### CSS Override Strategy

**Approach**: Modify existing CSS variables and add container max-width constraint.

**Changes Required**:

1. **Update layout variables** (lines 217-222):
   - Increase `--layout-gap` from 16px to 24px
   - Increase `--layout-content-width` from 800px to 900px
   - Add `--layout-max-width: 1500px`

2. **Add container max-width** to `.docRoot`:
   ```css
   .docRoot {
     max-width: var(--layout-max-width);
     margin: 0 auto; /* Center the container */
   }
   ```

3. **Update breakpoint for 997px-1199px**:
   - Adjust content width to scale appropriately

4. **Preserve existing responsive breakpoints**:
   - No changes to tablet (768px-996px) styles
   - No changes to mobile (<768px) styles

### UX Validation Checklist

| Viewport | Check | Success Criteria |
|----------|-------|------------------|
| 1920px | Sidebar-content gap | ≤32px visual gap |
| 1920px | Content-TOC gap | ≤32px visual gap, symmetric |
| 1920px | Content width | 800-1000px |
| 1440px | All three columns | Fit without horizontal scroll |
| 1440px | Balanced gutters | Left ≈ Right (within 8px) |
| 1366px | All three columns | Fit comfortably |
| 1366px | Content readability | Lines not exceeding 100 characters |
| 996px (tablet) | TOC collapse | Functions correctly |
| 768px (tablet) | Layout | No horizontal scroll |
| 375px (mobile) | Single column | Full width, readable |

### Testing Strategy

1. **Desktop validation**: Test at 1366px, 1440px, 1920px using browser DevTools
2. **Responsive regression**: Resize from 1920px down to 375px, verify smooth transitions
3. **Cross-browser**: Test in Chrome, Firefox, Safari (if available)
4. **Dark mode**: Verify layout unchanged in dark theme
5. **Content variation**: Test with long chapter (many headings) and short chapter

---

## Phase 2: Task Breakdown

*Generated by `/speckit.tasks` command - see tasks.md*

### Work Phases

1. **Audit Phase**
   - Measure current spacing values at each target viewport
   - Document baseline screenshots for comparison

2. **Foundation Phase**
   - Define updated CSS variables
   - Add max-width container constraint

3. **Adjustment Phase**
   - Implement CSS changes
   - Fine-tune values based on visual inspection

4. **Validation Phase**
   - Run through UX validation checklist
   - Test responsive breakpoints
   - Document final spacing values

---

## Artifacts Generated

- ✅ `plan.md` - This implementation plan
- ✅ `research.md` - To be created with detailed measurements
- ⬜ `tasks.md` - Generated by `/speckit.tasks` command
