# Research: Mobile UX Optimization for Ask AI Chatbot

**Feature**: 015-mobile-chatbot-ux
**Date**: 2025-12-25
**Status**: Analysis Complete

## Current State Analysis

### ChatPanel Structure (styles.module.css)

```css
/* Current problematic code */
.chatPanel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100vw;
  height: 100vh;           /* ❌ PROBLEM: Doesn't account for browser UI */
  display: flex;
  flex-direction: column;  /* ✅ Already flexbox column */
  z-index: 1000;
}
```

### Existing Mobile Styles

```css
@media (max-width: 768px) {
  .chatPanel {
    width: 100vw;          /* ✅ Full width on mobile */
    /* ❌ No height fix */
  }
}
```

### ChatInput Structure (ChatInput.styles.module.css)

```css
.inputContainer {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-top: 1px solid var(--ifm-color-emphasis-200);
  background: var(--ifm-background-color);
  /* ❌ Missing: flex-shrink: 0 */
  /* ❌ Missing: safe-area-inset-bottom */
}
```

## CSS Solutions Research

### Decision 1: Dynamic Viewport Height

**Question**: How to handle mobile browser UI (address bar, bottom toolbar)?

| Option | CSS | Browser Support | Recommendation |
|--------|-----|-----------------|----------------|
| 100vh | `height: 100vh` | Universal | Breaks on mobile |
| 100dvh | `height: 100dvh` | Safari 15.4+, Chrome 108+ | Best for modern mobile |
| 100svh | `height: 100svh` | Safari 15.4+, Chrome 108+ | Smallest viewport |
| 100lvh | `height: 100lvh` | Safari 15.4+, Chrome 108+ | Largest viewport |

**Decision**: Use `100dvh` with `100vh` fallback

**Rationale**:
- `100dvh` (dynamic viewport height) adjusts when browser UI appears/disappears
- Fallback ensures older browsers still work
- Safari 15.4+ and Chrome 108+ cover majority of modern mobile users

**Implementation**:
```css
@media (max-width: 996px) {
  .chatPanel {
    height: 100vh;        /* Fallback for older browsers */
    height: 100dvh;       /* Modern browsers - dynamic viewport */
  }
}
```

### Decision 2: Safe Area Insets

**Question**: How to handle iPhone notch and home indicator?

| Method | CSS | Notes |
|--------|-----|-------|
| env() | `padding-bottom: env(safe-area-inset-bottom, 16px)` | Native CSS, recommended |
| constant() | `padding-bottom: constant(safe-area-inset-bottom)` | Legacy iOS 11.0-11.2 |
| Fixed padding | `padding-bottom: 34px` | Hardcoded, not adaptive |

**Decision**: Use `env()` with fallback value

**Rationale**:
- `env(safe-area-inset-bottom, 16px)` provides 16px default when safe area not applicable
- Works on all iPhones with notch/home indicator
- Graceful degradation on Android and older iOS

**Implementation**:
```css
.inputContainer {
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
}
```

### Decision 3: Keyboard Visibility

**Question**: How to keep input visible when software keyboard appears?

| Approach | Implementation | Complexity |
|----------|----------------|------------|
| CSS `position: sticky` | `position: sticky; bottom: 0` | Low |
| Visual Viewport API | JavaScript listener | Medium |
| CSS env() | `padding-bottom: env(keyboard-inset-height, 0px)` | Experimental |

**Decision**: Use flexbox with flex-shrink: 0

**Rationale**:
- The existing flexbox layout already handles this well
- Ensuring `flex-shrink: 0` on header and input keeps them fixed
- `flex: 1` on messages allows scrolling in the middle
- iOS Safari and Chrome handle keyboard visibility with existing layout

**Implementation**:
```css
.header { flex-shrink: 0; }           /* Already present */
.messagesContainer { flex: 1; overflow-y: auto; }  /* Already present */
.inputContainer { flex-shrink: 0; }   /* ADD THIS */
```

### Decision 4: iOS Zoom Prevention

**Question**: How to prevent iOS from zooming when tapping input?

**Issue**: iOS Safari zooms in on inputs with font-size < 16px

**Decision**: Ensure textarea has font-size: 16px minimum

**Implementation**:
```css
@media (max-width: 996px) {
  .textarea {
    font-size: 16px;  /* Prevent iOS auto-zoom */
  }
}
```

### Decision 5: Docusaurus Breakpoint

**Question**: Which breakpoint to use for mobile-specific styles?

| Breakpoint | Description | Used In |
|------------|-------------|---------|
| 768px | Common mobile/tablet split | ChatPanel existing |
| 996px | Docusaurus sidebar collapse | Theme default |
| 480px | Small mobile only | ChatPanel existing |

**Decision**: Use 996px as primary mobile breakpoint

**Rationale**:
- Matches Docusaurus sidebar behavior
- Consistent with other mobile overrides in custom.css
- Covers tablets in portrait mode which have similar issues

## CSS Implementation Plan

### File: src/components/ChatPanel/styles.module.css

**Add to existing @media (max-width: 768px) block or create new @media (max-width: 996px)**:

```css
@media (max-width: 996px) {
  .chatPanel {
    height: 100vh;        /* Fallback */
    height: 100dvh;       /* Dynamic viewport height */
  }
}
```

### File: src/components/ChatPanel/ChatInput.styles.module.css

**Add flex-shrink and safe area**:

```css
.inputContainer {
  /* ... existing styles ... */
  flex-shrink: 0;  /* ADD: Prevent collapse */
}

@media (max-width: 996px) {
  .inputContainer {
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  }

  .textarea {
    font-size: 16px;  /* Prevent iOS auto-zoom */
  }
}
```

### File: src/css/custom.css (optional global override)

```css
/* === Mobile Chatbot UX Fixes === */
/* Feature: 015-mobile-chatbot-ux */

@media (max-width: 996px) {
  /* Ensure chat panel respects dynamic viewport */
  .chat-panel {
    height: 100dvh;
  }
}
```

## Browser Compatibility

| Feature | Safari iOS | Chrome Android | Firefox | Samsung Internet |
|---------|-----------|----------------|---------|------------------|
| 100dvh | 15.4+ | 108+ | 101+ | 19+ |
| env(safe-area-inset-*) | 11.2+ | 69+ | 65+ | 7.2+ |
| Flexbox | All | All | All | All |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| dvh not supported | Low | Low | 100vh fallback included |
| Safe area breaks layout | Low | Medium | Test on real iPhone devices |
| Keyboard still hides input | Low | Medium | Flexbox layout verified |
| Desktop layout affected | Low | High | Media query scoping |

## Testing Devices

Recommended testing on:
1. iPhone SE (small screen, home button)
2. iPhone 12/13/14 (notch + home indicator)
3. iPhone 15 (Dynamic Island)
4. Android phone with Chrome (Pixel, Samsung Galaxy)
5. iPad in portrait mode

## Validation Checklist

- [ ] Send button visible on iPhone Safari
- [ ] Send button visible on Chrome Android
- [ ] Character counter visible on mobile
- [ ] Input stays visible when keyboard appears
- [ ] No iOS zoom when tapping input
- [ ] Safe area padding on iPhone X+
- [ ] Desktop layout unchanged
- [ ] Light/dark mode both work
