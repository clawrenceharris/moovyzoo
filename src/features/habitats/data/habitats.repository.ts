import type {
  Habitat,
  HabitatMember,
  MessageWithProfile,
  HabitatWithMembership,
  Discussion,
  DiscussionInsert,
  DiscussionUpdate,
  DiscussionWithStats,
  Poll,
  PollInsert,
  PollUpdate,
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
   * Get all members of a habitat
   */
  async getHabitatMembers(habitatId: string): Promise<HabitatMember[]> {
    try {
      const { data: members, error } = await supabase
        .from("habitat_members")
        .select("*")
        .eq("habitat_id", habitatId)
        .order("joined_at", { ascending: false });

      if (error) {
        throw error;
      }

      return members.map((member) => this.mapDatabaseToHabitatMember(member));
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
      console.log(error);
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
        .select("*")
        .eq("habitat_id", habitatId)
        .eq("is_active", true)
        .order("scheduled_time", { ascending: true });

      if (error) {
        throw error;
      }

      // For now, return watch parties without participants
      // TODO: Implement proper watch party participation with junction table
      return watchParties.map((watchParty) => ({
        ...this.mapDatabaseToWatchParty(watchParty),
        participants: [], // Empty participants array for now
        is_participant: false, // User is not a participant by default
      }));
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
      // Validate media data consistency
      this.validateMediaData(watchPartyData);

      const insertData: Record<string, any> = {
        habitat_id: watchPartyData.habitat_id,
        description: watchPartyData.description?.trim(),
        scheduled_time: watchPartyData.scheduled_time,
        participant_count: watchPartyData.participant_count || 0,
        max_participants: watchPartyData.max_participants,
        created_by: watchPartyData.created_by,
      };

      // Add media fields if provided
      if (watchPartyData.tmdb_id !== undefined) {
        insertData.tmdb_id = watchPartyData.tmdb_id;
      }
      if (watchPartyData.media_type !== undefined) {
        insertData.media_type = watchPartyData.media_type;
      }
      if (watchPartyData.media_title !== undefined) {
        insertData.media_title = watchPartyData.media_title.trim();
      }
      if (watchPartyData.poster_path !== undefined) {
        insertData.poster_path = watchPartyData.poster_path;
      }
      if (watchPartyData.release_date !== undefined) {
        insertData.release_date = watchPartyData.release_date;
      }
      if (watchPartyData.runtime !== undefined) {
        insertData.runtime = watchPartyData.runtime;
      }

      const { data: watchParty, error } = await supabase
        .from("habitat_watch_parties")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        // Handle specific media-related database errors
        if (
          error.message?.includes("media_type") ||
          error.message?.includes("tmdb_id")
        ) {
          throw new Error(`Media data validation failed: ${error.message}`);
        }
        throw error;
      }

      return this.mapDatabaseToWatchParty(watchParty);
    } catch (error) {
      // Re-throw with additional context for media-related errors
      if (error instanceof Error && error.message.includes("Media data")) {
        throw error;
      }
      throw new Error(
        `Failed to create watch party: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
      // Validate media data consistency for updates
      this.validateMediaData(updateData);

      const updateFields: Record<string, any> = {};

      // Add basic fields if provided
      if (updateData.title !== undefined) {
        updateFields.title = updateData.title.trim();
      }
      if (updateData.description !== undefined) {
        updateFields.description = updateData.description?.trim();
      }
      if (updateData.scheduled_time !== undefined) {
        updateFields.scheduled_time = updateData.scheduled_time;
      }
      if (updateData.participant_count !== undefined) {
        updateFields.participant_count = updateData.participant_count;
      }
      if (updateData.max_participants !== undefined) {
        updateFields.max_participants = updateData.max_participants;
      }
      if (updateData.is_active !== undefined) {
        updateFields.is_active = updateData.is_active;
      }

      // Add media fields if provided
      if (updateData.tmdb_id !== undefined) {
        updateFields.tmdb_id = updateData.tmdb_id;
      }
      if (updateData.media_type !== undefined) {
        updateFields.media_type = updateData.media_type;
      }
      if (updateData.media_title !== undefined) {
        updateFields.media_title = updateData.media_title?.trim();
      }
      if (updateData.poster_path !== undefined) {
        updateFields.poster_path = updateData.poster_path;
      }
      if (updateData.release_date !== undefined) {
        updateFields.release_date = updateData.release_date;
      }
      if (updateData.runtime !== undefined) {
        updateFields.runtime = updateData.runtime;
      }

      const { data: watchParty, error } = await supabase
        .from("habitat_watch_parties")
        .update(updateFields)
        .eq("id", watchPartyId)
        .eq("created_by", userId) // Only creator can update
        .select()
        .single();

      if (error) {
        // Handle specific media-related database errors
        if (
          error.message?.includes("media_type") ||
          error.message?.includes("tmdb_id")
        ) {
          throw new Error(`Media data validation failed: ${error.message}`);
        }
        throw error;
      }

      return this.mapDatabaseToWatchParty(watchParty);
    } catch (error) {
      // Re-throw with additional context for media-related errors
      if (error instanceof Error && error.message.includes("Media data")) {
        throw error;
      }
      throw new Error(
        `Failed to update watch party: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
   * Get polls for a habitat
   */
  async getPollsByHabitat(habitatId: string): Promise<Poll[]> {
    try {
      const { data: polls, error } = await supabase
        .from("habitat_polls")
        .select("*")
        .eq("habitat_id", habitatId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return polls.map((poll) => this.mapDatabaseToPoll(poll));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new poll in a habitat
   */
  async createPoll(pollData: PollInsert): Promise<Poll> {
    try {
      const { data: poll, error } = await supabase
        .from("habitat_polls")
        .insert({
          habitat_id: pollData.habitat_id,
          title: pollData.title.trim(),
          options: pollData.options,
          created_by: pollData.created_by,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToPoll(poll);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a poll
   */
  async updatePoll(
    pollId: string,
    updateData: PollUpdate,
    userId: string
  ): Promise<Poll> {
    try {
      const { data: poll, error } = await supabase
        .from("habitat_polls")
        .update(updateData)
        .eq("id", pollId)
        .eq("created_by", userId) // Only creator can update
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToPoll(poll);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific poll by ID
   */
  async getPollById(pollId: string): Promise<Poll> {
    try {
      const { data: poll, error } = await supabase
        .from("habitat_polls")
        .select("*")
        .eq("id", pollId)
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToPoll(poll);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a poll (only by creator)
   */
  async deletePoll(pollId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("habitat_polls")
        .update({ is_active: false })
        .eq("id", pollId)
        .eq("created_by", userId);

      if (error) {
        throw error;
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
    tmdb_id?: number;
    media_type?: "movie" | "tv";
    media_title?: string;
    poster_path?: string;
    release_date?: string;
    runtime?: number;
  }): WatchParty {
    return {
      id: dbWatchParty.id,
      habitat_id: dbWatchParty.habitat_id,
      description: dbWatchParty.description || undefined,
      scheduled_time: dbWatchParty.scheduled_time,
      participant_count: dbWatchParty.participant_count,
      max_participants: dbWatchParty.max_participants || undefined,
      created_by: dbWatchParty.created_by,
      created_at: dbWatchParty.created_at,
      is_active: dbWatchParty.is_active,
      // Media integration fields
      tmdb_id: dbWatchParty.tmdb_id || undefined,
      media_type: dbWatchParty.media_type || undefined,
      media_title: dbWatchParty.media_title || undefined,
      poster_path: dbWatchParty.poster_path || undefined,
      release_date: dbWatchParty.release_date || undefined,
      runtime: dbWatchParty.runtime || undefined,
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
    tmdb_id?: number;
    media_type?: "movie" | "tv";
    media_title?: string;
    poster_path?: string;
    release_date?: string;
    runtime?: number;
    participants?: HabitatMember[];
  }): WatchPartyWithParticipants {
    return {
      ...this.mapDatabaseToWatchParty(dbWatchParty),
      participants: dbWatchParty.participants || [],
      is_participant: false, // This will be set by the service layer based on current user
    };
  }

  /**
   * Map database row to Poll type
   */
  private mapDatabaseToPoll(dbPoll: {
    id: string;
    habitat_id: string;
    title: string;
    options: Record<string, number>;
    created_by: string;
    created_at: string;
    is_active: boolean;
  }): Poll {
    return {
      id: dbPoll.id,
      habitat_id: dbPoll.habitat_id,
      title: dbPoll.title,
      options: dbPoll.options,
      created_by: dbPoll.created_by,
      created_at: dbPoll.created_at,
      is_active: dbPoll.is_active,
    };
  }

  /**
   * Construct TMDB poster URL from poster path
   */
  public constructTMDBPosterUrl(
    posterPath: string,
    size: string = "w500"
  ): string {
    if (!posterPath) {
      return "";
    }
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }

  /**
   * Map media data from CreateWatchPartyData to database insert format
   */
  public mapMediaDataForInsert(media?: {
    tmdb_id: number;
    media_type: "movie" | "tv";
    media_title: string;
    poster_path?: string;
    release_date?: string;
    runtime?: number;
  }): {
    tmdb_id?: number;
    media_type?: "movie" | "tv";
    media_title?: string;
    poster_path?: string;
    release_date?: string;
    runtime?: number;
  } {
    if (!media) {
      return {};
    }

    return {
      tmdb_id: media.tmdb_id,
      media_type: media.media_type,
      media_title: media.media_title,
      poster_path: media.poster_path || undefined,
      release_date: media.release_date || undefined,
      runtime: media.runtime || undefined,
    };
  }

  /**
   * Extract media information from watch party for display
   */
  public extractMediaInfo(watchParty: WatchParty): {
    tmdbId?: number;
    mediaType?: "movie" | "tv";
    title?: string;
    posterUrl?: string;
    releaseDate?: string;
    runtime?: number;
  } | null {
    if (
      !watchParty.tmdb_id ||
      !watchParty.media_type ||
      !watchParty.media_title
    ) {
      return null;
    }

    return {
      tmdbId: watchParty.tmdb_id,
      mediaType: watchParty.media_type,
      title: watchParty.media_title,
      posterUrl: watchParty.poster_path
        ? this.constructTMDBPosterUrl(watchParty.poster_path)
        : undefined,
      releaseDate: watchParty.release_date || undefined,
      runtime: watchParty.runtime || undefined,
    };
  }

  /**
   * Validate media data consistency
   */
  private validateMediaData(data: {
    tmdb_id?: number;
    media_type?: "movie" | "tv";
    media_title?: string;
    poster_path?: string;
    release_date?: string;
    runtime?: number;
  }): void {
    // If tmdb_id is provided, media_type and media_title must also be provided
    if (data.tmdb_id !== undefined && data.tmdb_id !== null) {
      if (!data.media_type || !data.media_title) {
        throw new Error(
          "Media data validation failed: media_type and media_title are required when tmdb_id is provided"
        );
      }
    }

    // If any media field is provided, tmdb_id must be provided
    const hasMediaFields =
      data.media_type ||
      data.media_title ||
      data.poster_path ||
      data.release_date ||
      data.runtime;
    if (
      hasMediaFields &&
      (data.tmdb_id === undefined || data.tmdb_id === null)
    ) {
      throw new Error(
        "Media data validation failed: tmdb_id is required when any media information is provided"
      );
    }

    // Validate media_type values
    if (data.media_type && !["movie", "tv"].includes(data.media_type)) {
      throw new Error(
        'Media data validation failed: media_type must be either "movie" or "tv"'
      );
    }

    // Validate tmdb_id is a positive integer
    if (
      data.tmdb_id !== undefined &&
      data.tmdb_id !== null &&
      (!Number.isInteger(data.tmdb_id) || data.tmdb_id <= 0)
    ) {
      throw new Error(
        "Media data validation failed: tmdb_id must be a positive integer"
      );
    }

    // Validate runtime is a positive integer if provided
    if (
      data.runtime !== undefined &&
      data.runtime !== null &&
      (!Number.isInteger(data.runtime) || data.runtime <= 0)
    ) {
      throw new Error(
        "Media data validation failed: runtime must be a positive integer (minutes)"
      );
    }
  }
}

// Export singleton instance
export const habitatsRepository = new HabitatsRepository();
