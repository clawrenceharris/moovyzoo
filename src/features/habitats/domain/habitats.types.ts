// Core domain types for habitats feature

import { StreamWithParticipants } from "@/features/streaming";

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

// Dashboard-specific aggregated types
export interface HabitatDashboardData {
  habitat: HabitatWithMembership;
  discussions: DiscussionWithStats[];
  polls: PollWithVotes[];
  streams: StreamWithParticipants[];
  members: HabitatMember[];
  onlineMembers: HabitatMember[];
  totalMembers: number;
}

export interface PopularDiscussion extends DiscussionWithStats {
  recent_activity_score: number;
}

// Message types for discussion rooms
export interface DiscussionMessage extends Message {
  discussion_id: string; // alias for chat_id for clarity
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
    | "stream_created"
    | "message_sent";
  activity_data: Record<string, unknown>;
  created_by: string;
  created_at: string;
}
