# StreamVideoPlayer Component

A comprehensive HTML5 video player component designed for synchronized streaming sessions with host/participant controls.

## Features

### Core Functionality

- **HTML5 Video Player**: Custom-styled video element with full browser compatibility
- **Host/Participant Modes**: Different control permissions based on user role
- **Synchronized Playback**: Real-time state synchronization across all participants
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Full keyboard navigation support

### Video Controls

- **Play/Pause**: Space bar or click button
- **Seek**: Click progress bar or arrow keys (±10 seconds)
- **Volume**: Volume slider with mute toggle (M key)
- **Fullscreen**: F key or fullscreen button
- **Progress Bar**: Visual playback progress with time display

### States & Error Handling

- **Loading State**: Displays while video metadata loads
- **Error State**: Shows retry button when video fails to load
- **View-Only Mode**: Disabled controls for non-host participants
- **Connection Status**: Visual indicators for sync status

## Usage

```tsx
import { StreamVideoPlayer } from "@/features/streaming/components";

function StreamPage() {
  const handlePlaybackChange = (state: PlaybackState) => {
    // Handle playback state changes for synchronization
    console.log("Playback state:", state);
  };

  return (
    <StreamVideoPlayer
      streamId="stream-123"
      media={{
        tmdb_id: 550,
        media_type: "movie",
        media_title: "Fight Club",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        video_url: "https://example.com/video.mp4",
        runtime: 139,
      }}
      isHost={true}
      currentUserId="user-456"
      onPlaybackChange={handlePlaybackChange}
    />
  );
}
```

## Props

| Prop               | Type                             | Required | Description                                        |
| ------------------ | -------------------------------- | -------- | -------------------------------------------------- |
| `streamId`         | `string`                         | Yes      | Unique identifier for the streaming session        |
| `media`            | `StreamMedia`                    | Yes      | Media information including video URL and metadata |
| `isHost`           | `boolean`                        | Yes      | Whether current user has host control permissions  |
| `currentUserId`    | `string`                         | Yes      | Current user's ID for permission validation        |
| `onPlaybackChange` | `(state: PlaybackState) => void` | No       | Callback for playback state changes                |

## Types

### StreamMedia

```typescript
interface StreamMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  video_url?: string;
  runtime?: number;
}
```

### PlaybackState

```typescript
interface PlaybackState {
  time: number;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}
```

## Keyboard Shortcuts

| Key     | Action            | Host Only |
| ------- | ----------------- | --------- |
| `Space` | Play/Pause        | Yes       |
| `F`     | Toggle Fullscreen | No        |
| `M`     | Toggle Mute       | No        |
| `←`     | Seek backward 10s | Yes       |
| `→`     | Seek forward 10s  | Yes       |

## Accessibility

- **ARIA Labels**: All controls have descriptive labels
- **Keyboard Navigation**: Full keyboard support with focus indicators
- **Screen Reader Support**: Proper semantic markup and announcements
- **High Contrast**: Visible focus states and control indicators
- **Touch Friendly**: Larger touch targets on mobile devices

## Mobile Optimizations

- **Touch Controls**: Larger buttons and touch-friendly interactions
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Gesture Support**: Native video gestures (pinch to zoom, etc.)
- **Performance**: Optimized for mobile bandwidth and processing

## Error Handling

The component handles various error scenarios:

1. **Video Load Errors**: Shows retry button with error message
2. **Network Issues**: Graceful degradation with connection indicators
3. **Permission Errors**: Clear messaging about host-only controls
4. **Fullscreen Failures**: Fallback behavior when fullscreen unavailable

## Styling

The component uses CSS modules for styling with the following features:

- **Dark Theme**: Optimized for dark backgrounds
- **Smooth Animations**: Hover states and transitions
- **Glassmorphism**: Modern blur effects for overlays
- **Custom Controls**: Styled to match design system
- **Mobile Responsive**: Adaptive sizing and spacing

## Testing

Comprehensive test suite covering:

- **Rendering**: All controls and states render correctly
- **Interactions**: Click, keyboard, and touch interactions
- **Host/Participant**: Different permission levels
- **Error States**: Loading and error handling
- **Mobile**: Responsive behavior and optimizations

Run tests with:

```bash
npm run test src/features/streaming/components/__tests__/StreamVideoPlayer.test.tsx
```

## Storybook

Interactive documentation and testing available in Storybook:

```bash
npm run storybook
```

Navigate to "Features/Streaming/StreamVideoPlayer" to see all component variants and interactive examples.
