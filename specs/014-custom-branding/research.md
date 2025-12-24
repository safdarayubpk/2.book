# Research: Custom Branding for Physical AI Textbook

**Feature**: 014-custom-branding
**Date**: 2025-12-24
**Status**: Decisions Finalized

## Current State Analysis

### Existing Assets (static/img/)
- `logo.svg` - Default Docusaurus green dinosaur mascot (6.4KB)
- `favicon.ico` - Default Docusaurus favicon (32x27, 3.6KB)
- `docusaurus-social-card.jpg` - Default social card

### Current Configuration (docusaurus.config.ts)
```typescript
favicon: 'img/favicon.ico',
navbar: {
  title: 'Physical AI & Humanoid Robotics',
  logo: {
    alt: 'Physical AI Textbook Logo',
    src: 'img/logo.svg',
  },
}
```

### Issues to Address
1. Logo is generic Docusaurus branding - no connection to robotics/AI
2. Favicon is default dinosaur - not recognizable for textbook
3. No dark mode variant configured
4. Social card may need updating for brand consistency

## Design Decisions

### Decision 1: Logo Form Factor

**Question**: Icon-only logo or icon + wordmark combination?

| Option | Pros | Cons |
|--------|------|------|
| Icon-only | Clean, works at all sizes, modern | May need title text in navbar |
| Icon + wordmark | Self-explanatory, complete branding | Complex at small sizes, redundant with navbar title |

**Decision**: **Icon-only logo**

**Rationale**:
- Docusaurus already displays navbar title "Physical AI & Humanoid Robotics" next to logo
- Icon-only is cleaner and scales better
- Matches academic textbook conventions (minimal, professional)
- Works identically in light/dark modes when designed correctly

### Decision 2: Visual Motif

**Question**: What visual element best represents Physical AI & Humanoid Robotics?

| Option | Description | Academic Appeal |
|--------|-------------|-----------------|
| Humanoid silhouette | Abstract robot figure | Strong - immediately recognizable |
| Abstract geometry | Hexagon, circuit patterns | Moderate - techy but generic |
| Neural network | Nodes and connections | Good - AI focused but overused |
| Mechanical joint | Robot arm/joint abstraction | Good - physical AI specific |

**Decision**: **Humanoid silhouette with geometric abstraction**

**Rationale**:
- Directly represents "Humanoid Robotics" from the textbook title
- Can be simplified to geometric shapes for scalability
- Professional and academic in appearance
- Distinctive at favicon sizes (16x16, 32x32)

### Decision 3: Color Palette

**Question**: What colors communicate high-tech sophistication?

| Palette | Colors | Usage |
|---------|--------|-------|
| Primary | #0891B2 (Cyan-600) | Main brand color, icon fill |
| Accent | #06B6D4 (Cyan-500) | Highlights, gradients |
| Neutral | #1E293B (Slate-800) | Dark mode compatibility |
| Light text | #F1F5F9 (Slate-100) | Contrast for dark backgrounds |

**Decision**: **Cyan/teal palette with slate neutral**

**Rationale**:
- Cool blues/cyans suggest technology and sophistication
- Academic and professional tone
- Good contrast in both light and dark modes
- Differentiates from green Docusaurus default

### Decision 4: Dark Mode Strategy

**Question**: How to handle logo visibility in dark mode?

| Approach | Implementation | Complexity |
|----------|----------------|------------|
| Single adaptive SVG | Use CSS variables or transparent design | Low |
| Dual logo files | logo.svg + logo-dark.svg with config | Medium |
| CSS filter inversion | Apply filter to existing logo | Low but hacky |

**Decision**: **Single adaptive SVG with transparent background**

**Rationale**:
- Docusaurus supports `srcDark` config option but adds complexity
- Designing logo with sufficient contrast for both modes is cleaner
- Cyan/white combination works on both light and dark backgrounds
- Single file is easier to maintain

### Decision 5: Favicon Format

**Question**: Which favicon formats to generate?

| Format | Size | Use Case |
|--------|------|----------|
| ICO | 32x32 multi-size | Legacy browser tab |
| PNG 16x16 | 16x16 | Small tab displays |
| PNG 32x32 | 32x32 | Standard tab displays |
| PNG 192x192 | 192x192 | Android home screen |
| SVG | Scalable | Modern browsers |

**Decision**: **ICO (32x32) + SVG favicon**

**Rationale**:
- Hackathon scope: minimal formats needed
- ICO for broad compatibility
- Can add SVG favicon for modern browsers if time permits
- Skip Apple touch icons (not in scope per spec)

## Design Specifications

### Logo Design

**Concept**: Simplified humanoid figure in geometric style

**Elements**:
1. Abstract head: Circle or rounded hexagon
2. Body: Minimal torso shape
3. Circuit detail: Single line suggesting connectivity
4. Clean silhouette that works at 32px height

**SVG Requirements**:
- ViewBox: 200x200 (scalable)
- Stroke-based for crisp edges
- Primary color: #0891B2 (Cyan-600)
- Accent: #06B6D4 (Cyan-500) for subtle gradient/highlight
- No background (transparent)

### Favicon Design

**Approach**: Simplified version of logo icon

**Requirements**:
- Must be recognizable at 16x16
- Simple shape: just the head/core element
- High contrast for tab visibility
- Solid fill for clarity at small sizes

## File Structure

```text
static/img/
├── logo.svg           # Replace: Custom Physical AI logo
├── favicon.ico        # Replace: Custom favicon (32x32)
├── favicon.svg        # New: SVG favicon for modern browsers (optional)
└── logo-backup/       # Optional: Backup of original Docusaurus assets
    ├── logo-original.svg
    └── favicon-original.ico
```

## Configuration Changes

### docusaurus.config.ts updates

```typescript
// Update themeConfig
themeConfig: {
  navbar: {
    title: 'Physical AI & Humanoid Robotics',
    logo: {
      alt: 'Physical AI Textbook Logo',
      src: 'img/logo.svg',
      // Optional: srcDark: 'img/logo.svg', // Same file if adaptive
    },
  },
  // Social card will use existing path but file updated
  image: 'img/social-card.jpg', // Future: update social card
}
```

### Minimal Configuration

No code changes needed to docusaurus.config.ts if files are replaced in-place:
- Replace `static/img/logo.svg` with custom logo
- Replace `static/img/favicon.ico` with custom favicon
- Existing config already points to correct paths

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Logo doesn't render properly | Low | Medium | Test in dev before deploy |
| Favicon not recognized | Low | Low | Use standard ICO format |
| Dark mode contrast issues | Medium | Medium | Test both themes during development |
| Build cache showing old assets | Medium | Low | Clear cache, hard refresh |

## Out of Scope

Per spec assumptions:
- Apple touch icons
- Android manifest icons
- Social card redesign (future enhancement)
- Full theme color customization
- Mascot or character branding

## Validation Checklist (Phase 0 Complete)

- [x] Design decisions documented
- [x] Color palette defined
- [x] Logo concept specified
- [x] Favicon requirements clear
- [x] File structure planned
- [x] Configuration changes identified
- [x] Risks assessed
