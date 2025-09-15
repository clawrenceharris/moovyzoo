# Streaming Services

This directory contains service classes for the streaming feature.

## YouTubePlayerService

The `YouTubePlayerService` provides a centralized interface for controlling YouTube players and managing playback synchronization.

### Features

- **Player Control**: Play, pause, and seek operations with error handling
- **State Retrieval**: Get current time, player state, and duration
- **Event Management**: Handle player state changes, ready events, and errors
- **Sync Operations**: Apply remote state changes and get detailed playback state
- **Error Recovery**: Handle YouTube API errors and player reload scenarios

### Usage

```typescript
import {
  YouTubePlayerService,
  YT_PLAYER_STATE,
} from "@/features/streaming/services";

// Create service instance with YouTube player ref
const service = new YouTubePlayerService(youtubePlayerRef);

// Control playback
await service.play();
await service.pause();
await service.seekTo(30); // Seek to 30 seconds

// Get state
const time = await service.getCurrentTime();
const playerState = await service.getPlayerState();
const isPlaying = playerState === YT_PLAYER_STATE.PLAYING;

// Sync to remote state
await service.syncToState({
  time: 60,
  isPlaying: true,
  duration: 120,
  volume: 1,
  isFullscreen: false,
});

// Handle events
service.onStateChange((event) => {
  console.log("Player state changed:", event);
});
```

### Requirements Covered

This service implements requirements 3.1-3.7 from the playback synchronization specification:

- 3.1: YouTube player instance reference for control
- 3.2: Capture play, pause, and seek events from YouTube API
- 3.3: Use YouTube API methods for playback control
- 3.4: Get current state using YouTube API methods
- 3.5: Handle buffering states without breaking sync
- 3.6: Broadcast end state to all participants
- 3.7: Handle YouTube API errors gracefully with recovery

### Testing

The service includes comprehensive unit tests and integration tests:

```bash
npm run test src/features/streaming/services
```

### Error Handling

The service provides robust error handling for:

- Player not available scenarios
- YouTube API errors
- Network connectivity issues
- Invalid state transitions
