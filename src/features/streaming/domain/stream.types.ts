// Core domain types for streams feature

export interface Stream {
  id: string;
  habitat_id: string;
  description?: string;
  scheduled_time: string;
  max_participants: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
  visibility?: "public" | "private" | "unlisted";

  // Media integration fields
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path: string | null;
  release_date?: string;
  runtime?: number;
}

export interface StreamParticipant {
  stream_id: string;
  user_id: string;
  joined_at: string;
  is_host: boolean;
  reminder_enabled: boolean;
  profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

// Response types for API/service layer
export interface StreamWithParticipants extends Stream {
  participants: StreamParticipant[];
  is_participant: boolean;
}

export interface UpcomingStream extends StreamWithParticipants {
  time_until_start: number; // minutes until start
  status: "upcoming" | "starting_soon" | "live" | "ended";
}

// Dashboard-specific aggregated types
export interface StreamDashboardData {
  stream: StreamWithParticipants;
  participants: StreamParticipant[];
  userParticipation: UserParticipationStatus;
  canJoin: boolean;
  canLeave: boolean;
}

export interface UserParticipationStatus {
  isParticipant: boolean;
  canJoin: boolean;
  canLeave: boolean;
  joinedAt?: Date;
  isHost?: boolean;
  reminderEnabled?: boolean;
}

// Participant management types
export interface ParticipantJoinData {
  streamId: string;
  userId: string;
  reminderEnabled?: boolean;
}

export interface ParticipantUpdateData {
  reminderEnabled?: boolean;
  isHost?: boolean;
}

export interface ParticipantInsert {
  stream_id: string;
  user_id: string;
  is_host?: boolean;
  reminder_enabled?: boolean;
}

// Real-time subscription payloads
export interface ParticipantChangePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: StreamParticipant;
  old?: StreamParticipant;
}

export interface PlaybackStatePayload {
  streamId: string;
  time: number;
  isPlaying: boolean;
  lastSyncAt: string;
  hostUserId: string;
}

// Video player types
export interface StreamMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path: string | null;
  runtime?: number;
}

export interface PlaybackState {
  time: number;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}

// Extended interface for detailed playback state with YouTube-specific information
export interface DetailedPlaybackState extends PlaybackState {
  playerState: number;
  videoLoadedFraction: number;
  availableQualityLevels: string[];
  playbackQuality: string;
  bufferedTimeRanges: TimeRanges;
}

// Enhanced sync types for YouTube integration
export interface PlaybackEvent {
  type:
    | "play"
    | "pause"
    | "seek"
    | "sync_request"
    | "buffer_start"
    | "buffer_end";
  timestamp: number;
  time: number;
  hostUserId?: string;
  eventId: string; // For deduplication
  metadata?: {
    seekFrom?: number; // For seek events
    bufferReason?: string; // For buffer events
  };
}

export type SyncStatus = "connected" | "disconnected" | "syncing" | "error";
export type ConnectionQuality = "good" | "poor" | "unstable";

// YouTube Player API types
export interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  getDuration(): number;
  addEventListener(event: string, listener: (event: any) => void): void;
  removeEventListener(event: string, listener: (event: any) => void): void;
}

export interface SelectedMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  release_date?: string;
}

// Database insert/update types
export interface StreamInsert {
  description?: string;
  scheduled_time: string;
  participant_count?: number;
  max_participants?: number;
  created_by: string;
  visibility?: "public" | "private" | "unlisted";
  tmdb_id?: number;
  media_type?: "movie" | "tv";
  media_title?: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

export interface StreamUpdate {
  title?: string;
  description?: string;
  scheduled_time?: string;
  participant_count?: number;
  max_participants?: number;
  is_active?: boolean;
  // Media integration fields
  tmdb_id?: number;
  media_type?: "movie" | "tv";
  media_title?: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}
