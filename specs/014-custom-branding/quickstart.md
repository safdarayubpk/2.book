# Quickstart: Custom Branding Validation

**Feature**: 014-custom-branding
**Purpose**: Verify branding implementation meets all acceptance criteria

## Prerequisites

- Docusaurus dev server running (`npm start`)
- Access to light and dark mode toggle
- Desktop and mobile viewport testing capability

## Validation Checklist

### User Story 1: Custom Logo in Navbar (P1)

| Test | Steps | Expected Result | Pass? |
|------|-------|-----------------|-------|
| Logo displays | Navigate to any page | Custom logo visible in navbar, no green dinosaur | |
| Logo alt text | Inspect logo element | alt="Physical AI Textbook Logo" | |
| Logo sizing | View at desktop width | Logo clearly visible, not stretched/distorted | |
| Mobile logo | View at 375px width | Logo adapts appropriately for mobile header | |
| Logo click | Click on logo | Navigates to homepage | |

### User Story 2: Custom Favicon (P2)

| Test | Steps | Expected Result | Pass? |
|------|-------|-----------------|-------|
| Tab favicon | Open site in browser tab | Custom favicon visible in tab (not dinosaur) | |
| Favicon at 16px | Squint test or zoom out | Favicon still recognizable | |
| Bookmark favicon | Bookmark the page | Custom favicon appears in bookmark entry | |
| Multi-tab | Open multiple tabs | Favicon distinguishes this site | |

### User Story 3: Theme Consistency (P3)

| Test | Steps | Expected Result | Pass? |
|------|-------|-----------------|-------|
| Light mode | Set theme to light | Logo has good contrast, clearly visible | |
| Dark mode | Toggle to dark mode | Logo remains visible, no color clash | |
| Theme switch | Rapidly toggle themes | Logo transitions smoothly, no flickering | |
| Cohesive feel | Compare both modes | Branding feels intentional in both themes | |

### Edge Cases

| Test | Steps | Expected Result | Pass? |
|------|-------|-----------------|-------|
| Logo fallback | Temporarily rename logo.svg, reload | Text "Physical AI" should appear | |
| Wide screen | View at 2560px width | Logo does not stretch or distort | |
| Print view | Print preview | Logo renders appropriately | |

### Success Criteria Verification

| Criterion | Verification Method | Pass? |
|-----------|---------------------|-------|
| SC-001: 100% custom logo | Visit all 7 pages (intro + ch1-6), verify logo | |
| SC-002: Favicon on major browsers | Test Chrome, Firefox, Safari, Edge | |
| SC-003: Logo readable at 32px | Navbar logo height is ~32px and clear | |
| SC-004: No default branding | Search page source for "docusaurus" images | |
| SC-005: Light/dark mode support | Both themes tested above | |
| SC-006: Professional appearance | Visual review by tester | |

## Quick Test Commands

```bash
# Start dev server
npm start

# Build and preview production
npm run build && npm run serve

# Check static assets
ls -la static/img/logo.svg static/img/favicon.ico

# Verify no default branding in build
grep -r "docusaurus" build/img/ 2>/dev/null || echo "Clean: no default images"
```

## Browser Testing Matrix

| Browser | Desktop | Mobile | Tab Favicon | Notes |
|---------|---------|--------|-------------|-------|
| Chrome | | | | |
| Firefox | | | | |
| Safari | | | | |
| Edge | | | | |

## Sign-Off

- [ ] All User Story tests pass
- [ ] All Edge Case tests pass
- [ ] All Success Criteria verified
- [ ] Browser matrix completed
- [ ] Ready for production deploy

**Tested by**: _______________
**Date**: _______________
