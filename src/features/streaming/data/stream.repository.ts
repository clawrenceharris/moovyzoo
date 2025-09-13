import type {
  Stream,
  StreamWithParticipants,
  StreamInsert,
  StreamUpdate,
  StreamParticipant,
  ParticipantInsert,
} from "../domain/stream.types";
import { supabase } from "@/utils/supabase/client";

/**
 * Repository for streaming session data operations
 */
export class StreamingRepository {
  /**
   * Get streaming session by ID with participant data
   */
  async getStreamById(id: string): Promise<StreamWithParticipants | null> {
    try {
      const { data: stream, error } = await supabase
        .from("streams")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching streaming session:", error);
        return null;
      }

      if (!stream) {
        return null;
      }

      // Transform the data to match our interface
      const transformedStream: StreamWithParticipants = {
        ...stream,
        participants: stream.participants || [],
        is_participant: false, // Will be determined based on user context
      };

      return transformedStream;
    } catch (error) {
      console.error("Error in getStreamById:", error);
      return null;
    }
  }

  /**
   * Check if streaming session exists
   */
  async checkStreamExists(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("streams")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error("Error checking streaming session existence:", error);
      return false;
    }
  }

  /**
   * Get streaming session participants
   */
  async getStreamParticipants(streamId: string): Promise<StreamParticipant[]> {
    try {
      const { data, error } = await supabase
        .from("stream_members")
        .select(
          `
          id,
          stream_id,
          user_id,
          joined_at,
          is_host,
          reminder_enabled,
          created_at,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("stream_id", streamId)
        .order("is_host", { ascending: false })
        .order("joined_at", { ascending: true });
      console.log({ data });
      if (error) {
        console.error("Error fetching participants:", error);
        return [];
      }

      return (data || []).map((participant) => ({
        id: participant.id,
        stream_id: participant.stream_id,
        user_id: participant.user_id,
        joined_at: participant.joined_at,
        is_host: participant.is_host,
        reminder_enabled: participant.reminder_enabled,
        created_at: participant.created_at,
        profile: participant.user_profiles
          ? {
              display_name: (participant.user_profiles as any).display_name,
              avatar_url: (participant.user_profiles as any).avatar_url,
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Error in getStreamParticipants:", error);
      return [];
    }
  }

  /**
   * Check if user is participant
   */
  async isUserParticipant(streamId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("stream_members")
        .select("user_id")
        .eq("stream_id", streamId)
        .eq("user_id", userId)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      console.error("Error checking user participation:", error);
      return false;
    }
  }

  /**
   * Join streaming session (legacy method - use service layer for new functionality)
   */
  async joinStream(streamId: string, userId: string): Promise<boolean> {
    try {
      // Check if this will be the first participant (becomes host)
      const existingParticipants = await this.getStreamParticipants(streamId);
      const isFirstParticipant = existingParticipants.length === 0;

      const { error } = await supabase.from("stream_members").insert({
        stream_id: streamId,
        user_id: userId,
        is_host: isFirstParticipant,
        reminder_enabled: false,
      });

      if (error) {
        console.error("Error joining streaming session:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in joinStream:", error);
      return false;
    }
  }

  /**
   * Leave streaming session (legacy method - use service layer for new functionality)
   */
  async leaveStream(streamId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("stream_members")
        .delete()
        .eq("stream_id", streamId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error leaving streaming session:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in leaveStream:", error);
      return false;
    }
  }

  /**
   * Create a new streaming session in a habitat
   */
  async createStream(streamData: StreamInsert): Promise<Stream> {
    try {
      const insertData: Record<string, any> = {
        description: streamData.description?.trim(),
        scheduled_time: streamData.scheduled_time,
        participant_count: streamData.participant_count || 0,
        max_participants: streamData.max_participants,
        created_by: streamData.created_by,
      };

      // Add media fields if provided
      if (streamData.tmdb_id !== undefined) {
        insertData.tmdb_id = streamData.tmdb_id;
      }
      if (streamData.media_type !== undefined) {
        insertData.media_type = streamData.media_type;
      }
      if (streamData.media_title !== undefined) {
        insertData.media_title = streamData.media_title.trim();
      }
      if (streamData.poster_path !== undefined) {
        insertData.poster_path = streamData.poster_path;
      }
      if (streamData.release_date !== undefined) {
        insertData.release_date = streamData.release_date;
      }
      if (streamData.runtime !== undefined) {
        insertData.runtime = streamData.runtime;
      }

      const { data: stream, error } = await supabase
        .from("streams")
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

      return stream;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a streaming session (only by creator)
   */
  async deleteStream(streamId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("streams")
        .update({ is_active: false })
        .eq("id", streamId)
        .eq("created_by", userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all public streams with pagination and filtering
   */
  async getPublicStreams(
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      status?: "upcoming" | "live" | "ended";
    } = {}
  ): Promise<{ streams: Stream[]; total: number }> {
    try {
      const { limit = 20, offset = 0, search, status } = options;

      let query = supabase
        .from("streams")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .eq("visibility", "public")
        .order("scheduled_time", { ascending: false });

      // Apply search filter
      if (search && search.trim()) {
        query = query.or(
          `media_title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Apply status filter
      if (status) {
        const now = new Date().toISOString();
        const thirtyMinutesAgo = new Date(
          Date.now() - 30 * 60 * 1000
        ).toISOString();
        const thirtyMinutesFromNow = new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString();

        switch (status) {
          case "upcoming":
            query = query.gt("scheduled_time", thirtyMinutesFromNow);
            break;
          case "live":
            query = query
              .gte("scheduled_time", thirtyMinutesAgo)
              .lte("scheduled_time", thirtyMinutesFromNow);
            break;
          case "ended":
            query = query.lt("scheduled_time", thirtyMinutesAgo);
            break;
        }
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: streams, error, count } = await query;

      if (error) {
        console.error("Error fetching public streams:", error);
        return { streams: [], total: 0 };
      }

      return { streams, total: count || 0 };
    } catch (error) {
      console.error("Error in getPublicStreams:", error);
      return { streams: [], total: 0 };
    }
  }

  /**
   * Get streams for a specific user (public + their private streams)
   */
  async getUserStreams(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      status?: "upcoming" | "live" | "ended";
    } = {}
  ): Promise<{ streams: StreamWithParticipants[]; total: number }> {
    try {
      const { limit = 20, offset = 0, search, status } = options;

      let query = supabase
        .from("streams")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .or(`visibility.eq.public,created_by.eq.${userId}`)
        .order("scheduled_time", { ascending: false });

      // Apply search filter
      if (search && search.trim()) {
        query = query.or(
          `media_title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Apply status filter
      if (status) {
        const now = new Date().toISOString();
        const thirtyMinutesAgo = new Date(
          Date.now() - 30 * 60 * 1000
        ).toISOString();
        const thirtyMinutesFromNow = new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString();

        switch (status) {
          case "upcoming":
            query = query.gt("scheduled_time", thirtyMinutesFromNow);
            break;
          case "live":
            query = query
              .gte("scheduled_time", thirtyMinutesAgo)
              .lte("scheduled_time", thirtyMinutesFromNow);
            break;
          case "ended":
            query = query.lt("scheduled_time", thirtyMinutesAgo);
            break;
        }
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: streams, error, count } = await query;

      if (error) {
        console.error("Error fetching user streams:", error);
        return { streams: [], total: 0 };
      }

      // Transform the data to match our interface
      const transformedStreams: StreamWithParticipants[] = (streams || []).map(
        (stream) => ({
          ...stream,
          participants: stream.participants || [],
          is_participant: false, // Will be determined based on user context
        })
      );

      return { streams: transformedStreams, total: count || 0 };
    } catch (error) {
      console.error("Error in getUserStreams:", error);
      return { streams: [], total: 0 };
    }
  }

  /**
   * Update participant count for a streaming session
   */
  private async updateParticipantCount(streamId: string): Promise<void> {
    try {
      const { count } = await supabase
        .from("stream_members")
        .select("*", { count: "exact", head: true })
        .eq("stream_id", streamId);

      await supabase
        .from("streams")
        .update({ participant_count: count || 0 })
        .eq("id", streamId);
    } catch (error) {
      console.error("Error updating participant count:", error);
    }
  }

  // ===== PARTICIPANT MANAGEMENT REPOSITORY METHODS =====

  /**
   * Transform raw participant data to StreamParticipant interface
   */
  private transformParticipantData(data: any): StreamParticipant {
    return {
      stream_id: data.stream_id,
      user_id: data.user_id,
      joined_at: data.joined_at,
      is_host: data.is_host,
      reminder_enabled: data.reminder_enabled,
      profile: data.profiles
        ? {
            display_name: data.profiles.display_name,
            avatar_url: data.profiles.avatar_url,
          }
        : undefined,
    };
  }

  /**
   * Create a new participant record
   */
  async createParticipant(participantData: {
    stream_id: string;
    user_id: string;
    is_host: boolean;
    reminder_enabled: boolean;
  }): Promise<StreamParticipant> {
    try {
      const { data, error } = await supabase
        .from("stream_members")
        .insert(participantData)
        .select(
          `
          id,
          stream_id,
          user_id,
          joined_at,
          is_host,
          reminder_enabled,
          created_at,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to create participant: ${error.message}`);
      }

      return {
        stream_id: data.stream_id,
        user_id: data.user_id,
        joined_at: data.joined_at,
        is_host: data.is_host,
        reminder_enabled: data.reminder_enabled,
        profile: data.user_profiles
          ? {
              display_name: (data.user_profiles as any).display_name,
              avatar_url: (data.user_profiles as any).avatar_url,
            }
          : undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get participant by ID
   */
  async getParticipantById(
    participantId: string
  ): Promise<StreamParticipant | null> {
    try {
      const { data, error } = await supabase
        .from("stream_members")
        .select(
          `
          id,
          stream_id,
          user_id,
          joined_at,
          is_host,
          reminder_enabled,
          created_at,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("id", participantId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching participant by ID:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        stream_id: data.stream_id,
        user_id: data.user_id,
        joined_at: data.joined_at,
        is_host: data.is_host,
        reminder_enabled: data.reminder_enabled,
        profile: data.user_profiles
          ? {
              display_name: (data.user_profiles as any).display_name,
              avatar_url: (data.user_profiles as any).avatar_url,
            }
          : undefined,
      };
    } catch (error) {
      console.error("Error in getParticipantById:", error);
      return null;
    }
  }

  /**
   * Update participant reminder setting
   */
  async updateParticipantReminder(
    streamId: string,
    userId: string,
    reminderEnabled: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("stream_members")
        .update({ reminder_enabled: reminderEnabled })
        .eq("stream_id", streamId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to update reminder setting: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete participant record
   */
  async deleteParticipant(streamId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("stream_members")
        .delete()
        .eq("stream_id", streamId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to delete participant: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get participant count for a stream
   */
  async getParticipantCount(streamId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("stream_members")
        .select("*", { count: "exact", head: true })
        .eq("stream_id", streamId);

      if (error) {
        console.error("Error getting participant count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getParticipantCount:", error);
      return 0;
    }
  }

  /**
   * Get stream host participant
   */
  async getStreamHost(streamId: string): Promise<StreamParticipant | null> {
    try {
      const { data, error } = await supabase
        .from("stream_members")
        .select(
          `
          id,
          stream_id,
          user_id,
          joined_at,
          is_host,
          reminder_enabled,
          created_at,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("stream_id", streamId)
        .eq("is_host", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching stream host:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        stream_id: data.stream_id,
        user_id: data.user_id,
        joined_at: data.joined_at,
        is_host: data.is_host,
        reminder_enabled: data.reminder_enabled,
        profile: data.user_profiles
          ? {
              display_name: (data.user_profiles as any).display_name,
              avatar_url: (data.user_profiles as any).avatar_url,
            }
          : undefined,
      };
    } catch (error) {
      console.error("Error in getStreamHost:", error);
      return null;
    }
  }

  /**
   * Update participant host status
   */
  async updateParticipantHostStatus(
    streamId: string,
    userId: string,
    isHost: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("stream_members")
        .update({ is_host: isHost })
        .eq("stream_id", streamId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to update host status: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get participants with profile information
   */
  async getParticipantsWithProfiles(
    streamId: string
  ): Promise<StreamParticipant[]> {
    try {
      const { data, error } = await supabase
        .from("stream_members")
        .select(
          `
          id,
          stream_id,
          user_id,
          joined_at,
          is_host,
          reminder_enabled,
          created_at,
          user_profiles:user_id (
            display_name,
            avatar_url
          )
        `
        )
        .eq("stream_id", streamId)
        .order("is_host", { ascending: false })
        .order("joined_at", { ascending: true });

      if (error) {
        console.error("Error fetching participants with user_profiles", error);
        return [];
      }

      return (data || []).map((participant) => ({
        id: participant.id,
        stream_id: participant.stream_id,
        user_id: participant.user_id,
        joined_at: participant.joined_at,
        is_host: participant.is_host,
        reminder_enabled: participant.reminder_enabled,
        created_at: participant.created_at,
        profile: participant.user_profiles
          ? {
              display_name: (participant.user_profiles as any).display_name,
              avatar_url: (participant.user_profiles as any).avatar_url,
            }
          : undefined,
      }));
    } catch (error) {
      console.error("Error in getParticipantsWithProfiles:", error);
      return [];
    }
  }

  // ===== PLAYBACK SYNCHRONIZATION REPOSITORY METHODS =====

  /**
   * Update playback state for a stream
   */
  async updatePlaybackState(
    streamId: string,
    playbackState: {
      time?: number;
      isPlaying?: boolean;
    }
  ): Promise<void> {
    try {
      const updateData: Record<string, any> = {
        last_sync_at: new Date().toISOString(),
      };

      if (playbackState.time !== undefined) {
        updateData.time = Math.floor(playbackState.time);
      }

      if (playbackState.isPlaying !== undefined) {
        updateData.is_playing = playbackState.isPlaying;
      }

      const { error } = await supabase
        .from("streams")
        .update(updateData)
        .eq("id", streamId);

      if (error) {
        throw new Error(`Failed to update playback state: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current playback state for a stream
   */
  async getPlaybackState(streamId: string): Promise<{
    time: number;
    isPlaying: boolean;
    lastSyncAt: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from("streams")
        .select("time, is_playing, last_sync_at")
        .eq("id", streamId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching playback state:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        time: data.time || 0,
        isPlaying: data.is_playing || false,
        lastSyncAt: data.last_sync_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in getPlaybackState:", error);
      return null;
    }
  }
}
