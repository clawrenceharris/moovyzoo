import { StreamingRepository } from "../data/stream.repository";
import type {
  StreamWithParticipants,
  StreamDashboardData,
  UserParticipationStatus,
  StreamParticipant,
  Stream,
  ParticipantJoinData,
  ParticipantChangePayload,
  StreamInsert,
} from "./stream.types";
import { AppErrorCode } from "@/utils/error-codes";
import { createNormalizedError } from "@/utils/normalize-error";
import { supabase } from "@/utils/supabase/client";
import { CreateStreamFormInput } from "./stream.schema";

/**
 * Service for streams business logic
 */
export class StreamService {
  private repository = new StreamingRepository();

  async createStream(userId: string, data: StreamInsert): Promise<Stream> {
    try {
      const stream = await this.repository.createStream({
        ...data,
        created_by: userId,
      });

      await this.repository.joinStream(stream.id, userId);
      return stream;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Get streaming session dashboard data
   */
  async getStreamingDashboard(
    streamId: string,
    userId: string
  ): Promise<StreamDashboardData | null> {
    try {
      const stream = await this.repository.getStreamById(streamId);

      if (!stream) {
        return null;
      }

      const participants = await this.repository.getStreamParticipants(
        streamId
      );
      const isParticipant = await this.repository.isUserParticipant(
        streamId,
        userId
      );

      // Determine user participation status
      const canJoinResult = this.canUserJoin(stream);
      const userParticipation: UserParticipationStatus = {
        isParticipant,
        canJoin: !isParticipant && canJoinResult.allowed,
        canLeave: isParticipant,
        joinedAt: isParticipant
          ? participants.find((p) => p.user_id === userId)?.joined_at
            ? new Date(
                participants.find((p) => p.user_id === userId)!.joined_at
              )
            : undefined
          : undefined,
      };
      // Update streaming session with user participation status
      stream.is_participant = isParticipant;

      return {
        stream,
        participants,
        userParticipation,
        canJoin: userParticipation.canJoin,
        canLeave: userParticipation.canLeave,
      };
    } catch (error) {
      console.error("Error getting streaming session dashboard:", error);
      return null;
    }
  }

  /**
   * Join a streaming session
   */
  async joinStream(streamId: string, userId: string): Promise<void> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid streaming session ID")
        );
      }

      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      // Get streaming session details
      const stream = await this.repository.getStreamById(streamId);

      if (!stream) {
        throw createNormalizedError(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }

      // Check if user is already a participant
      const isAlreadyParticipant = await this.repository.isUserParticipant(
        streamId,
        userId
      );
      if (isAlreadyParticipant) {
        throw createNormalizedError(AppErrorCode.ALREADY_PARTICIPANT);
      }

      // Check if user can join
      const canJoin = this.canUserJoin(stream);
      if (!canJoin.allowed) {
        throw createNormalizedError(canJoin.errorCode!);
      }

      // Join the streaming session
      const success = await this.repository.joinStream(streamId, userId);
      if (!success) {
        throw createNormalizedError(
          AppErrorCode.OPERATION_FAILED,
          new Error("Failed to join streaming session")
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Leave a streaming session
   */
  async leaveStream(streamId: string, userId: string): Promise<void> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid streaming session ID")
        );
      }

      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      // Check if user is a participant
      const isParticipant = await this.repository.isUserParticipant(
        streamId,
        userId
      );
      if (!isParticipant) {
        throw createNormalizedError(AppErrorCode.NOT_PARTICIPANT);
      }

      // Leave the streaming session
      const success = await this.repository.leaveStream(streamId, userId);
      if (!success) {
        throw createNormalizedError(
          AppErrorCode.OPERATION_FAILED,
          new Error("Failed to leave streaming session")
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user can join a streaming session
   */
  private canUserJoin(stream: StreamWithParticipants): {
    allowed: boolean;
    errorCode?: AppErrorCode;
  } {
    // Check if streaming session is active
    if (!stream.is_active) {
      return {
        allowed: false,
        errorCode: AppErrorCode.CANNOT_JOIN_WATCH_PARTY,
      };
    }

    // Check if streaming session has reached max participants
    if (
      stream.max_participants &&
      stream.participants.length >= stream.max_participants
    ) {
      return { allowed: false, errorCode: AppErrorCode.WATCH_PARTY_FULL };
    }

    return { allowed: true };
  }

  /**
   * Get streaming session with media and participation data
   */
  async getStream(id: string): Promise<StreamWithParticipants> {
    try {
      // Validate input parameters
      if (!id || typeof id !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid streaming session ID")
        );
      }
      const stream = await this.repository.getStreamById(id);
      console.log({ stream });
      if (!stream) {
        throw createNormalizedError(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }

      return stream;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get participants for a streaming session
   */
  async getParticipants(streamId: string): Promise<StreamParticipant[]> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid streaming session ID")
        );
      }
      const data = await this.repository.getStreamParticipants(streamId);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check user participation status for a streaming session
   */
  async checkUserParticipation(
    streamId: string,
    userId: string
  ): Promise<UserParticipationStatus> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid streaming session ID")
        );
      }

      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      const stream = await this.repository.getStreamById(streamId);

      if (!stream) {
        throw createNormalizedError(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }

      const participants = await this.repository.getStreamParticipants(
        streamId
      );
      const isParticipant = await this.repository.isUserParticipant(
        streamId,
        userId
      );

      // Determine user participation status
      const canJoinResult = this.canUserJoin(stream);
      const userParticipation: UserParticipationStatus = {
        isParticipant,
        canJoin: !isParticipant && canJoinResult.allowed,
        canLeave: isParticipant,
        joinedAt: isParticipant
          ? participants.find((p) => p.user_id === userId)?.joined_at
            ? new Date(
                participants.find((p) => p.user_id === userId)!.joined_at
              )
            : undefined
          : undefined,
      };

      return userParticipation;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get streaming session status
   */
  getStreamStatus(stream: StreamWithParticipants): {
    status: "upcoming" | "starting_soon" | "live" | "ended";
    timeUntilStart?: number;
  } {
    const scheduledTime = new Date(stream.scheduled_time);
    const now = new Date();
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    if (minutesUntilStart > 30) {
      return { status: "upcoming", timeUntilStart: minutesUntilStart };
    } else if (minutesUntilStart > 0) {
      return { status: "starting_soon", timeUntilStart: minutesUntilStart };
    } else if (minutesUntilStart >= -30) {
      return { status: "live" };
    } else {
      return { status: "ended" };
    }
  }

  /**
   * Get public streams with pagination and filtering
   */
  async getPublicStreams(
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      status?: "upcoming" | "live" | "ended";
    } = {}
  ): Promise<{ streams: StreamWithParticipants[]; total: number }> {
    try {
      const { streams, total } = await this.repository.getPublicStreams(
        options
      );
      const participantsWithProfiles = await Promise.all(
        streams.map((stream) =>
          this.repository.getParticipantsWithProfiles(stream.id)
        )
      );
      const streamsWithParticipants = streams.map((stream, index) => ({
        ...stream,
        is_participant: false,
        participants: participantsWithProfiles[index],
      }));
      return { streams: streamsWithParticipants, total };
    } catch (error) {
      throw error;
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
      // Validate input parameters
      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      return await this.repository.getUserStreams(userId, options);
    } catch (error) {
      throw error;
    }
  }

  // ===== PARTICIPANT MANAGEMENT METHODS =====

  /**
   * Join a stream with enhanced participant management
   */
  async joinStreamEnhanced(
    data: ParticipantJoinData
  ): Promise<StreamParticipant> {
    try {
      // Validate input parameters
      if (!data.streamId || typeof data.streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid stream ID")
        );
      }

      if (!data.userId || typeof data.userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      // Check if stream exists and is accessible
      const stream = await this.repository.getStreamById(data.streamId);
      if (!stream) {
        throw createNormalizedError(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }

      // Check if user is already a participant
      const existingParticipant = await this.getParticipantByUserId(
        data.streamId,
        data.userId
      );
      if (existingParticipant) {
        throw createNormalizedError(AppErrorCode.ALREADY_PARTICIPANT);
      }

      // Validate user can join
      const canJoin = this.canUserJoin(stream);
      if (!canJoin.allowed) {
        throw createNormalizedError(canJoin.errorCode!);
      }

      // Check if this will be the first participant (becomes host)
      const existingParticipants = await this.repository.getStreamParticipants(
        data.streamId
      );
      const isFirstParticipant = existingParticipants.length === 0;

      // Insert participant record
      const { data: participant, error } = await supabase
        .from("stream_members")
        .insert({
          stream_id: data.streamId,
          user_id: data.userId,
          is_host: isFirstParticipant,
          reminder_enabled: data.reminderEnabled || false,
        })
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
        if (error.code === "23505") {
          // Unique constraint violation
          throw createNormalizedError(AppErrorCode.ALREADY_PARTICIPANT);
        }
        throw createNormalizedError(
          AppErrorCode.OPERATION_FAILED,
          new Error(`Failed to join stream: ${error.message}`)
        );
      }

      // Transform the response to match our interface
      const transformedParticipant: StreamParticipant = {
        stream_id: participant.stream_id,
        user_id: participant.user_id,
        joined_at: participant.joined_at,
        is_host: participant.is_host,
        reminder_enabled: participant.reminder_enabled,
      };

      return transformedParticipant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Leave a stream with enhanced participant management
   */
  async leaveStreamEnhanced(streamId: string, userId: string): Promise<void> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid stream ID")
        );
      }

      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      // Check if user is a participant
      const participant = await this.getParticipantByUserId(streamId, userId);
      if (!participant) {
        throw createNormalizedError(AppErrorCode.NOT_PARTICIPANT);
      }

      // Remove participant record (triggers will handle host reassignment)
      const { error } = await supabase
        .from("stream_members")
        .delete()
        .eq("stream_id", streamId)
        .eq("user_id", userId);

      if (error) {
        throw createNormalizedError(
          AppErrorCode.OPERATION_FAILED,
          new Error(`Failed to leave stream: ${error.message}`)
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle reminder setting for a participant
   */
  async toggleReminder(
    streamId: string,
    userId: string,
    enabled: boolean
  ): Promise<void> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid stream ID")
        );
      }

      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      // Check if user is a participant
      const participant = await this.getParticipantByUserId(streamId, userId);
      if (!participant) {
        throw createNormalizedError(AppErrorCode.NOT_PARTICIPANT);
      }

      // Update reminder setting
      const { error } = await supabase
        .from("stream_members")
        .update({ reminder_enabled: enabled })
        .eq("stream_id", streamId)
        .eq("user_id", userId);

      if (error) {
        throw createNormalizedError(
          AppErrorCode.OPERATION_FAILED,
          new Error(`Failed to update reminder setting: ${error.message}`)
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get participant by user ID
   */
  async getParticipantByUserId(
    streamId: string,
    userId: string
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
        .eq("stream_id", streamId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching participant:", error);
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
      };
    } catch (error) {
      console.error("Error in getParticipantByUserId:", error);
      return null;
    }
  }

  /**
   * Check if user is host of a stream
   */
  async isUserHost(streamId: string, userId: string): Promise<boolean> {
    try {
      const participant = await this.getParticipantByUserId(streamId, userId);
      return participant?.is_host || false;
    } catch (error) {
      console.error("Error checking host status:", error);
      return false;
    }
  }

  /**
   * Transfer host privileges to another participant
   */
  async transferHost(
    streamId: string,
    currentHostId: string,
    newHostId: string
  ): Promise<void> {
    try {
      // Validate input parameters
      if (!streamId || !currentHostId || !newHostId) {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid parameters for host transfer")
        );
      }

      // Verify current user is host
      const isCurrentHost = await this.isUserHost(streamId, currentHostId);
      if (!isCurrentHost) {
        throw createNormalizedError(AppErrorCode.INSUFFICIENT_PERMISSIONS);
      }

      // Verify new host is a participant
      const newHostParticipant = await this.getParticipantByUserId(
        streamId,
        newHostId
      );
      if (!newHostParticipant) {
        throw createNormalizedError(AppErrorCode.NOT_PARTICIPANT);
      }

      // Perform host transfer in transaction
      const { error } = await supabase.rpc("transfer_stream_host", {
        stream_uuid: streamId,
        current_host_uuid: currentHostId,
        new_host_uuid: newHostId,
      });

      if (error) {
        throw createNormalizedError(
          AppErrorCode.OPERATION_FAILED,
          new Error(`Failed to transfer host: ${error.message}`)
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle edge case when stream is deleted while user is participant
   */
  async handleStreamDeletion(streamId: string): Promise<void> {
    try {
      // The database CASCADE DELETE will automatically remove participants
      // This method can be used for cleanup or notifications if needed
      console.log(
        `Stream ${streamId} deleted, participants automatically removed`
      );
    } catch (error) {
      console.error("Error handling stream deletion:", error);
    }
  }

  /**
   * Subscribe to real-time participant changes
   */
  subscribeToParticipantChanges(
    streamId: string,
    callback: (payload: ParticipantChangePayload) => void
  ) {
    const channel = supabase
      .channel(`stream-participants-${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stream_members",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const changePayload: ParticipantChangePayload = {
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as StreamParticipant,
            old: payload.old as StreamParticipant,
          };
          callback(changePayload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Get enhanced user participation status with host and reminder info
   */
  async checkUserParticipationEnhanced(
    streamId: string,
    userId: string
  ): Promise<UserParticipationStatus> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid stream ID")
        );
      }

      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      const stream = await this.repository.getStreamById(streamId);
      if (!stream) {
        throw createNormalizedError(AppErrorCode.WATCH_PARTY_NOT_FOUND);
      }

      const participant = await this.getParticipantByUserId(streamId, userId);
      const isParticipant = !!participant;

      // Determine user participation status
      const canJoinResult = this.canUserJoin(stream);

      return {
        isParticipant,
        canJoin: !isParticipant && canJoinResult.allowed,
        canLeave: isParticipant,
        joinedAt: participant?.joined_at
          ? new Date(participant.joined_at)
          : undefined,
        isHost: participant?.is_host || false,
        reminderEnabled: participant?.reminder_enabled || false,
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== PLAYBACK SYNCHRONIZATION SERVICE METHODS =====

  /**
   * Update playback state (host only)
   */
  async updatePlaybackState(
    streamId: string,
    userId: string,
    playbackState: {
      time?: number;
      isPlaying?: boolean;
    }
  ): Promise<void> {
    try {
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid stream ID")
        );
      }

      if (!userId || typeof userId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid user ID")
        );
      }

      // Verify user is host
      const isHost = await this.isUserHost(streamId, userId);
      if (!isHost) {
        throw createNormalizedError(
          AppErrorCode.INSUFFICIENT_PERMISSIONS,
          new Error("Only hosts can update playback state")
        );
      }

      // Update playback state in repository
      await this.repository.updatePlaybackState(streamId, playbackState);
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
      // Validate input parameters
      if (!streamId || typeof streamId !== "string") {
        throw createNormalizedError(
          AppErrorCode.INVALID_INPUT,
          new Error("Invalid stream ID")
        );
      }

      return await this.repository.getPlaybackState(streamId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subscribe to real-time playback state changes
   */
  subscribeToPlaybackChanges(
    streamId: string,
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel(`stream-playback-${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "streams",
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const streamService = new StreamService();
