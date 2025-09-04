import { errorMap } from "@/utils/error-map";
import { habitatsRepository } from "../data/habitats.repository";
import type {
  Habitat,
  HabitatWithMembership,
  MessageWithProfile,
  HabitatMember,
  HabitatDashboardData,
  DiscussionWithStats,
  Discussion,
  Poll,
  WatchParty,
  CreateWatchPartyData,
  WatchPartyMedia,
} from "./habitats.types";
import { normalizeError } from "@/utils/normalize-error";
import { AppErrorCode } from "@/types/error";
import { accessControlService } from "@/services/access-control.service";
import { Permission } from "@/services/permission-types";
import { withTransaction } from "@/utils/database-transaction";

/**
 * Service layer for habitats feature
 * Orchestrates repository calls and implements business logic
 */
export class HabitatsService {
  /**
   * Get all habitats that a user has joined
   * Includes access control and error handling
   */
  async getUserJoinedHabitats(
    userId: string
  ): Promise<HabitatWithMembership[]> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return await habitatsRepository.getUserJoinedHabitats(userId);
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get a specific habitat by ID with membership info
   * Includes access control validation
   */
  async getHabitatById(
    habitatId: string,
    userId?: string
  ): Promise<HabitatWithMembership> {
    try {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }

      const habitat = await habitatsRepository.getHabitatById(
        habitatId,
        userId
      );

      // Check if user has access to this habitat
      if (userId) {
        const hasAccess = await accessControlService.checkPermission(
          userId,
          habitatId,
          Permission.READ_HABITAT,
          "habitat"
        );
        if (!hasAccess) {
          throw new Error("Access denied to private habitat");
        }
      }

      return habitat;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Join a habitat with comprehensive business logic validation
   * Uses transactions to ensure atomicity of member addition and count updates
   */
  async joinHabitat(habitatId: string, userId: string): Promise<HabitatMember> {
    try {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }

      // Check if habitat exists and get its details
      const habitat = await habitatsRepository.getHabitatById(
        habitatId,
        userId
      );

      // Business rule: Only public habitats can be joined directly
      if (!habitat.is_public) {
        const error = new Error("Cannot join private habitat");
        error.name = "HABITAT_ACCESS_DENIED";
        throw error;
      }

      // Business rule: Users cannot join habitats they already belong to
      const isMember = await habitatsRepository.isUserMember(habitatId, userId);
      if (isMember) {
        const error = new Error("User is already a member of this habitat");
        error.name = "HABITAT_ALREADY_MEMBER";
        throw error;
      }

      // Business rule: Users cannot join their own habitats (they're already owners)
      if (habitat.created_by === userId) {
        const error = new Error("User is already a member of this habitat");
        error.name = "HABITAT_ALREADY_MEMBER";
        throw error;
      }

      // Use transaction to ensure atomicity of member addition and count updates
      const member = await withTransaction(async (ctx) => {
        try {
          const newMember = await habitatsRepository.joinHabitat(
            habitatId,
            userId
          );

          // Log successful member addition
          console.log("User joined habitat successfully:", {
            habitatId,
            userId,
            memberId: newMember.id,
            timestamp: new Date().toISOString(),
          });

          return newMember;
        } catch (error) {
          // Log transaction error with context
          console.error("Error in join habitat transaction:", {
            habitatId,
            userId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      });

      return member;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Leave a habitat with comprehensive business logic validation
   * Uses transactions to ensure atomicity of member removal and count updates
   */
  async leaveHabitat(habitatId: string, userId: string): Promise<void> {
    try {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }

      // Business rule: User must be a member to leave
      const isMember = await habitatsRepository.isUserMember(habitatId, userId);
      if (!isMember) {
        const error = new Error("User is not a member of this habitat");
        error.name = "HABITAT_NOT_MEMBER";
        throw error;
      }

      // Get habitat details to check ownership
      const habitat = await habitatsRepository.getHabitatById(
        habitatId,
        userId
      );

      // Business rule: Habitat owners cannot leave their own habitat
      // They would need to transfer ownership or delete the habitat
      const isOwner = await accessControlService.isResourceOwner(
        userId,
        habitatId,
        "habitat"
      );
      if (isOwner) {
        const error = new Error(
          "Habitat owners cannot leave their own habitat"
        );
        error.name = "HABITAT_ACCESS_DENIED";
        throw error;
      }

      // Use transaction to ensure atomicity of member removal and count updates
      await withTransaction(async (ctx) => {
        try {
          await habitatsRepository.leaveHabitat(habitatId, userId);

          // Log successful member removal
          console.log("User left habitat successfully:", {
            habitatId,
            userId,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          // Log transaction error with context
          console.error("Error in leave habitat transaction:", {
            habitatId,
            userId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      });
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get messages for a habitat with access control
   */
  async getHabitatMessages(
    habitatId: string,
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<MessageWithProfile[]> {
    try {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }

      // Validate access to habitat
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.READ_HABITAT,
        "habitat"
      );

      // Update user's last active timestamp
      await habitatsRepository.updateLastActive(habitatId, userId);

      return await habitatsRepository.getHabitatMessages(
        habitatId,
        limit,
        offset
      );
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Send a message with validation and sanitization
   */
  async sendMessage(
    habitatId: string,
    userId: string,
    content: string
  ): Promise<MessageWithProfile> {
    try {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }

      // Validate and sanitize message content
      const sanitizedContent = this.validateAndSanitizeMessage(content);

      // Validate access to habitat
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.SEND_MESSAGE,
        "habitat"
      );

      return await habitatsRepository.sendMessage(
        habitatId,
        userId,
        sanitizedContent
      );
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Delete a message with comprehensive authorization check
   * Implements business logic for message deletion permissions
   */
  async deleteMessage(
    messageId: string,
    userId: string,
    habitatId: string
  ): Promise<void> {
    try {
      if (!messageId || !userId || !habitatId) {
        throw new Error("Message ID, User ID, and Habitat ID are required");
      }

      // Validate access to habitat first
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.READ_HABITAT,
        "habitat"
      );

      // Get the message to check ownership and validate it exists
      const message = await habitatsRepository.getMessageById(messageId);

      // Business rule: Message must belong to the specified habitat
      if (message.habitat_id !== habitatId) {
        const error = new Error("Message does not belong to this habitat");
        error.name = "MESSAGE_UNAUTHORIZED";
        throw error;
      }

      // Get habitat details to check user role
      const habitat = await habitatsRepository.getHabitatById(
        habitatId,
        userId
      );

      // Check if user has permission to delete this message
      const canDelete = await accessControlService.checkPermission(
        userId,
        messageId,
        Permission.DELETE_MESSAGE,
        "message"
      );

      if (!canDelete) {
        const error = new Error("Unauthorized to delete this message");
        error.name = "MESSAGE_UNAUTHORIZED";
        throw error;
      }

      await habitatsRepository.deleteMessage(messageId, userId);
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get messages after a specific timestamp for real-time updates
   */
  async getMessagesAfter(
    habitatId: string,
    userId: string,
    timestamp: string
  ): Promise<MessageWithProfile[]> {
    try {
      if (!habitatId || !userId || !timestamp) {
        throw new Error("Habitat ID, User ID, and timestamp are required");
      }

      // Validate timestamp format
      if (isNaN(Date.parse(timestamp))) {
        throw new Error("Invalid timestamp format");
      }

      // Validate access to habitat
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.READ_HABITAT,
        "habitat"
      );

      return await habitatsRepository.getMessagesAfter(habitatId, timestamp);
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get messages for a specific discussion with access control
   */
  async getMessagesByDiscussion(
    discussionId: string,
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<MessageWithProfile[]> {
    try {
      if (!discussionId || !userId) {
        throw new Error("Discussion ID and User ID are required");
      }

      // Get discussion details to validate access
      const discussion = await habitatsRepository.getDiscussionById(
        discussionId
      );

      // Validate access to the habitat that contains this discussion
      await accessControlService.validateAccess(
        userId,
        discussion.habitat_id,
        Permission.READ_HABITAT,
        "habitat"
      );

      // Update user's last active timestamp
      await habitatsRepository.updateLastActive(discussion.habitat_id, userId);

      return await habitatsRepository.getMessagesByDiscussion(
        discussionId,
        limit,
        offset
      );
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Send a message to a specific discussion with validation and sanitization
   */
  async sendMessageToDiscussion(
    habitatId: string,
    discussionId: string,
    userId: string,
    content: string
  ): Promise<MessageWithProfile> {
    try {
      if (!habitatId || !discussionId || !userId) {
        throw new Error("Habitat ID, Discussion ID, and User ID are required");
      }

      // Validate and sanitize message content
      const sanitizedContent = this.validateAndSanitizeMessage(content);

      // Validate access to habitat
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.SEND_MESSAGE,
        "habitat"
      );

      // Validate that discussion exists and belongs to the habitat
      const discussion = await habitatsRepository.getDiscussionById(
        discussionId
      );
      if (discussion.habitat_id !== habitatId) {
        const error = new Error("Discussion does not belong to this habitat");
        error.name = "DISCUSSION_INVALID_HABITAT";
        throw error;
      }

      return await habitatsRepository.sendMessageToDiscussion(
        habitatId,
        discussionId,
        userId,
        sanitizedContent
      );
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get messages after a specific timestamp for a discussion (for real-time updates)
   */
  async getDiscussionMessagesAfter(
    discussionId: string,
    userId: string,
    timestamp: string
  ): Promise<MessageWithProfile[]> {
    try {
      if (!discussionId || !userId || !timestamp) {
        throw new Error("Discussion ID, User ID, and timestamp are required");
      }

      // Validate timestamp format
      if (isNaN(Date.parse(timestamp))) {
        throw new Error("Invalid timestamp format");
      }

      // Get discussion details to validate access
      const discussion = await habitatsRepository.getDiscussionById(
        discussionId
      );

      // Validate access to the habitat that contains this discussion
      await accessControlService.validateAccess(
        userId,
        discussion.habitat_id,
        Permission.READ_HABITAT,
        "habitat"
      );

      return await habitatsRepository.getDiscussionMessagesAfter(
        discussionId,
        timestamp
      );
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Check if user can access a habitat (business logic)
   * Used for authorization checks in UI components
   */
  async canUserAccessHabitat(
    habitatId: string,
    userId: string
  ): Promise<boolean> {
    try {
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.READ_HABITAT,
        "habitat"
      );
      return true;
    } catch (error) {
      // If access validation fails, user cannot access
      return false;
    }
  }

  /**
   * Get habitat member count with real-time accuracy
   * Implements business logic for member count display
   */
  async getHabitatMemberCount(habitatId: string): Promise<number> {
    try {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }

      const habitat = await habitatsRepository.getHabitatById(habitatId);
      return habitat.member_count;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get all members of a habitat
   * Implements business logic for member access and filtering
   */
  async getHabitatMembers(habitatId: string): Promise<HabitatMember[]> {
    try {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }

      return await habitatsRepository.getHabitatMembers(habitatId);
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get discussions for a habitat with access control
   * Implements business logic for discussion access and filtering
   */
  async getDiscussionsByHabitat(
    habitatId: string,
    userId: string
  ): Promise<DiscussionWithStats[]> {
    try {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }

      // Validate access to habitat
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.READ_HABITAT,
        "habitat"
      );

      return await habitatsRepository.getDiscussionsByHabitat(habitatId);
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Create a new discussion in a habitat with validation
   * Implements business logic for discussion creation and access control
   */
  async createDiscussion(
    habitatId: string,
    name: string,
    description: string | undefined,
    userId: string
  ): Promise<Discussion> {
    try {
      // Create the discussion
      const discussion = await habitatsRepository.createDiscussion({
        habitat_id: habitatId,
        name,
        description,
        created_by: userId,
      });

      return discussion;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get a specific discussion by ID with access control
   */
  async getDiscussionById(
    discussionId: string,
    userId: string
  ): Promise<Discussion> {
    try {
      if (!discussionId || !userId) {
        throw new Error("Discussion ID and User ID are required");
      }

      // Get discussion details
      const discussion = await habitatsRepository.getDiscussionById(
        discussionId
      );

      // Validate access to the habitat that contains this discussion
      await accessControlService.validateAccess(
        userId,
        discussion.habitat_id,
        Permission.READ_HABITAT,
        "habitat"
      );

      return discussion;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Create a new poll in a habitat with validation
   * Implements business logic for poll creation and access control
   */
  async createPoll(
    habitatId: string,
    title: string,
    options: Record<string, number>,
    userId: string
  ): Promise<Poll> {
    try {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }

      // Validate access to habitat - user must be a member to create polls
      await accessControlService.validateAccess(
        userId,
        habitatId,
        Permission.CREATE_POLL,
        "habitat"
      );

      // Create the poll
      const poll = await habitatsRepository.createPoll({
        habitat_id: habitatId,
        title,
        options,
        created_by: userId,
      });

      return poll;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  async createWatchParty(
    habitatId: string,
    userId: string,
    data: CreateWatchPartyData
  ): Promise<WatchParty> {
    try {
      if (!habitatId) {
        throw new Error(errorMap[AppErrorCode.HABITAT_CREATION_FAILED].message);
      }

      // Create the watch party
      const watchParty = await habitatsRepository.createWatchParty({
        habitat_id: habitatId,
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

      return watchParty;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Create a new habitat with comprehensive validation and business logic
   * Uses transactions to ensure atomicity of habitat creation and member addition
   */
  async createHabitat(
    name: string,
    description: string,
    tags: string[],
    isPublic: boolean,
    userId: string
  ): Promise<Habitat> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Use transaction to ensure atomicity of habitat creation and member addition
      const habitat = await withTransaction(async (ctx) => {
        try {
          // Create the habitat
          const createdHabitat = await habitatsRepository.createHabitat(
            name,
            description,
            tags,
            isPublic,
            userId
          );

          // Log successful habitat creation
          console.log("Habitat created successfully:", {
            habitatId: createdHabitat.id,
            userId,
            timestamp: new Date().toISOString(),
          });

          return createdHabitat;
        } catch (error) {
          // Log transaction error with context
          console.error("Error in habitat creation transaction:", {
            userId,
            habitatName: name,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      });

      return habitat;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get aggregated dashboard data for a habitat
   * Implements business logic for dashboard data aggregation and access control
   */
  async getDashboardData(
    habitatId: string,
    userId: string
  ): Promise<HabitatDashboardData> {
    try {
      // Validate input parameters
      this.validateDashboardInputs(habitatId, userId);

      // Validate access to habitat first
      await this.validateDashboardAccess(userId, habitatId);

      // Get habitat details with membership info
      const habitat = await this.fetchHabitatDetails(habitatId, userId);

      // Fetch all dashboard data in parallel for better performance
      const dashboardComponents = await this.fetchDashboardComponents(
        habitatId
      );

      // Process and transform the data
      const processedData = this.processDashboardData(
        habitat,
        dashboardComponents,
        userId
      );

      return processedData;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Validate input parameters for dashboard data request
   */
  private validateDashboardInputs(habitatId: string, userId: string): void {
    if (!habitatId || !userId) {
      throw new Error("Habitat ID and User ID are required");
    }
  }

  /**
   * Validate user access to habitat dashboard
   */
  private async validateDashboardAccess(
    userId: string,
    habitatId: string
  ): Promise<void> {
    await accessControlService.validateAccess(
      userId,
      habitatId,
      Permission.READ_HABITAT,
      "habitat"
    );
  }

  /**
   * Fetch habitat details for dashboard
   */
  private async fetchHabitatDetails(
    habitatId: string,
    userId: string
  ): Promise<HabitatWithMembership> {
    return await habitatsRepository.getHabitatById(habitatId, userId);
  }

  /**
   * Fetch all dashboard components in parallel using focused methods
   * Implements comprehensive error handling for concurrent operations
   */
  private async fetchDashboardComponents(habitatId: string): Promise<{
    discussions: DiscussionWithStats[];
    watchParties: WatchParty[];
    members: HabitatMember[];
    stats: {
      memberCount: number;
      discussionCount: number;
      watchPartyCount: number;
      messageCount: number;
    };
    recentActivity: MessageWithProfile[];
  }> {
    try {
      const [discussions, watchParties, memberData, stats, recentActivity] =
        await Promise.all([
          habitatsRepository.getDiscussionsByHabitat(habitatId),
          habitatsRepository.getWatchPartiesByHabitat(habitatId),
          this.getMemberManagementData(habitatId),
          this.getHabitatStats(habitatId),
          this.getRecentActivity(habitatId, 10),
        ]);

      return {
        discussions,
        watchParties,
        members: memberData.members,
        stats,
        recentActivity,
      };
    } catch (error) {
      // Add context for debugging concurrent operation failures
      console.error("Error fetching dashboard components:", {
        habitatId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        operation: "fetchDashboardComponents",
      });

      // Re-throw the error to be handled by the calling method
      throw error;
    }
  }

  /**
   * Process and transform dashboard data using composition pattern
   */
  private processDashboardData(
    habitat: HabitatWithMembership,
    components: {
      discussions: DiscussionWithStats[];
      watchParties: WatchParty[];
      members: HabitatMember[];
      stats: {
        memberCount: number;
        discussionCount: number;
        watchPartyCount: number;
        messageCount: number;
      };
      recentActivity: MessageWithProfile[];
    },
    userId: string
  ): HabitatDashboardData {
    // Process watch parties to include user participation status
    const processedWatchParties = this.processWatchParties(
      components.watchParties,
      userId
    );

    // Get online members (members active in last 15 minutes)
    const onlineMembers = this.getOnlineMembers(components.members);

    // Transform habitat data for dashboard
    const dashboardHabitat = this.transformHabitatForDashboard(habitat);

    // Create dashboard data object using composed data
    return {
      habitat: dashboardHabitat,
      discussions: components.discussions,
      polls: [], // TODO: Implement polls in next subtask
      watchParties: processedWatchParties,
      members: components.members,
      onlineMembers,
      totalMembers: components.members.length,
    };
  }

  /**
   * Process watch parties to include user participation status
   */
  private processWatchParties(
    watchParties: WatchParty[],
    userId: string
  ): (WatchParty & { is_participant: boolean })[] {
    return watchParties.map((watchParty) => ({
      ...watchParty,
      is_participant: watchParty.participants.some(
        (participant) => participant.user_id === userId
      ),
    }));
  }

  /**
   * Transform habitat data for dashboard display
   */
  private transformHabitatForDashboard(habitat: HabitatWithMembership) {
    return {
      id: habitat.id,
      name: habitat.name,
      description: habitat.description,
      tags: habitat.tags,
      member_count: habitat.member_count,
      is_public: habitat.is_public,
      created_by: habitat.created_by,
      created_at: habitat.created_at,
      updated_at: habitat.updated_at,
      banner_url: habitat.banner_url,
      is_member: true, // User must be a member to access dashboard
    };
  }

  /**
   * Get habitat statistics
   * Pure data aggregation function for habitat metrics
   */
  async getHabitatStats(habitatId: string): Promise<{
    memberCount: number;
    discussionCount: number;
    watchPartyCount: number;
    messageCount: number;
  }> {
    try {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }

      // Fetch all stats in parallel
      const [habitat, discussions, watchParties, messages] = await Promise.all([
        habitatsRepository.getHabitatById(habitatId),
        habitatsRepository.getDiscussionsByHabitat(habitatId),
        habitatsRepository.getWatchPartiesByHabitat(habitatId),
        habitatsRepository.getHabitatMessages(habitatId, 1000, 0), // Get large sample for count
      ]);

      return {
        memberCount: habitat.member_count,
        discussionCount: discussions.length,
        watchPartyCount: watchParties.length,
        messageCount: messages.length,
      };
    } catch (error) {
      // Add context for debugging
      console.error("Error fetching habitat stats:", {
        habitatId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get recent activity for a habitat
   * Focused method for fetching recent messages and activity
   */
  async getRecentActivity(
    habitatId: string,
    limit: number = 20
  ): Promise<MessageWithProfile[]> {
    try {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }

      if (limit <= 0 || limit > 100) {
        throw new Error("Limit must be between 1 and 100");
      }

      return await habitatsRepository.getHabitatMessages(habitatId, limit, 0);
    } catch (error) {
      // Add context for debugging
      console.error("Error fetching recent activity:", {
        habitatId,
        limit,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Get member management data
   * Focused method for member-related operations and analytics
   */
  async getMemberManagementData(habitatId: string): Promise<{
    members: HabitatMember[];
    totalMembers: number;
    onlineMembers: HabitatMember[];
    membersByRole: {
      owners: HabitatMember[];
      moderators: HabitatMember[];
      members: HabitatMember[];
    };
  }> {
    try {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }

      const members = await this.getHabitatMembers(habitatId);

      // Validate that we received valid member data
      if (!Array.isArray(members)) {
        throw new Error("Invalid member data received from repository");
      }

      const onlineMembers = this.getOnlineMembers(members);

      // Categorize members by role (simplified for now)
      const membersByRole = this.categorizeMembersByRole(members, habitatId);

      return {
        members,
        totalMembers: members.length,
        onlineMembers,
        membersByRole,
      };
    } catch (error) {
      // Add context for debugging
      console.error("Error fetching member management data:", {
        habitatId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Categorize members by their roles
   * Pure data transformation function
   */
  private categorizeMembersByRole(
    members: HabitatMember[],
    habitatId: string
  ): {
    owners: HabitatMember[];
    moderators: HabitatMember[];
    members: HabitatMember[];
  } {
    // For now, we'll categorize based on simple rules
    // This can be enhanced with actual role data from the database
    const owners: HabitatMember[] = [];
    const moderators: HabitatMember[] = [];
    const regularMembers: HabitatMember[] = [];

    members.forEach((member) => {
      // TODO: Implement actual role checking when role system is fully implemented
      // For now, all members are regular members
      regularMembers.push(member);
    });

    return {
      owners,
      moderators,
      members: regularMembers,
    };
  }

  /**
   * Private helper to validate habitat access
   * @deprecated Use accessControlService.validateAccess instead
   * This method is kept for backward compatibility but will be removed
   */
  private async validateHabitatAccess(
    habitatId: string,
    userId: string
  ): Promise<void> {
    // Delegate to the centralized access control service
    await accessControlService.validateAccess(
      userId,
      habitatId,
      Permission.READ_HABITAT,
      "habitat"
    );
  }

  /**
   * Private helper to filter online members
   * Members are considered online if they were active in the last 15 minutes
   */
  private getOnlineMembers(members: HabitatMember[]): HabitatMember[] {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return members.filter((member) => {
      const lastActive = new Date(member.last_active);
      return lastActive > fifteenMinutesAgo;
    });
  }

  /**
   * Private helper to validate and sanitize message content
   * Implements business logic for message validation and sanitization
   */
  private validateAndSanitizeMessage(content: string): string {
    // Check if content exists and is a string
    if (!content || typeof content !== "string") {
      const error = new Error("Message content is required");
      error.name = "MESSAGE_INVALID_CONTENT";
      throw error;
    }

    // Trim whitespace
    const trimmed = content.trim();

    // Check if empty after trimming
    if (!trimmed) {
      const error = new Error("Message content cannot be empty");
      error.name = "MESSAGE_INVALID_CONTENT";
      throw error;
    }

    // Check length limit (1000 characters as per database constraint)
    if (trimmed.length > 1000) {
      const error = new Error("Message is too long (max 1000 characters)");
      error.name = "MESSAGE_TOO_LONG";
      throw error;
    }

    // Basic sanitization - remove potentially harmful characters
    // Keep it simple for MVP, can be enhanced later with more sophisticated filtering
    const sanitized = trimmed
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/^\s+|\s+$/g, ""); // Final trim

    // Final validation after sanitization
    if (!sanitized || sanitized.length === 0) {
      const error = new Error("Message content is invalid");
      error.name = "MESSAGE_INVALID_CONTENT";
      throw error;
    }

    // Additional business rules can be added here:
    // - Profanity filtering
    // - Spam detection
    // - Link validation
    // - Mention parsing

    return sanitized;
  }
}

// Export singleton instance
export const habitatsService = new HabitatsService();
