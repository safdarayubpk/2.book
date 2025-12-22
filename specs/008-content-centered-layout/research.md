# Research: Content-Centered Layout with Aligned Sidebars

**Date**: 2025-12-16
**Feature**: 008-content-centered-layout

## Research Tasks Completed

1. Docusaurus 3.x CSS class selectors for docs layout
2. Infima CSS framework layout variables
3. Best practices for centered content layouts in documentation sites

---

## 1. Docusaurus CSS Class Selectors

### Main Layout Structure

| Selector | Purpose | Default Properties |
|----------|---------|-------------------|
| `.docsWrapper` | Outer wrapper | `display: flex; flex: 1 0 auto;` |
| `.docRoot` | Inner container | `display: flex; width: 100%;` |
| `.docSidebarContainer` | Left sidebar | `width: var(--doc-sidebar-width);` (300px) |
| `.docMainContainer` | Main content area | `display: flex; width: 100%; flex-grow: 1;` |
| `.container` | Infima grid container | `margin: 0 auto; max-width: var(--ifm-container-width);` |
| `.row` | Flexbox row | `display: flex; flex-wrap: wrap;` |
| `.col` | Column element | `flex: 1 0; padding: 0 var(--ifm-spacing-horizontal);` |
| `.tableOfContents` | Right TOC | `position: sticky; top: calc(var(--ifm-navbar-height) + 1rem);` |

### Stable Theme Class Names (Public API)

```css
.theme-doc-sidebar-container  /* Left sidebar container */
.theme-doc-sidebar-menu       /* Sidebar menu */
.theme-doc-toc-desktop        /* Desktop TOC */
.theme-doc-toc-mobile         /* Mobile TOC */
.theme-doc-breadcrumbs        /* Breadcrumb navigation */
.docs-doc-page                /* Main docs page wrapper */
```

---

## 2. CSS Variables Available

### Layout Variables

```css
--ifm-container-width: 1140px;      /* Default container max-width */
--doc-sidebar-width: 300px;          /* Left sidebar width */
--doc-sidebar-hidden-width: 30px;    /* Collapsed sidebar width */
--ifm-navbar-height: 3.75rem;        /* Navbar height */
```

### Spacing Variables

```css
--ifm-global-spacing: 1rem;
--ifm-spacing-vertical: 1rem;
--ifm-spacing-horizontal: 1rem;
```

### Project Current Overrides (src/css/custom.css)

```css
--ifm-container-width: 800px;        /* Already reduced for readability */
```

---

## 3. Implementation Strategy

### Decision: CSS Custom Properties + Container Wrapper Approach

**Rationale**: This approach allows centering the entire docs layout (nav + content + TOC) as a unit while maintaining the internal flexbox structure.

**Alternatives Considered**:

| Approach | Rejected Because |
|----------|------------------|
| Component swizzling | Adds maintenance burden, not CSS-only |
| JavaScript layout | Violates simplicity-first principle |
| Flexbox on body | Would affect non-docs pages |

### CSS Implementation Pattern

```css
/* === Content-Centered Layout === */

/* Define layout variables */
:root {
  --layout-max-width: 1400px;        /* Total layout width */
  --layout-content-width: 800px;      /* Content column width */
  --layout-sidebar-width: 260px;      /* Navigation width */
  --layout-toc-width: 220px;          /* TOC width */
  --layout-gap: 24px;                 /* Gap between elements */
}

/* Center the entire docs layout on wide screens */
@media (min-width: 997px) {
  .docsWrapper {
    justify-content: center;
  }

  .docRoot {
    max-width: var(--layout-max-width);
    margin: 0 auto;
  }

  /* Constrain sidebar width */
  .docSidebarContainer {
    width: var(--layout-sidebar-width);
    flex: 0 0 var(--layout-sidebar-width);
  }

  /* Center main content and limit width */
  .docMainContainer {
    max-width: calc(var(--layout-content-width) + var(--layout-toc-width) + var(--layout-gap));
  }
}

/* Responsive: tablet (768-996px) */
@media (min-width: 768px) and (max-width: 996px) {
  .docMainContainer .container {
    max-width: 100%;
    padding: 0 var(--ifm-spacing-horizontal);
  }
}

/* Mobile: full width */
@media (max-width: 767px) {
  .docMainContainer .container {
    max-width: 100%;
    padding: 0 1rem;
  }
}
```

---

## 4. Breakpoint Strategy

Based on Docusaurus defaults and spec requirements:

| Breakpoint | Layout | Behavior |
|------------|--------|----------|
| 1920px+ | Three-column centered | Nav + Content + TOC within 75% viewport |
| 1440px | Three-column centered | Proportional spacing |
| 1200px | Three-column | Reduced gaps |
| 996px | Three-column tight | Minimum spacing |
| 768-996px | Two-column | TOC collapses to mobile menu |
| <768px | Single column | Full mobile layout |

---

## 5. Key Findings

### What Works

1. **CSS-only approach is viable** - Docusaurus exposes sufficient CSS hooks
2. **No swizzling required** - All selectors are accessible via custom.css
3. **Variable system is extensible** - Can add custom variables alongside Infima
4. **Grid already exists** - Infima's 12-column grid handles internal layout

### Potential Issues

1. **Sidebar scroll behavior** - Need to preserve independent scrolling
2. **TOC sticky positioning** - Must not break with container changes
3. **Chat UI panel** - Uses fixed positioning, should be unaffected
4. **Print styles** - May need adjustment for centered layout

### Reference Implementations

Reviewed for inspiration:
- Claude Docs: Uses centered container with max-width
- OpenAI Docs: Similar three-column centered approach
- GitHub Docs: Content-focused with aligned sidebars

---

## 6. Summary

**Decision**: Implement CSS-only centered layout via `src/css/custom.css`

**Key Selectors to Target**:
- `.docRoot` - Apply max-width and centering
- `.docSidebarContainer` - Constrain sidebar width
- `.docMainContainer` - Limit content area width
- `.tableOfContents` - Maintain sticky positioning

**No Changes Needed To**:
- `src/theme/Root.tsx` - Chat UI integration unchanged
- `docusaurus.config.ts` - No config changes
- Component files - No swizzling required

**Files to Modify**:
- `src/css/custom.css` - All layout changes here
