import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { StreamVideoPlayer } from "./StreamVideoPlayer";
import type { StreamMedia } from "../domain/stream.types";

const mockMedia: StreamMedia = {
  tmdb_id: 550,
  media_type: "movie",
  media_title: "Fight Club",
  poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  video_url:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  runtime: 139,
};

const meta: Meta<typeof StreamVideoPlayer> = {
  title: "Features/Streaming/StreamVideoPlayer",
  component: StreamVideoPlayer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
StreamVideoPlayer is a comprehensive video player component for streaming sessions.

**Features:**
- HTML5 video player with custom controls
- Host-only controls for synchronized playback
- Fullscreen support with mobile optimization
- Keyboard shortcuts for common actions
- Loading and error states
- Responsive design for all screen sizes
- Real-time playback synchronization callbacks

**Host Controls:**
- Play/Pause: Space bar or click button
- Seek: Click progress bar or arrow keys (±10s)
- Volume: Volume slider or M to mute
- Fullscreen: F key or fullscreen button

**Participant Mode:**
- View-only controls (disabled for non-hosts)
- Syncs automatically with host actions
- Shows "View Only" indicator
        `,
      },
    },
  },
  argTypes: {
    isHost: {
      control: "boolean",
      description:
        "Whether the current user is the host with control permissions",
    },
    streamId: {
      control: "text",
      description: "Unique identifier for the streaming session",
    },
    currentUserId: {
      control: "text",
      description: "Current user's ID for permission checks",
    },
    onPlaybackChange: {
      action: "playbackChanged",
      description: "Callback fired when playback state changes",
    },
  },
  args: {
    streamId: "demo-stream-123",
    currentUserId: "user-456",
    media: mockMedia,
    onPlaybackChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HostMode: Story = {
  args: {
    isHost: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Host mode with full control permissions. All controls are enabled and functional.",
      },
    },
  },
};

export const ParticipantMode: Story = {
  args: {
    isHost: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Participant mode with view-only controls. Shows 'View Only' indicator and disables host controls.",
      },
    },
  },
};

export const MovieContent: Story = {
  args: {
    isHost: true,
    media: {
      tmdb_id: 550,
      media_type: "movie",
      media_title: "Fight Club",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      video_url:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      runtime: 139,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Video player displaying movie content with poster and metadata.",
      },
    },
  },
};

export const TVShowContent: Story = {
  args: {
    isHost: true,
    media: {
      tmdb_id: 1399,
      media_type: "tv",
      media_title: "Game of Thrones - S01E01",
      poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
      video_url:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      runtime: 62,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Video player displaying TV show episode content.",
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    isHost: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Mobile-optimized view with touch-friendly controls and responsive layout.",
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    isHost: true,
    media: {
      ...mockMedia,
      video_url: undefined, // No video URL to trigger loading state
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state shown while video metadata is being loaded.",
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    isHost: true,
    media: {
      ...mockMedia,
      video_url: "https://invalid-url.com/nonexistent-video.mp4",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Error state with retry button when video fails to load.",
      },
    },
  },
};

export const WithoutPoster: Story = {
  args: {
    isHost: true,
    media: {
      ...mockMedia,
      poster_path: undefined,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Video player without poster image, showing only video content.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  args: {
    isHost: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Interactive demo showcasing all features:

**Try these interactions:**
- Click play/pause button or press Space
- Drag the progress bar to seek
- Adjust volume with slider or press M to mute
- Click fullscreen button or press F
- Use arrow keys for ±10 second seeking

**Keyboard Shortcuts:**
- Space: Play/Pause
- F: Toggle Fullscreen  
- M: Toggle Mute
- ← →: Seek backward/forward 10 seconds
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Focus the video player for keyboard shortcuts
    const videoContainer = canvasElement.querySelector(
      '[data-testid="video-player-container"]'
    ) as HTMLElement;
    if (videoContainer) {
      videoContainer.focus();
    }
  },
};
