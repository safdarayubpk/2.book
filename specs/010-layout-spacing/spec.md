# Feature Specification: Docusaurus Layout Spacing & Sidebar Proximity Fix

**Feature Branch**: `010-layout-spacing`
**Created**: 2025-12-22
**Status**: Draft
**Input**: User description: "Reduce excessive horizontal spacing between left sidebar and main content, and main content and right-side TOC to improve readability, spatial cohesion, and navigation efficiency"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Wide Desktop Layout Optimization (Priority: P1)

A documentation user viewing the textbook on a wide desktop monitor (1920px) experiences a cohesive layout where the left navigation sidebar, main content, and right TOC appear visually connected rather than isolated in separate zones with excessive whitespace between them.

**Why this priority**: This is the core problem to solve. Wide-screen users currently see disconnected page elements due to excessive gutters, reducing information density and making navigation feel detached from content.

**Independent Test**: Can be fully tested by viewing any documentation page at 1920px viewport width and verifying that sidebars and content appear as a unified layout without excessive horizontal gaps.

**Acceptance Scenarios**:

1. **Given** a user viewing a doc page on a 1920px wide screen, **When** the page loads, **Then** the left sidebar appears within close visual proximity to the main content area (no large empty gap)
2. **Given** a user viewing a doc page on a 1920px wide screen, **When** the page loads, **Then** the right TOC appears within close visual proximity to the main content area
3. **Given** a user viewing the layout, **When** comparing left and right gutters, **Then** the spacing appears symmetric and balanced

---

### User Story 2 - Standard Desktop Layout (Priority: P1)

A documentation user viewing the textbook on a standard desktop monitor (1366px or 1440px) sees optimal spacing where content, navigation, and TOC work together as a unified information architecture without feeling cramped or disconnected.

**Why this priority**: These are the most common desktop viewport sizes. Layout must work well here as the baseline experience.

**Independent Test**: Can be fully tested by resizing browser to 1366px and 1440px widths and verifying balanced, readable layout with appropriate sidebar proximity.

**Acceptance Scenarios**:

1. **Given** a user on a 1366px screen, **When** viewing a doc page, **Then** all three columns (sidebar, content, TOC) fit comfortably without horizontal scroll
2. **Given** a user on a 1440px screen, **When** viewing a doc page, **Then** the content column has adequate reading width while sidebars remain accessible
3. **Given** a user on either screen size, **When** looking at the TOC, **Then** the TOC feels contextually linked to the heading it references (not floating in isolation)

---

### User Story 3 - Responsive Preservation (Priority: P2)

A documentation user accessing the textbook on a tablet (768px-996px) or mobile device continues to have the same functional layout experience with no regressions from spacing changes made for desktop viewports.

**Why this priority**: Must not break existing responsive behavior while fixing desktop spacing. This is a preservation constraint, not a new feature.

**Independent Test**: Can be tested by viewing pages at 768px (tablet) and 375px (mobile) viewport widths and verifying existing responsive behavior is unchanged.

**Acceptance Scenarios**:

1. **Given** a user on a tablet (768px-996px), **When** viewing a doc page, **Then** the TOC collapses appropriately and content remains readable
2. **Given** a user on mobile (<768px), **When** viewing a doc page, **Then** the single-column layout works without horizontal overflow
3. **Given** any viewport change, **When** resizing from desktop to tablet to mobile, **Then** layout transitions smoothly without visual glitches

---

### Edge Cases

- What happens when sidebar navigation has very long menu item text that might push into content area?
- How does the system handle ultra-wide viewports (2560px+) where spacing could still appear excessive?
- What happens when TOC has many headings causing vertical scroll - does spacing remain consistent?
- How does layout behave when browser zoom is applied (125%, 150%)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reduce the horizontal gap between left sidebar and main content area to create visual proximity
- **FR-002**: System MUST reduce the horizontal gap between main content area and right TOC to create visual proximity
- **FR-003**: System MUST maintain symmetric spacing between left and right gutters for balanced page framing
- **FR-004**: System MUST scale spacing proportionally on viewports wider than 1440px to prevent excessive whitespace
- **FR-005**: System MUST preserve existing responsive breakpoint behavior for tablet (768px-996px) and mobile (<768px)
- **FR-006**: System MUST allow content column to expand on wider viewports while respecting maximum readable line length
- **FR-007**: System MUST ensure TOC remains visually connected to its associated content headings
- **FR-008**: System MUST document all spacing values and their rationale for maintainability

### Constraints

- Changes limited to CSS overrides and theme configuration only
- No modifications to Docusaurus core functionality, routing, or component structure
- Existing sidebar collapse/expand behavior must be preserved
- No changes to information architecture or content hierarchy
- Must work within Docusaurus classic theme framework

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At 1920px viewport, horizontal gutters between sidebar-content and content-TOC are visibly reduced compared to current layout
- **SC-002**: At 1366px, 1440px, and 1920px viewports, left and right gutters appear symmetric (balanced visual weight)
- **SC-003**: Content column width on wide screens maintains optimal reading width (approximately 700-850 characters per line)
- **SC-004**: No horizontal scrollbar appears at any tested viewport (1366px, 1440px, 1920px)
- **SC-005**: No visual regressions at tablet (768px-996px) or mobile (<768px) breakpoints compared to current behavior
- **SC-006**: Users can identify which heading the TOC is referencing without excessive eye movement across whitespace
- **SC-007**: All spacing values are documented with rationale in code comments

### Assumptions

- Current layout variables are defined in `src/css/custom.css` with CSS custom properties
- Docusaurus classic theme uses standard class names (.docSidebarContainer, .docMainContainer, .theme-doc-toc-desktop)
- The existing 008-content-centered-layout feature provides the baseline layout structure to modify
- Standard browser zoom behavior (100%) is the primary target; zoom levels are secondary consideration
