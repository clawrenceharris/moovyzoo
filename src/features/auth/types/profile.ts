import { z } from "zod";

// Badge interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  earnedAt: Date;
}

// Core UserProfile interface
export interface UserProfile {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  favoriteGenres: string[];
  isPublic: boolean;
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
  onboardingCompleted: boolean;
}

// Firestore document structure (with Timestamps)
export interface UserProfileDocument {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  favoriteGenres?: string[];
  isPublic: boolean;
  badges: string[]; // Badge IDs in Firestore
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
  lastActiveAt: string;
}

// Profile update data
export interface ProfileUpdateData {
  displayName?: string;
  avatarUrl?: string;
  favoriteGenres?: string[];
  isPublic?: boolean;
}

// Privacy settings
export interface PrivacySettings {
  isPublic: boolean;
}

// Zod validation schemas
export const displayNameSchema = z
  .string()
  .min(2, "Display name must be at least 2 characters")
  .max(50, "Display name must be less than 50 characters")
  .regex(
    /^[a-zA-Z0-9\s_-]+$/,
    "Display name can only contain letters, numbers, spaces, hyphens, and underscores"
  );

export const avatarUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""));

export const favoriteGenresSchema = z
  .array(z.string())
  .min(1, "Please select at least one favorite genre")
  .max(10, "You can select up to 10 favorite genres");

export const profileUpdateSchema = z.object({
  displayName: displayNameSchema.optional(),
  avatarUrl: avatarUrlSchema,
  favoriteGenres: favoriteGenresSchema.optional(),
  isPublic: z.boolean().optional(),
});

export const privacySettingsSchema = z.object({
  isPublic: z.boolean(),
});

// Type inference from schemas
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;
