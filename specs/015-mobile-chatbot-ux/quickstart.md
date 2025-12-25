# Quickstart: Mobile Chatbot UX Validation

**Feature**: 015-mobile-chatbot-ux
**Purpose**: Verify mobile UX fixes for Ask AI chatbot

## Prerequisites

- Development server running (`npm start`)
- Access to mobile device OR browser DevTools mobile emulation
- iPhone and Android devices for final validation (recommended)

## Quick Test Commands

```bash
# Start dev server
npm start

# Build and preview production
npm run build && npm run serve
```

## Testing Checklist

### User Story 1: Send Button Visible on Mobile (P1)

| Test | Device/Viewport | Steps | Expected Result | Pass? |
|------|-----------------|-------|-----------------|-------|
| Basic visibility | 375px width | Open chatbot drawer | Send button fully visible at bottom | |
| Browser toolbar | iOS Safari | Open chatbot with address bar visible | Bottom not cut off | |
| Home indicator | iPhone X+ | Open chatbot | Input has padding above home indicator | |
| Full width | 375px | Open chatbot | Drawer spans full viewport width | |

### User Story 2: Keyboard Handling (P2)

| Test | Device/Viewport | Steps | Expected Result | Pass? |
|------|-----------------|-------|-----------------|-------|
| Keyboard appears | Real mobile | Tap input field | Input scrolls above keyboard | |
| Keyboard + counter | Real mobile | Type with keyboard open | Character counter visible | |
| Keyboard + send | Real mobile | Type with keyboard open | Send button accessible | |
| Keyboard dismiss | Real mobile | Tap outside input | Input returns to bottom position | |
| No iOS zoom | iPhone | Tap input field | No automatic zoom-in on text | |

### User Story 3: Character Counter Visibility (P3)

| Test | Device/Viewport | Steps | Expected Result | Pass? |
|------|-----------------|-------|-----------------|-------|
| Counter visible | 375px | Open chatbot | Character counter shown | |
| Counter updates | 375px | Type message | Counter updates in real-time | |
| Near limit | 375px | Type long message | Counter shows warning color | |

### Edge Cases

| Test | Device/Viewport | Steps | Expected Result | Pass? |
|------|-----------------|-------|-----------------|-------|
| Small screen | 320px | Open chatbot | Input area functional | |
| Landscape | Rotate device | Open chatbot in landscape | Layout adapts | |
| Tablet portrait | iPad 768px | Open chatbot | Works correctly | |
| Dark mode | Toggle theme | Open chatbot in dark mode | All elements visible | |

### Regression Tests

| Test | Viewport | Steps | Expected Result | Pass? |
|------|----------|-------|-----------------|-------|
| Desktop unchanged | 1280px | Open chatbot | No visual changes from before | |
| Sidebar + chat | 1280px | Open sidebar and chat together | Both work correctly | |

## Browser DevTools Quick Test

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or "iPhone SE"
4. Navigate to any chapter
5. Click "Ask AI" button
6. Verify:
   - Drawer height fits viewport (no scrollbar on drawer itself)
   - Send button visible at bottom
   - Character counter visible
   - Type a message - input stays visible

## Real Device Testing

### iOS Safari (iPhone)

1. Open site on iPhone
2. Note: Safari has dynamic address bar
3. Open chatbot drawer
4. Verify bottom elements visible even with address bar collapsed
5. Tap input - verify keyboard doesn't hide it
6. On iPhone X+: verify safe area padding above home indicator

### Chrome Android

1. Open site on Android phone
2. Open chatbot drawer
3. Verify Send button visible
4. Tap input - verify keyboard handling
5. Send a test message - verify it works

## Success Criteria Validation

| Criterion | Verification Method | Pass? |
|-----------|---------------------|-------|
| SC-001: 100% mobile users see Send button | Test on 3 mobile viewports | |
| SC-002: Input visible with keyboard | Test on real iOS and Android | |
| SC-003: Counter visible on 375px+ | Test on iPhone SE width | |
| SC-004: Zero desktop regressions | Test on 996px+ viewport | |
| SC-005: Works with notch/home indicator | Test on iPhone X+ | |

## Sign-Off

- [ ] All User Story tests pass
- [ ] All Edge Case tests pass
- [ ] All Regression tests pass
- [ ] Success Criteria verified
- [ ] Ready for production deploy

**Tested by**: _______________
**Date**: _______________
**Devices tested**: _______________
