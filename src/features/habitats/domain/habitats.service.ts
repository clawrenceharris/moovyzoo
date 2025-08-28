import { habitatsRepository } from "../data/habitats.repository";
import type {
  Habitat,
  HabitatWithMembership,
  MessageWithProfile,
  HabitatMember,
} from "./habitats.types";
import { normalizeError } from "@/utils/normalize-error";

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

      // Check if habitat is private and user is not a member
      if (!habitat.is_public && userId && !habitat.is_member) {
        throw new Error("Access denied to private habitat");
      }

      return habitat;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Join a habitat with comprehensive business logic validation
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

      return await habitatsRepository.joinHabitat(habitatId, userId);
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Leave a habitat with comprehensive business logic validation
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
      if (habitat.user_role === "owner" || habitat.created_by === userId) {
        const error = new Error(
          "Habitat owners cannot leave their own habitat"
        );
        error.name = "HABITAT_ACCESS_DENIED";
        throw error;
      }

      await habitatsRepository.leaveHabitat(habitatId, userId);
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
      await this.validateHabitatAccess(habitatId, userId);

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
      await this.validateHabitatAccess(habitatId, userId);

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
      await this.validateHabitatAccess(habitatId, userId);

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

      // Business logic for deletion authorization:
      // 1. Message author can always delete their own messages
      // 2. Habitat owner can delete any message in their habitat
      const isMessageAuthor = message.user_id === userId;
      const isHabitatOwner =
        habitat.user_role === "owner" || habitat.created_by === userId;

      if (!isMessageAuthor && !isHabitatOwner) {
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
      await this.validateHabitatAccess(habitatId, userId);

      return await habitatsRepository.getMessagesAfter(habitatId, timestamp);
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
      await this.validateHabitatAccess(habitatId, userId);
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
   * Create a new habitat with comprehensive validation and business logic
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

      // Validate and sanitize habitat name
      const sanitizedName = this.validateAndSanitizeHabitatName(name);

      // Validate and sanitize description
      const sanitizedDescription =
        this.validateAndSanitizeDescription(description);

      // Validate and sanitize tags
      const sanitizedTags = this.validateAndSanitizeTags(tags);

      // Create the habitat
      const habitat = await habitatsRepository.createHabitat(
        sanitizedName,
        sanitizedDescription,
        sanitizedTags,
        isPublic,
        userId
      );

      return habitat;
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  }

  /**
   * Private helper to validate habitat access
   * Implements business logic for habitat access control
   */
  private async validateHabitatAccess(
    habitatId: string,
    userId: string
  ): Promise<void> {
    try {
      const habitat = await habitatsRepository.getHabitatById(
        habitatId,
        userId
      );

      // Check if habitat is public or user is a member
      if (!habitat.is_public && !habitat.is_member) {
        const accessError = new Error("Access denied to habitat");
        accessError.name = "HABITAT_ACCESS_DENIED";
        throw accessError;
      }

      // For private habitats, double-check membership status
      if (!habitat.is_public) {
        const isMember = await habitatsRepository.isUserMember(
          habitatId,
          userId
        );
        if (!isMember) {
          const accessError = new Error("Access denied to private habitat");
          accessError.name = "HABITAT_ACCESS_DENIED";
          throw accessError;
        }
      }
    } catch (error) {
      // Re-throw with proper error handling
      if (error instanceof Error && error.name === "HABITAT_ACCESS_DENIED") {
        throw error;
      }
      // Handle case where habitat doesn't exist
      if (error instanceof Error && error.message.includes("not found")) {
        const notFoundError = new Error("Habitat not found");
        notFoundError.name = "HABITAT_NOT_FOUND";
        throw notFoundError;
      }
      throw error;
    }
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

  /**
   * Private helper to validate and sanitize habitat name
   */
  private validateAndSanitizeHabitatName(name: string): string {
    if (!name || typeof name !== "string") {
      const error = new Error("Habitat name is required");
      error.name = "HABITAT_INVALID_NAME";
      throw error;
    }

    const trimmed = name.trim();

    if (!trimmed) {
      const error = new Error("Habitat name cannot be empty");
      error.name = "HABITAT_INVALID_NAME";
      throw error;
    }

    if (trimmed.length < 3) {
      const error = new Error("Habitat name must be at least 3 characters");
      error.name = "HABITAT_INVALID_NAME";
      throw error;
    }

    if (trimmed.length > 100) {
      const error = new Error("Habitat name is too long (max 100 characters)");
      error.name = "HABITAT_INVALID_NAME";
      throw error;
    }

    // Basic sanitization
    const sanitized = trimmed
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!sanitized || sanitized.length < 3) {
      const error = new Error("Habitat name is invalid");
      error.name = "HABITAT_INVALID_NAME";
      throw error;
    }

    return sanitized;
  }

  /**
   * Private helper to validate and sanitize habitat description
   */
  private validateAndSanitizeDescription(description: string): string {
    if (!description || typeof description !== "string") {
      const error = new Error("Habitat description is required");
      error.name = "HABITAT_INVALID_DESCRIPTION";
      throw error;
    }

    const trimmed = description.trim();

    if (!trimmed) {
      const error = new Error("Habitat description cannot be empty");
      error.name = "HABITAT_INVALID_DESCRIPTION";
      throw error;
    }

    if (trimmed.length < 10) {
      const error = new Error(
        "Habitat description must be at least 10 characters"
      );
      error.name = "HABITAT_INVALID_DESCRIPTION";
      throw error;
    }

    if (trimmed.length > 500) {
      const error = new Error(
        "Habitat description is too long (max 500 characters)"
      );
      error.name = "HABITAT_INVALID_DESCRIPTION";
      throw error;
    }

    // Basic sanitization
    const sanitized = trimmed
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!sanitized || sanitized.length < 10) {
      const error = new Error("Habitat description is invalid");
      error.name = "HABITAT_INVALID_DESCRIPTION";
      throw error;
    }

    return sanitized;
  }

  /**
   * Private helper to validate and sanitize habitat tags
   */
  private validateAndSanitizeTags(tags: string[]): string[] {
    if (!Array.isArray(tags)) {
      const error = new Error("Tags must be an array");
      error.name = "HABITAT_INVALID_TAGS";
      throw error;
    }

    if (tags.length === 0) {
      const error = new Error("At least one tag is required");
      error.name = "HABITAT_INVALID_TAGS";
      throw error;
    }

    if (tags.length > 5) {
      const error = new Error("Maximum 5 tags allowed");
      error.name = "HABITAT_INVALID_TAGS";
      throw error;
    }

    const sanitizedTags = tags
      .map((tag) => {
        if (typeof tag !== "string") {
          return "";
        }
        return tag.trim().toLowerCase();
      })
      .filter((tag) => tag.length > 0)
      .filter((tag) => tag.length <= 30)
      .slice(0, 5); // Ensure max 5 tags

    if (sanitizedTags.length === 0) {
      const error = new Error("At least one valid tag is required");
      error.name = "HABITAT_INVALID_TAGS";
      throw error;
    }

    // Remove duplicates
    const uniqueTags = [...new Set(sanitizedTags)];

    return uniqueTags;
  }
}

// Export singleton instance
export const habitatsService = new HabitatsService();
