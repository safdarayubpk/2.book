# Data Model: Content-Centered Layout

**Date**: 2025-12-16
**Feature**: 008-content-centered-layout

## Overview

This feature is **CSS-only** and does not introduce any data models, state, or database entities.

## Entities

**N/A** - No entities defined for this feature.

## Rationale

The content-centered layout feature:
- Modifies only visual presentation via CSS
- Does not persist any user preferences
- Does not require component state
- Does not interact with backend APIs

All layout behavior is determined by:
1. CSS custom properties (variables)
2. Media queries for responsive breakpoints
3. Flexbox layout rules

## CSS Configuration Entities (Design-Time)

For documentation purposes, the conceptual "entities" are CSS variables:

```css
/* Layout Configuration */
--layout-max-width: 1400px;      /* Total layout max width */
--layout-content-width: 800px;    /* Content column max width */
--layout-sidebar-width: 260px;    /* Navigation sidebar width */
--layout-toc-width: 220px;        /* TOC sidebar width */
--layout-gap: 24px;               /* Gap between elements */
```

These are not runtime entities but design-time constants defined in `src/css/custom.css`.
