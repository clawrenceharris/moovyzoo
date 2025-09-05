import { profilesRepository } from "../data/profiles.repository";
import type { 
  UserProfile, 
  CreateProfileData, 
  UpdateProfileData,
  ProfileServiceResult 
} from "./profiles.types";

/**
 * Service layer for profile business logic
 * Orchestrates repository calls and applies business rules
 */
export class ProfilesService {
  /**
   * Create a new user profile with validation
   */
  async createProfile(data: CreateProfileData): Promise<ProfileServiceResult<UserProfile>> {
    try {
      // Validate required fields
      if (!data.email || !data.userId) {
        return {
          success: false,
          errorCode: "VALIDATION_ERROR",
        };
      }

      // Check if profile already exists
      const exists = await profilesRepository.existsByUserId(data.userId);
      if (exists) {
        return {
          success: false,
          errorCode: "PROFILE_ALREADY_EXISTS",
        };
      }

      // Create profile
      const profile = await profilesRepository.create(data);
      
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.error("Error creating profile:", error);
      return {
        success: false,
        errorCode: "CREATE_PROFILE_FAILED",
      };
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
      // Validate user ID
      if (!userId) {
        return {
          success: false,
          errorCode: "INVALID_USER_ID",
        };
      }

      // Validate display name length if provided
      if (data.displayName !== undefined && data.displayName.length > 100) {
        return {
          success: false,
          errorCode: "DISPLAY_NAME_TOO_LONG",
        };
      }

      // Validate bio length if provided
      if (data.bio !== undefined && data.bio.length > 500) {
        return {
          success: false,
          errorCode: "BIO_TOO_LONG",
        };
      }

      // Validate quote length if provided
      if (data.quote !== undefined && data.quote.length > 200) {
        return {
          success: false,
          errorCode: "QUOTE_TOO_LONG",
        };
      }

      // Update profile
      const profile = await profilesRepository.updateByUserId(userId, data);
      
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        errorCode: "UPDATE_PROFILE_FAILED",
      };
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<ProfileServiceResult<UserProfile>> {
    try {
      if (!userId) {
        return {
          success: false,
          errorCode: "INVALID_USER_ID",
        };
      }

      const profile = await profilesRepository.getByUserId(userId);
      
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.error("Error getting profile:", error);
      return {
        success: false,
        errorCode: "GET_PROFILE_FAILED",
      };
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<ProfileServiceResult<void>> {
    try {
      if (!userId) {
        return {
          success: false,
          errorCode: "INVALID_USER_ID",
        };
      }

      await profilesRepository.updateLastActive(userId);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating last active:", error);
      return {
        success: false,
        errorCode: "UPDATE_LAST_ACTIVE_FAILED",
      };
    }
  }
}

// Export singleton instance
export const profilesService = new ProfilesService();