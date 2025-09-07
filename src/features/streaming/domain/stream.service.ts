import { errorMap } from "@/utils/error-map";
import { StreamingRepository } from "../data/stream.repository";
import type {
  StreamWithParticipants,
  StreamDashboardData,
  UserParticipationStatus,
  StreamParticipant,
  CreateStreamData,
  Stream,
} from "./stream.types";
import { AppErrorCode } from "@/utils/error-codes";
import { createNormalizedError, normalizeError } from "@/utils/normalize-error";
import { withTransaction } from "@/utils/database-transaction";

/**
 * Service for streams business logic
 */
export class StreamService {
  private repository = new StreamingRepository();

  async createStream(userId: string, data: CreateStreamData): Promise<Stream> {
    try {
      console.log("Creating...");
      const stream = await this.repository.createStream({
        description: data.description,
        scheduled_time: data.scheduledTime,
        participant_count: 1, // Creator is automatically a participant
        max_participants: data.maxParticipants,
        created_by: userId,
        tmdb_id: data.media.tmdb_id,
        media_type: data.media.media_type,
        media_title: data.media.media_title,
        poster_path: data.media?.poster_path,
        release_date: data.media?.release_date,
        runtime: data.media?.runtime,
      });

      await this.repository.joinStream(stream.id, userId);
      return stream;
    } catch (error) {
      console.log(error);
      const normalizedError = normalizeError(error);
      throw normalizedError;
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
      throw normalizeError(error);
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
      throw normalizeError(error);
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
      stream.participant_count >= stream.max_participants
    ) {
      return { allowed: false, errorCode: AppErrorCode.WATCH_PARTY_FULL };
    }

    // Check if streaming session has already started (optional business rule)
    const scheduledTime = new Date(stream.scheduled_time);
    const now = new Date();

    // Allow joining up to 30 minutes after start time
    const joinCutoff = new Date(scheduledTime.getTime() + 30 * 60 * 1000);
    if (now > joinCutoff) {
      return { allowed: false, errorCode: AppErrorCode.WATCH_PARTY_ENDED };
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
      throw normalizeError(error);
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

      return await this.repository.getStreamParticipants(streamId);
    } catch (error) {
      throw normalizeError(error);
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
      throw normalizeError(error);
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
      return await this.repository.getPublicStreams(options);
    } catch (error) {
      throw normalizeError(error);
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
      throw normalizeError(error);
    }
  }
}

export const streamService = new StreamService();
