# Quickstart: Content-Centered Layout Verification

**Feature**: 008-content-centered-layout
**Date**: 2025-12-16

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)

## Build & Serve

```bash
# Build the site
npm run build

# Serve locally
npm run serve -- --port 3000
```

## Verification Steps

### 1. Desktop Layout (1920px+)

**Test**: Open http://localhost:3000/docs/intro in a browser window at 1920px width.

**Expected Results**:
- [ ] Content area is horizontally centered
- [ ] Layout (nav + content + TOC) occupies ~75% of viewport width
- [ ] Left sidebar is adjacent to content, not at viewport edge
- [ ] Right TOC is adjacent to content, not at viewport edge
- [ ] Content line length is 70-90 characters
- [ ] Spacing between elements is 24-32px

### 2. Large Desktop (1440px)

**Test**: Resize browser to 1440px width.

**Expected Results**:
- [ ] Three-column layout preserved
- [ ] Content remains centered
- [ ] Sidebars maintain proximity to content

### 3. Desktop (1200px)

**Test**: Resize browser to 1200px width.

**Expected Results**:
- [ ] Three-column layout preserved with reduced spacing
- [ ] No horizontal scroll
- [ ] Content readable without eye strain

### 4. Tablet (996px breakpoint)

**Test**: Resize browser to 996px width.

**Expected Results**:
- [ ] TOC transitions to collapsed/mobile state
- [ ] Navigation sidebar still visible
- [ ] Content takes more horizontal space

### 5. Mobile (768px)

**Test**: Resize browser to 768px width.

**Expected Results**:
- [ ] Navigation becomes mobile menu (hamburger)
- [ ] TOC accessible via mobile toggle
- [ ] Content takes full width with margins
- [ ] All text readable without horizontal scroll

### 6. Existing Features Check

**Test**: Navigate through various docs pages.

**Expected Results**:
- [ ] Chat UI FAB button visible in bottom-right
- [ ] Chat panel opens correctly and overlays content
- [ ] Theme toggle (dark/light) works
- [ ] Search functionality works
- [ ] Navigation links work correctly

### 7. Edge Cases

**Short Content Page**:
- [ ] Sidebars maintain position with short content

**Long Content Page**:
- [ ] Navigation scrolls independently
- [ ] TOC remains sticky
- [ ] Content scrolls normally

**Page Without TOC** (if any):
- [ ] Layout remains balanced without TOC

### 8. Performance Check

**Test**: Open Chrome DevTools > Performance tab, reload page.

**Expected Results**:
- [ ] No layout shift (CLS should be 0)
- [ ] Page renders in under 3 seconds

## Success Criteria Summary

| Criterion | Target | Verification |
|-----------|--------|--------------|
| Layout width at 1920px | ~75% viewport | Browser DevTools |
| Content line length | 70-90 chars | Visual inspection |
| Sidebar spacing | 24-32px | DevTools measurement |
| Breakpoints working | All 5 tested | Resize testing |
| No regressions | Chat UI, theme, search | Manual testing |
| Performance | <50ms impact, CLS=0 | DevTools Performance |

## Troubleshooting

### Layout not centered

Check `src/css/custom.css` for:
```css
.docRoot {
  max-width: var(--layout-max-width);
  margin: 0 auto;
}
```

### Sidebar at viewport edge

Ensure `.docSidebarContainer` has constrained width:
```css
.docSidebarContainer {
  width: var(--layout-sidebar-width);
  flex: 0 0 var(--layout-sidebar-width);
}
```

### TOC floating to edge

Check TOC container styling maintains proximity to content area.

### Chat UI broken

The Chat UI uses fixed positioning and should be unaffected. If broken, check z-index conflicts in new CSS.
