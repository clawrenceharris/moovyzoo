// Core domain types for habitats feature

export interface Habitat {
  id: string;
  name: string;
  description: string;
  tags: string[];
  member_count: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  banner_url?: string;
}

export interface Message {
  id: string;
  habitat_id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface HabitatMember {
  habitat_id: string;
  user_id: string;
  joined_at: string;
  last_active: string;
}

export interface Discussion {
  id: string;
  habitat_id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface Poll {
  id: string;
  habitat_id: string;
  title: string;
  options: Record<string, number>;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface WatchParty {
  id: string;
  habitat_id: string;
  description?: string;
  scheduled_time: string;
  participant_count: number;
  max_participants?: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
  // Media integration fields
  tmdb_id?: number;
  media_type?: "movie" | "tv";
  media_title?: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

// Database insert/update types
export interface HabitatInsert {
  name: string;
  description: string;
  tags?: string[];
  is_public?: boolean;
  created_by: string;
  banner_url?: string;
}

export interface HabitatUpdate {
  name?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  banner_url?: string;
  updated_at?: string;
}

export interface MessageInsert {
  habitat_id: string;
  chat_id: string;
  user_id: string;
  content: string;
}

export interface HabitatMemberInsert {
  habitat_id: string;
  user_id: string;
}

export interface DiscussionInsert {
  habitat_id: string;
  name: string;
  description?: string;
  created_by: string;
}

export interface DiscussionUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface PollInsert {
  habitat_id: string;
  title: string;
  options: Record<string, number>;
  created_by: string;
}

export interface PollUpdate {
  title?: string;
  options?: Record<string, number>;
  is_active?: boolean;
}

export interface WatchPartyInsert {
  habitat_id: string;
  description?: string;
  scheduled_time: string;
  participant_count?: number;
  max_participants?: number;
  created_by: string;
  tmdb_id?: number;
  media_type?: "movie" | "tv";
  media_title?: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

export interface WatchPartyUpdate {
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

// Response types for API/service layer
export interface HabitatWithMembership extends Habitat {
  is_member: boolean;
  user_role?: "owner" | "member";
}

export interface MessageWithProfile extends Message {
  user_profile: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface DiscussionWithStats extends Discussion {
  message_count: number;
  last_message_at?: string;
}

export interface PollWithVotes extends Poll {
  total_votes: number;
  user_vote?: string;
}

export interface WatchPartyWithParticipants extends WatchParty {
  participants: HabitatMember[];
  is_participant: boolean;
}

// Dashboard-specific aggregated types
export interface HabitatDashboardData {
  habitat: HabitatWithMembership;
  discussions: DiscussionWithStats[];
  polls: PollWithVotes[];
  watchParties: WatchPartyWithParticipants[];
  members: HabitatMember[];
  onlineMembers: HabitatMember[];
  totalMembers: number;
}

export interface PopularDiscussion extends DiscussionWithStats {
  recent_activity_score: number;
}

export interface UpcomingWatchParty extends WatchPartyWithParticipants {
  time_until_start: number; // minutes until start
  status: "upcoming" | "starting_soon" | "live" | "ended";
}

// Message types for discussion rooms
export interface DiscussionMessage extends Message {
  discussion_id: string; // alias for chat_id for clarity
}

// Participant tracking for watch parties
export interface WatchPartyParticipant {
  watch_party_id: string;
  user_id: string;
  joined_at: string;
  is_active: boolean;
}

// Poll voting types
export interface PollVote {
  poll_id: string;
  user_id: string;
  option: string;
  voted_at: string;
}

// Activity tracking types
export interface HabitatActivity {
  id: string;
  habitat_id: string;
  activity_type:
    | "discussion_created"
    | "poll_created"
    | "watch_party_created"
    | "message_sent";
  activity_data: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

// Media integration types
export interface WatchPartyMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

// Selected media type for UI components (matches TMDB service interface)
export interface SelectedMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

export interface CreateWatchPartyData {
  description?: string;
  scheduledTime: string;
  maxParticipants?: number;
  media: WatchPartyMedia;
}

// Form-specific interface for watch party creation
export interface CreateWatchPartyFormData {
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  maxParticipants?: string;
  media: SelectedMedia;
}
