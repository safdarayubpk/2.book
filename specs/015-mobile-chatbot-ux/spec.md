# Feature Specification: Mobile UX Optimization for Ask AI Chatbot

**Feature Branch**: `015-mobile-chatbot-ux`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "Mobile UX Optimization for Ask AI Chatbot - Resolving bottom-of-screen cutoff to ensure Send Button and Character Counter are visible on all mobile viewports."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Button Visible on Mobile (Priority: P1)

As a mobile user reading the Physical AI textbook, I want to see the Send button and input area at the bottom of the chatbot drawer without it being cut off by browser toolbars or device UI elements, so that I can easily submit my questions to the AI assistant.

**Why this priority**: This is the core usability issue - users cannot interact with the chatbot if the Send button is hidden. Without this fix, the feature is essentially broken on mobile devices.

**Independent Test**: Open the chatbot drawer on a mobile device (or mobile emulator), verify the Send button is fully visible without scrolling, and successfully send a message.

**Acceptance Scenarios**:

1. **Given** I am on a mobile device viewing the textbook, **When** I open the Ask AI chatbot drawer, **Then** the Send button and input field are fully visible at the bottom of the screen.
2. **Given** I am on a mobile device with browser address bar visible, **When** I open the chatbot drawer, **Then** the bottom interface elements are not hidden behind browser UI.
3. **Given** I am on an iPhone with home indicator bar, **When** I open the chatbot drawer, **Then** the input area has sufficient padding to avoid the home indicator.

---

### User Story 2 - Input Stays Visible with Keyboard (Priority: P2)

As a mobile user typing a question, I want the input field to remain visible and accessible when the software keyboard appears, so that I can see what I'm typing without the keyboard covering the input area.

**Why this priority**: After ensuring basic visibility (P1), keyboard interaction is the next critical mobile usability issue. Users type questions frequently and need to see the input field.

**Independent Test**: Tap the chat input field on a mobile device, verify the input stays visible above the keyboard, and type a question successfully.

**Acceptance Scenarios**:

1. **Given** I am on a mobile device with the chatbot open, **When** I tap the input field and the keyboard appears, **Then** the input field scrolls into view above the keyboard.
2. **Given** I am typing a message on mobile, **When** the keyboard is active, **Then** I can see the character counter and Send button while typing.
3. **Given** I am on a mobile device, **When** I dismiss the keyboard, **Then** the input field returns to its normal position at the bottom of the drawer.

---

### User Story 3 - Character Counter Visibility (Priority: P3)

As a mobile user composing a longer question, I want to see the character counter clearly visible next to the input field, so that I know when I'm approaching the message length limit.

**Why this priority**: Character counter visibility is important for user experience but secondary to basic interaction (sending messages). Users can still use the chatbot without seeing the counter.

**Independent Test**: Open chatbot on mobile, type a message, and verify the character counter is visible and updates as you type.

**Acceptance Scenarios**:

1. **Given** I am on a mobile device with the chatbot open, **When** I look at the input area, **Then** the character counter is visible without scrolling.
2. **Given** I am typing a message on mobile, **When** the message length changes, **Then** the character counter updates in real-time and remains visible.

---

### Edge Cases

- What happens on very small screens (320px width)? → Input area should still be functional with minimum viable layout.
- What happens when user rotates device (landscape)? → Layout should adapt while maintaining input visibility.
- What happens on tablets in portrait vs landscape? → Chatbot should work correctly in both orientations.
- What happens with older browsers without dynamic viewport support? → Fallback to standard viewport units with reasonable degradation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chatbot drawer MUST use dynamic viewport height to account for mobile browser UI elements.
- **FR-002**: Send button and character counter MUST be fully visible on standard mobile screens without extra scrolling.
- **FR-003**: Chat input container MUST be pinned to the bottom of the viewport.
- **FR-004**: Bottom padding MUST accommodate device safe areas (home indicators, gesture bars).
- **FR-005**: Input field MUST remain visible and functional when software keyboard is active.
- **FR-006**: Message history area MUST be scrollable while input area remains fixed.
- **FR-007**: Mobile-specific styling MUST only apply to viewports under 996px width to avoid affecting desktop layout.
- **FR-008**: Desktop chatbot layout MUST remain unchanged by these mobile optimizations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of mobile users can see the Send button without scrolling when chatbot drawer is open.
- **SC-002**: Input field remains visible during keyboard interaction on iOS Safari and Android Chrome.
- **SC-003**: Character counter is visible on mobile screens with width 375px or greater.
- **SC-004**: Zero visual regressions on desktop chatbot layout (screens 996px and wider).
- **SC-005**: Chatbot is usable on devices with notches and home indicators (iPhone X and later, modern Android devices).

## Assumptions

- The existing chatbot drawer component can be modified via CSS without structural changes to the React component.
- Docusaurus breakpoint of 996px is appropriate for distinguishing mobile from desktop.
- Standard mobile devices have minimum width of 320px; primary target is 375px (iPhone SE and larger).
- Browser support includes Safari iOS 15+, Chrome Android 90+, and other modern mobile browsers.
- The fix will use CSS-only solutions where possible to minimize JavaScript complexity.
