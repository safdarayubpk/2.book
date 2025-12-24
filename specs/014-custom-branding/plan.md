# Implementation Plan: Custom Branding for Physical AI Textbook

**Branch**: `014-custom-branding` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-custom-branding/spec.md`

## Summary

Replace default Docusaurus branding (green dinosaur logo and favicon) with custom branding that communicates high-tech sophistication, academic credibility, and humanoid robotics identity. Implementation involves creating SVG logo and ICO favicon assets with cyan/teal color palette, then updating static files in the existing Docusaurus structure.

## Technical Context

**Language/Version**: SVG (for logo), ICO/PNG (for favicon)
**Primary Dependencies**: Docusaurus 3.x (existing), Infima CSS (built-in theme)
**Storage**: Static files in `/static/img/`
**Testing**: Manual visual testing (light/dark modes, responsive)
**Target Platform**: Web (all modern browsers)
**Project Type**: Static asset replacement (no code changes)
**Performance Goals**: N/A (static assets)
**Constraints**: Logo must be recognizable at 32px height; favicon at 16x16
**Scale/Scope**: 2 files to replace (logo.svg, favicon.ico)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature is a static asset replacement with no code changes. Constitution check is minimal:

| Principle | Status | Notes |
|-----------|--------|-------|
| Simplicity First | PASS | No code changes, just asset replacement |
| Minimal Dependencies | PASS | No new dependencies |
| Clear Boundaries | PASS | Scope limited to logo + favicon |
| Test Coverage | N/A | Static assets, manual verification only |
| Documentation | PASS | Research.md documents design decisions |
| Error Handling | N/A | No code involved |
| Performance | PASS | SVG is efficient, ICO is standard |
| Security | PASS | No security implications |

## Project Structure

### Documentation (this feature)

```text
specs/014-custom-branding/
├── plan.md              # This file
├── research.md          # Design decisions and color palette
├── quickstart.md        # Validation checklist
└── tasks.md             # Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
static/
└── img/
    ├── logo.svg         # REPLACE: Custom Physical AI logo
    ├── favicon.ico      # REPLACE: Custom favicon
    └── [no config changes needed - existing paths work]

docusaurus.config.ts     # NO CHANGES (existing config already correct)
```

**Structure Decision**: Static asset replacement only. No new directories or code files needed. Existing Docusaurus configuration already points to `img/logo.svg` and `img/favicon.ico`.

## Design Decisions (from research.md)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Logo form | Icon-only | Navbar title already shows text |
| Visual motif | Geometric humanoid | Represents Physical AI theme |
| Color palette | Cyan #0891B2 | Tech sophistication, academic tone |
| Dark mode | Single adaptive SVG | Simpler than dual files |
| Favicon format | ICO 32x32 | Maximum compatibility |

## Implementation Phases

### Phase 1: Audit (Remove Default Branding)
- Document current default assets
- Back up originals (optional)
- Verify configuration paths

### Phase 2: Foundation (Create Assets)
- Design logo SVG with humanoid motif
- Create favicon from simplified logo
- Test visibility at target sizes

### Phase 3: Implementation (Deploy Assets)
- Replace logo.svg in static/img/
- Replace favicon.ico in static/img/
- Build and verify

### Phase 4: Validation (UX Testing)
- Test light mode appearance
- Test dark mode appearance
- Test mobile viewport
- Test browser tab/bookmarks
- Verify no default Docusaurus branding remains

## Complexity Tracking

> No constitution violations - simple static asset replacement.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| Files changed | 2 | logo.svg, favicon.ico |
| Code changes | 0 | None required |
| Dependencies | 0 | None added |
| Risk | Low | Reversible by restoring originals |
