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
  id: string;
  stream_id: string;
  user_id: string;
  joined_at: string;
  is_host: boolean;
  created_at: string;
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
  currentTime: number;
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
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}

// Form-specific interface for streaming session creation
export interface CreateStreamFormData {
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  maxParticipants?: string;
  media: SelectedMedia;
}

export interface SelectedMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

export interface CreateStreamData {
  description?: string;
  scheduledTime: string;
  maxParticipants?: number;
  media: SelectedMedia;
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
