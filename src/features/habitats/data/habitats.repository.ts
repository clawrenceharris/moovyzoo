import type {
  Habitat,
  HabitatMember,
  MessageWithProfile,
  HabitatWithMembership,
  Discussion,
  DiscussionInsert,
  DiscussionUpdate,
  DiscussionWithStats,
  WatchParty,
  WatchPartyInsert,
  WatchPartyUpdate,
  WatchPartyWithParticipants,
} from "../domain/habitats.types";
import type { HabitatRow, HabitatMemberRow } from "@/types/database";
import { supabase } from "@/utils/supabase/client";

/**
 * Repository for habitat data operations using Supabase
 * Contains only database access logic, no business rules
 */
export class HabitatsRepository {
  /**
   * Get all habitats that a user has joined
   */
  async getUserJoinedHabitats(
    userId: string
  ): Promise<HabitatWithMembership[]> {
    try {
      const { data: habitats, error } = await supabase
        .from("habitats")
        .select(
          `
          *,
          habitat_members!inner(joined_at, last_active)
        `
        )
        .eq("habitat_members.user_id", userId);

      if (error) {
        throw error;
      }

      return habitats.map((habitat) =>
        this.mapDatabaseToHabitatWithMembership(habitat, true)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific habitat by ID with membership info for a user
   */
  async getHabitatById(
    habitatId: string,
    userId?: string
  ): Promise<HabitatWithMembership> {
    try {
      const { data: habitat, error } = await supabase
        .from("habitats")
        .select("*")
        .eq("id", habitatId)
        .single();

      if (error) {
        throw error;
      }

      let isMember = false;
      let userRole: "owner" | "member" | undefined;

      if (userId) {
        // Check if user is a member
        const { data: membership } = await supabase
          .from("habitat_members")
          .select("*")
          .eq("habitat_id", habitatId)
          .eq("user_id", userId)
          .single();

        isMember = !!membership;
        userRole =
          habitat.created_by === userId
            ? "owner"
            : isMember
            ? "member"
            : undefined;
      }

      return {
        ...this.mapDatabaseToHabitat(habitat),
        is_member: isMember,
        user_role: userRole,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Join a habitat (add user to habitat_members)
   */
  async joinHabitat(habitatId: string, userId: string): Promise<HabitatMember> {
    try {
      console.log("user id: " + userId + " habitat id: " + habitatId);
      const { data: member, error } = await supabase
        .from("habitat_members")
        .insert({
          habitat_id: habitatId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update member count
      await this.updateMemberCount(habitatId);

      return this.mapDatabaseToHabitatMember(member);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Leave a habitat (remove user from habitat_members)
   */
  async leaveHabitat(habitatId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("habitat_members")
        .delete()
        .eq("habitat_id", habitatId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      // Update member count
      await this.updateMemberCount(habitatId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is a member of a habitat
   */
  async isUserMember(habitatId: string, userId: string): Promise<boolean> {
    try {
      const { data: member, error } = await supabase
        .from("habitat_members")
        .select("habitat_id")
        .eq("habitat_id", habitatId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return !!member;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user's last active timestamp in a habitat
   */
  async updateLastActive(habitatId: string, userId: string): Promise<void> {
    try {
      // const { error } = await supabase
      //   .from("habitat_members")
      //   .update({ last_active: new Date().toISOString() })
      //   .eq("habitat_id", habitatId)
      //   .eq("user_id", userId);
      // if (error) {
      //   throw error;
      // }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get messages for a habitat with pagination (deprecated - use getMessagesByDiscussion)
   */
  async getHabitatMessages(
    habitatId: string,
    limit = 50,
    offset = 0
  ): Promise<MessageWithProfile[]> {
    try {
      const { data: messages, error } = await supabase
        .from("habitat_messages")
        .select(
          `
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("habitat_id", habitatId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return messages.map((message) =>
        this.mapDatabaseToMessageWithProfile(message)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get messages for a specific discussion with pagination
   */
  async getMessagesByDiscussion(
    discussionId: string,
    limit = 50,
    offset = 0
  ): Promise<MessageWithProfile[]> {
    try {
      const { data: messages, error } = await supabase
        .from("habitat_messages")
        .select(
          `
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("chat_id", discussionId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return messages.map((message) =>
        this.mapDatabaseToMessageWithProfile(message)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send a message to a habitat (deprecated - use sendMessageToDiscussion)
   */
  async sendMessage(
    habitatId: string,
    userId: string,
    content: string
  ): Promise<MessageWithProfile> {
    try {
      // First insert the message
      const { data: message, error: messageError } = await supabase
        .from("habitat_messages")
        .insert({
          habitat_id: habitatId,
          user_id: userId,
          content,
        })
        .select()
        .single();

      if (messageError) {
        throw messageError;
      }

      // Then fetch the message with profile info
      const { data: messageWithProfile, error: profileError } = await supabase
        .from("habitat_messages")
        .select(
          `
          *,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("id", message.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Update user's last active timestamp
      await this.updateLastActive(habitatId, userId);

      return this.mapDatabaseToMessageWithProfile(messageWithProfile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send a message to a specific discussion
   */
  async sendMessageToDiscussion(
    habitatId: string,
    discussionId: string,
    userId: string,
    content: string
  ): Promise<MessageWithProfile> {
    try {
      // First insert the message
      const { data: message, error: messageError } = await supabase
        .from("habitat_messages")
        .insert({
          habitat_id: habitatId,
          chat_id: discussionId,
          user_id: userId,
          content,
        })
        .select()
        .single();

      if (messageError) {
        throw messageError;
      }

      // Then fetch the message with profile info
      const { data: messageWithProfile, error: profileError } = await supabase
        .from("habitat_messages")
        .select(
          `
          *,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("id", message.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Update user's last active timestamp
      await this.updateLastActive(habitatId, userId);

      return this.mapDatabaseToMessageWithProfile(messageWithProfile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a message (only by the message author)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("habitat_messages")
        .delete()
        .eq("id", messageId)
        .eq("user_id", userId); // Ensure only the author can delete

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessageById(messageId: string): Promise<MessageWithProfile> {
    try {
      const { data: message, error } = await supabase
        .from("habitat_messages")
        .select(
          `
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("id", messageId)
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToMessageWithProfile(message);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get messages after a specific timestamp (for real-time updates) - deprecated
   */
  async getMessagesAfter(
    habitatId: string,
    timestamp: string
  ): Promise<MessageWithProfile[]> {
    try {
      const { data: messages, error } = await supabase
        .from("habitat_messages")
        .select(
          `
          *,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("habitat_id", habitatId)
        .gt("created_at", timestamp)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return messages.map((message) =>
        this.mapDatabaseToMessageWithProfile(message)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get messages after a specific timestamp for a discussion (for real-time updates)
   */
  async getDiscussionMessagesAfter(
    discussionId: string,
    timestamp: string
  ): Promise<MessageWithProfile[]> {
    try {
      const { data: messages, error } = await supabase
        .from("habitat_messages")
        .select(
          `
          *,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("chat_id", discussionId)
        .gt("created_at", timestamp)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return messages.map((message) =>
        this.mapDatabaseToMessageWithProfile(message)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new habitat
   */
  async createHabitat(
    name: string,
    description: string,
    tags: string[],
    isPublic: boolean,
    createdBy: string
  ): Promise<Habitat> {
    try {
      const { data: habitat, error } = await supabase
        .from("habitats")
        .insert({
          name: name.trim(),
          description: description.trim(),
          tags: tags,
          is_public: isPublic,
          created_by: createdBy,
          member_count: 1, // Creator is automatically a member
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Automatically add creator as a member
      await this.joinHabitat(habitat.id, createdBy);

      return this.mapDatabaseToHabitat(habitat);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Private helper to update habitat member count
   */
  private async updateMemberCount(habitatId: string): Promise<void> {
    try {
      const { count, error: countError } = await supabase
        .from("habitat_members")
        .select("*", { count: "exact", head: true })
        .eq("habitat_id", habitatId);

      if (countError) {
        throw countError;
      }

      const { error: updateError } = await supabase
        .from("habitats")
        .update({ member_count: count || 0 })
        .eq("id", habitatId);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map database row to Habitat type
   */
  private mapDatabaseToHabitat(dbHabitat: HabitatRow): Habitat {
    return {
      id: dbHabitat.id,
      name: dbHabitat.name,
      description: dbHabitat.description || "",
      tags: dbHabitat.tags || [],
      member_count: dbHabitat.member_count,
      is_public: dbHabitat.is_public,
      created_by: dbHabitat.created_by,
      created_at: dbHabitat.created_at,
      updated_at: dbHabitat.updated_at,
      banner_url: dbHabitat.banner_url || undefined,
    };
  }

  /**
   * Map database row to HabitatWithMembership type
   */
  private mapDatabaseToHabitatWithMembership(
    dbHabitat: HabitatRow & {
      habitat_members?: { joined_at: string; last_active: string }[];
    },
    isMember: boolean
  ): HabitatWithMembership {
    return {
      ...this.mapDatabaseToHabitat(dbHabitat),
      is_member: isMember,
      user_role: isMember ? "member" : undefined,
    };
  }

  /**
   * Map database row to HabitatMember type
   */
  private mapDatabaseToHabitatMember(
    dbMember: HabitatMemberRow
  ): HabitatMember {
    return {
      habitat_id: dbMember.habitat_id,
      user_id: dbMember.user_id,
      joined_at: dbMember.joined_at,
      last_active: dbMember.last_active,
    };
  }

  /**
   * Get discussions for a habitat
   */
  async getDiscussionsByHabitat(
    habitatId: string
  ): Promise<DiscussionWithStats[]> {
    try {
      const { data: discussions, error } = await supabase
        .from("habitat_discussions")
        .select(
          `
          *,
          message_count:habitat_messages(count),
          last_message:habitat_messages(created_at)
        `
        )
        .eq("habitat_id", habitatId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return discussions.map((discussion) =>
        this.mapDatabaseToDiscussionWithStats(discussion)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new discussion in a habitat
   */
  async createDiscussion(
    discussionData: DiscussionInsert
  ): Promise<Discussion> {
    try {
      const { data: discussion, error } = await supabase
        .from("habitat_discussions")
        .insert({
          habitat_id: discussionData.habitat_id,
          name: discussionData.name.trim(),
          description: discussionData.description?.trim(),
          created_by: discussionData.created_by,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToDiscussion(discussion);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a discussion
   */
  async updateDiscussion(
    discussionId: string,
    updateData: DiscussionUpdate,
    userId: string
  ): Promise<Discussion> {
    try {
      const { data: discussion, error } = await supabase
        .from("habitat_discussions")
        .update(updateData)
        .eq("id", discussionId)
        .eq("created_by", userId) // Only creator can update
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToDiscussion(discussion);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific discussion by ID
   */
  async getDiscussionById(discussionId: string): Promise<Discussion> {
    try {
      const { data: discussion, error } = await supabase
        .from("habitat_discussions")
        .select("*")
        .eq("id", discussionId)
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToDiscussion(discussion);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a discussion (only by creator)
   */
  async deleteDiscussion(discussionId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("habitat_discussions")
        .update({ is_active: false })
        .eq("id", discussionId)
        .eq("created_by", userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get watch parties for a habitat
   */
  async getWatchPartiesByHabitat(
    habitatId: string
  ): Promise<WatchPartyWithParticipants[]> {
    try {
      const { data: watchParties, error } = await supabase
        .from("habitat_watch_parties")
        .select(
          `
          *,
          participants:habitat_members!inner(*)
        `
        )
        .eq("habitat_id", habitatId)
        .eq("is_active", true)
        .order("scheduled_time", { ascending: true });

      if (error) {
        throw error;
      }

      return watchParties.map((watchParty) =>
        this.mapDatabaseToWatchPartyWithParticipants(watchParty)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new watch party in a habitat
   */
  async createWatchParty(
    watchPartyData: WatchPartyInsert
  ): Promise<WatchParty> {
    try {
      const { data: watchParty, error } = await supabase
        .from("habitat_watch_parties")
        .insert({
          habitat_id: watchPartyData.habitat_id,
          title: watchPartyData.title.trim(),
          description: watchPartyData.description?.trim(),
          scheduled_time: watchPartyData.scheduled_time,
          participant_count: watchPartyData.participant_count || 0,
          max_participants: watchPartyData.max_participants,
          created_by: watchPartyData.created_by,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToWatchParty(watchParty);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a watch party
   */
  async updateWatchParty(
    watchPartyId: string,
    updateData: WatchPartyUpdate,
    userId: string
  ): Promise<WatchParty> {
    try {
      const { data: watchParty, error } = await supabase
        .from("habitat_watch_parties")
        .update(updateData)
        .eq("id", watchPartyId)
        .eq("created_by", userId) // Only creator can update
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToWatchParty(watchParty);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific watch party by ID
   */
  async getWatchPartyById(watchPartyId: string): Promise<WatchParty> {
    try {
      const { data: watchParty, error } = await supabase
        .from("habitat_watch_parties")
        .select("*")
        .eq("id", watchPartyId)
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToWatchParty(watchParty);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a watch party (only by creator)
   */
  async deleteWatchParty(watchPartyId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("habitat_watch_parties")
        .update({ is_active: false })
        .eq("id", watchPartyId)
        .eq("created_by", userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Join a watch party
   */
  async joinWatchParty(watchPartyId: string, userId: string): Promise<void> {
    try {
      // First check if user is already a participant
      const { data: existing } = await supabase
        .from("habitat_watch_party_participants")
        .select("*")
        .eq("watch_party_id", watchPartyId)
        .eq("user_id", userId)
        .single();

      if (existing) {
        return; // Already a participant
      }

      // Add user as participant
      const { error: insertError } = await supabase
        .from("habitat_watch_party_participants")
        .insert({
          watch_party_id: watchPartyId,
          user_id: userId,
        });

      if (insertError) {
        throw insertError;
      }

      // Update participant count
      const { error: updateError } = await supabase.rpc(
        "increment_watch_party_participants",
        { watch_party_id: watchPartyId }
      );

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Leave a watch party
   */
  async leaveWatchParty(watchPartyId: string, userId: string): Promise<void> {
    try {
      const { error: deleteError } = await supabase
        .from("habitat_watch_party_participants")
        .delete()
        .eq("watch_party_id", watchPartyId)
        .eq("user_id", userId);

      if (deleteError) {
        throw deleteError;
      }

      // Update participant count
      const { error: updateError } = await supabase.rpc(
        "decrement_watch_party_participants",
        { watch_party_id: watchPartyId }
      );

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map database row to MessageWithProfile type
   */
  private mapDatabaseToMessageWithProfile(dbMessage: {
    id: string;
    habitat_id: string;
    chat_id?: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
      display_name: string;
      avatar_url?: string;
    };
  }): MessageWithProfile {
    return {
      id: dbMessage.id,
      habitat_id: dbMessage.habitat_id,
      chat_id: dbMessage.chat_id || "general", // Default to general discussion for backward compatibility
      user_id: dbMessage.user_id,
      content: dbMessage.content,
      created_at: dbMessage.created_at,
      user_profile: {
        display_name: dbMessage.profiles?.display_name || "Unknown User",
        avatar_url: dbMessage.profiles?.avatar_url || undefined,
      },
    };
  }

  /**
   * Map database row to Discussion type
   */
  private mapDatabaseToDiscussion(dbDiscussion: {
    id: string;
    habitat_id: string;
    name: string;
    description?: string;
    created_by: string;
    created_at: string;
    is_active: boolean;
  }): Discussion {
    return {
      id: dbDiscussion.id,
      habitat_id: dbDiscussion.habitat_id,
      name: dbDiscussion.name,
      description: dbDiscussion.description || undefined,
      created_by: dbDiscussion.created_by,
      created_at: dbDiscussion.created_at,
      is_active: dbDiscussion.is_active,
    };
  }

  /**
   * Map database row to DiscussionWithStats type
   */
  private mapDatabaseToDiscussionWithStats(dbDiscussion: {
    id: string;
    habitat_id: string;
    name: string;
    description?: string;
    created_by: string;
    created_at: string;
    is_active: boolean;
    message_count?: { count: number }[];
    last_message?: { created_at: string }[];
  }): DiscussionWithStats {
    const messageCount = dbDiscussion.message_count?.[0]?.count || 0;
    const lastMessageAt = dbDiscussion.last_message?.[0]?.created_at;

    return {
      ...this.mapDatabaseToDiscussion(dbDiscussion),
      message_count: messageCount,
      last_message_at: lastMessageAt,
    };
  }

  /**
   * Map database row to WatchParty type
   */
  private mapDatabaseToWatchParty(dbWatchParty: {
    id: string;
    habitat_id: string;
    title: string;
    description?: string;
    scheduled_time: string;
    participant_count: number;
    max_participants?: number;
    created_by: string;
    created_at: string;
    is_active: boolean;
  }): WatchParty {
    return {
      id: dbWatchParty.id,
      habitat_id: dbWatchParty.habitat_id,
      title: dbWatchParty.title,
      description: dbWatchParty.description || undefined,
      scheduled_time: dbWatchParty.scheduled_time,
      participant_count: dbWatchParty.participant_count,
      max_participants: dbWatchParty.max_participants || undefined,
      created_by: dbWatchParty.created_by,
      created_at: dbWatchParty.created_at,
      is_active: dbWatchParty.is_active,
    };
  }

  /**
   * Map database row to WatchPartyWithParticipants type
   */
  private mapDatabaseToWatchPartyWithParticipants(dbWatchParty: {
    id: string;
    habitat_id: string;
    title: string;
    description?: string;
    scheduled_time: string;
    participant_count: number;
    max_participants?: number;
    created_by: string;
    created_at: string;
    is_active: boolean;
    participants?: HabitatMember[];
  }): WatchPartyWithParticipants {
    return {
      ...this.mapDatabaseToWatchParty(dbWatchParty),
      participants: dbWatchParty.participants || [],
      is_participant: false, // This will be set by the service layer based on current user
    };
  }
}

// Export singleton instance
export const habitatsRepository = new HabitatsRepository();
