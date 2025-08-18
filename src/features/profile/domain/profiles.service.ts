import { profilesRepository } from "../data/profiles.repository";
import { createProfileSchema, updateProfileSchema } from "./profiles.schema";
import type {
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
  PublicProfile,
} from "./profiles.types";
import { normalizeError } from "@/utils/normalize-error";
import { AppErrorCode } from "@/types/error";

/**
 * Service layer for profile business logic
 * Handles validation, business rules, and error normalization
 */
export class ProfilesService {
  /**
   * Create a new user profile with validation
   */
  async createProfile(data: CreateProfileData): Promise<UserProfile> {
    try {
      // Validate input data
      const validationResult = createProfileSchema.safeParse(data);
      if (!validationResult.success) {
        throw validationResult.error;
      }
      // Sanitize and process data
      const sanitizedData = this.sanitizeProfileData(validationResult.data);

      // Create profile
      return await profilesRepository.create(sanitizedData);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      if (!userId) {
        throw new Error(AppErrorCode.DATABASE_PERMISSION_DENIED);
      }

      return await profilesRepository.getByUserId(userId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Update user profile with validation
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<UserProfile> {
    try {
      // Validate input data
      const validationResult = updateProfileSchema.safeParse(data);
      if (!validationResult.success) {
        throw validationResult.error;
      }

      // Sanitize and process data
      const sanitizedData = this.sanitizeProfileData(validationResult.data);

      // Update profile
      const updateResult = await profilesRepository.updateByUserId(
        userId,
        sanitizedData
      );

      return updateResult;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      await profilesRepository.updateLastActive(userId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Check if profile exists for user
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      return await profilesRepository.existsByUserId(userId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Get public profiles for discovery
   */
  async getPublicProfiles(limit = 20, offset = 0): Promise<PublicProfile[]> {
    try {
      return await profilesRepository.getPublicProfiles(limit, offset);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      await profilesRepository.deleteByUserId(userId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  /**
   * Sanitize profile data to prevent XSS and ensure data integrity
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sanitizeProfileData(data: any): any {
    const sanitized = { ...data };

    // Sanitize display name
    if (sanitized.displayName) {
      sanitized.displayName = sanitized.displayName.trim();
    }

    // Sanitize avatar URL
    if (sanitized.avatarUrl) {
      sanitized.avatarUrl = sanitized.avatarUrl.trim();
      // Remove empty string URLs
      if (sanitized.avatarUrl === "") {
        sanitized.avatarUrl = undefined;
      }
    }

    // Sanitize favorite genres
    if (sanitized.favoriteGenres) {
      sanitized.favoriteGenres = [
        ...new Set(
          sanitized.favoriteGenres
            .filter((genre: string) => genre && typeof genre === "string")
            .map((genre: string) => genre.trim())
        ),
      ];
    }

    return sanitized;
  }
}

// Export singleton instance
export const profilesService = new ProfilesService();
