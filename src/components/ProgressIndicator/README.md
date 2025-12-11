# ProgressIndicator Component

A progress tracking component for the Physical AI & Humanoid Robotics textbook.

## Current Status

**Stubbed** - This component is currently stubbed with placeholder UI. Full functionality requires the auth feature to be implemented.

## Usage

### Basic Usage (Stubbed)

```tsx
import ProgressIndicator from '@site/src/components/ProgressIndicator';

// Shows "Login to track progress" message
<ProgressIndicator />
```

### With Progress Data (Authenticated)

```tsx
import ProgressIndicator, { ProgressData } from '@site/src/components/ProgressIndicator';

const progress: ProgressData = {
  totalChapters: 6,
  completedChapters: 3,
  completedChapterIds: ['chapter-1', 'chapter-2', 'chapter-3'],
  isAuthenticated: true,
};

<ProgressIndicator progress={progress} />
```

### Compact Variant

```tsx
<ProgressIndicator variant="compact" />
```

### Without Login Prompt

```tsx
<ProgressIndicator showLoginPrompt={false} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | `ProgressData` | stubbed data | Progress data from auth system |
| `variant` | `'compact' \| 'full'` | `'full'` | Display variant |
| `showLoginPrompt` | `boolean` | `true` | Show login prompt when not authenticated |

## ProgressData Interface

```typescript
interface ProgressData {
  /** Total number of chapters in the textbook */
  totalChapters: number;

  /** Number of chapters the user has completed */
  completedChapters: number;

  /** Array of chapter IDs that have been completed */
  completedChapterIds: string[];

  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}
```

## API Contract for Auth Feature

When implementing the auth feature, the following API is expected:

### Endpoint: GET /api/progress

Returns the user's reading progress.

**Response:**
```json
{
  "totalChapters": 6,
  "completedChapters": 3,
  "completedChapterIds": ["chapter-1", "chapter-2", "chapter-3"],
  "isAuthenticated": true
}
```

### Endpoint: POST /api/progress/complete

Marks a chapter as completed.

**Request Body:**
```json
{
  "chapterId": "chapter-4"
}
```

**Response:**
```json
{
  "success": true,
  "completedChapters": 4,
  "completedChapterIds": ["chapter-1", "chapter-2", "chapter-3", "chapter-4"]
}
```

## Integration Points

### Landing Page

The ProgressIndicator is displayed on the landing page (`src/pages/index.tsx`) above the Table of Contents.

### Sidebar Integration (Future)

To add ProgressIndicator to the docs sidebar:

1. Swizzle the DocSidebar component:
   ```bash
   npm run swizzle @docusaurus/theme-classic DocSidebar -- --wrap
   ```

2. Import and add ProgressIndicator to the swizzled component:
   ```tsx
   import ProgressIndicator from '@site/src/components/ProgressIndicator';

   // Add at the top of the sidebar
   <ProgressIndicator variant="compact" />
   ```

### Chapter Completion Tracking (Future)

When auth is implemented, each chapter page should call the progress API when the user reaches the end of the chapter. This can be done by:

1. Creating a `useProgressTracking` hook
2. Using Intersection Observer to detect when user scrolls to chapter end
3. Calling POST /api/progress/complete with the chapter ID

## Styling

Styles are in `styles.module.css`. Key features:

- Mobile-friendly with 44x44px touch targets
- Responsive layout for all screen sizes
- Dark mode support
- Accessible with proper ARIA attributes

## Dependencies

- React 18+
- Docusaurus 3.x
- CSS Modules

## Future Enhancements

1. **Real-time Updates**: Use WebSocket or polling to sync progress across tabs
2. **Offline Support**: Cache progress in localStorage, sync when online
3. **Reading Streaks**: Track consecutive days of reading
4. **Achievements**: Award badges for completing milestones
