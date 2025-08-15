import { profilesRepository } from "../data/profiles.repository";
import { createProfileSchema, updateProfileSchema } from "./profiles.zod";
import { normalizeError } from "../utils/normalize-error";
import type {
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
  PublicProfile,
  ProfileServiceResult,
} from "./profiles.types";

/**
 * Service layer for profile business logic
 * Handles validation, business rules, and error normalization
 */
export class ProfilesService {
  /**
   * Create a new user profile with validation
   */
  async createProfile(
    data: CreateProfileData
  ): Promise<ProfileServiceResult<UserProfile>> {
    try {
      // Validate input data
      const validationResult = createProfileSchema.safeParse(data);
      if (!validationResult.success) {
        const errorCode = normalizeError(validationResult.error);
        return { success: false, errorCode };
      }

      // Check if profile already exists
      const existsResult = await profilesRepository.existsByUserId(data.userId);
      if (!existsResult.success) {
        const errorCode = normalizeError(new Error(existsResult.error));
        return { success: false, errorCode };
      }

      if (existsResult.data) {
        return { success: false, errorCode: "PROFILE_ALREADY_EXISTS" };
      }

      // Sanitize and process data
      const sanitizedData = this.sanitizeProfileData(validationResult.data);

      // Create profile
      const createResult = await profilesRepository.create(sanitizedData);
      if (!createResult.success) {
        const errorCode = normalizeError(new Error(createResult.error));
        return { success: false, errorCode };
      }

      return { success: true, data: createResult.data };
    } catch (error) {
      const errorCode = normalizeError(error);
      return { success: false, errorCode };
    }
  }

  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<ProfileServiceResult<UserProfile>> {
    try {
      if (!userId) {
        return { success: false, errorCode: "VALIDATION_REQUIRED_FIELD" };
      }

      const result = await profilesRepository.getByUserId(userId);
      if (!result.success) {
        if (result.error === "Profile not found") {
          return { success: false, errorCode: "PROFILE_NOT_FOUND" };
        }
        const errorCode = normalizeError(new Error(result.error));
        return { success: false, errorCode };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorCode = normalizeError(error);
      return { success: false, errorCode };
    }
  }

  /**
   * Update user profile with validation
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<ProfileServiceResult<UserProfile>> {
    try {
      if (!userId) {
        return { success: false, errorCode: "VALIDATION_REQUIRED_FIELD" };
      }

      // Validate input data
      const validationResult = updateProfileSchema.safeParse(data);
      if (!validationResult.success) {
        const errorCode = normalizeError(validationResult.error);
        return { success: false, errorCode };
      }

      // Check if profile exists
      const existsResult = await profilesRepository.existsByUserId(userId);
      if (!existsResult.success) {
        const errorCode = normalizeError(new Error(existsResult.error));
        return { success: false, errorCode };
      }

      if (!existsResult.data) {
        return { success: false, errorCode: "PROFILE_NOT_FOUND" };
      }

      // Sanitize and process data
      const sanitizedData = this.sanitizeProfileData(validationResult.data);

      // Update profile
      const updateResult = await profilesRepository.updateByUserId(
        userId,
        sanitizedData
      );
      if (!updateResult.success) {
        const errorCode = normalizeError(new Error(updateResult.error));
        return { success: false, errorCode };
      }

      return { success: true, data: updateResult.data };
    } catch (error) {
      const errorCode = normalizeError(error);
      return { success: false, errorCode };
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<ProfileServiceResult<void>> {
    try {
      if (!userId) {
        return { success: false, errorCode: "VALIDATION_REQUIRED_FIELD" };
      }

      const result = await profilesRepository.updateLastActive(userId);
      if (!result.success) {
        const errorCode = normalizeError(new Error(result.error));
        return { success: false, errorCode };
      }

      return { success: true };
    } catch (error) {
      const errorCode = normalizeError(error);
      return { success: false, errorCode };
    }
  }

  /**
   * Check if profile exists for user
   */
  async profileExists(userId: string): Promise<ProfileServiceResult<boolean>> {
    try {
      if (!userId) {
        return { success: false, errorCode: "VALIDATION_REQUIRED_FIELD" };
      }

      const result = await profilesRepository.existsByUserId(userId);
      if (!result.success) {
        const errorCode = normalizeError(new Error(result.error));
        return { success: false, errorCode };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorCode = normalizeError(error);
      return { success: false, errorCode };
    }
  }

  /**
   * Get public profiles for discovery
   */
  async getPublicProfiles(
    limit = 20,
    offset = 0
  ): Promise<ProfileServiceResult<PublicProfile[]>> {
    try {
      const result = await profilesRepository.getPublicProfiles(limit, offset);
      if (!result.success) {
        const errorCode = normalizeError(new Error(result.error));
        return { success: false, errorCode };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorCode = normalizeError(error);
      return { success: false, errorCode };
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<ProfileServiceResult<void>> {
    try {
      if (!userId) {
        return { success: false, errorCode: "VALIDATION_REQUIRED_FIELD" };
      }

      // Check if profile exists
      const existsResult = await profilesRepository.existsByUserId(userId);
      if (!existsResult.success) {
        const errorCode = normalizeError(new Error(existsResult.error));
        return { success: false, errorCode };
      }

      if (!existsResult.data) {
        return { success: false, errorCode: "PROFILE_NOT_FOUND" };
      }

      const result = await profilesRepository.deleteByUserId(userId);
      if (!result.success) {
        const errorCode = normalizeError(new Error(result.error));
        return { success: false, errorCode };
      }

      return { success: true };
    } catch (error) {
      const errorCode = normalizeError(error);
      return { success: false, errorCode };
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
