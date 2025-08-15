import { z } from "zod";

// Genre interface
export interface Genre {
  id: string;
  name: string;
  tmdbId: number;
  description: string;
  iconUrl?: string;
  isActive: boolean;
}

// Onboarding data interface
export interface OnboardingData {
  favoriteGenres: string[];
  favoriteMovies: string[];
  displayName: string;
  avatarUrl?: string;
}

// Onboarding step enum
export enum OnboardingStep {
  WELCOME = "welcome",
  DISPLAY_NAME = "display_name",
  GENRE_SELECTION = "genre_selection",
  AVATAR = "avatar",
  COMPLETE = "complete",
}

// Onboarding state interface
export interface OnboardingState {
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  isComplete: boolean;
  canSkip: boolean;
}

// Zod validation schemas
export const genreSelectionSchema = z.object({
  favoriteGenres: z
    .array(z.string())
    .min(1, "Please select at least one favorite genre")
    .max(10, "You can select up to 10 favorite genres"),
});

export const displayNameOnboardingSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s_-]+$/,
      "Display name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
});

export const avatarOnboardingSchema = z.object({
  avatarUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export const onboardingDataSchema = z.object({
  favoriteGenres: z
    .array(z.string())
    .min(1, "Please select at least one favorite genre")
    .max(10, "You can select up to 10 favorite genres"),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s_-]+$/,
      "Display name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
  avatarUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

// Type inference from schemas
export type GenreSelectionFormData = z.infer<typeof genreSelectionSchema>;
export type DisplayNameOnboardingFormData = z.infer<
  typeof displayNameOnboardingSchema
>;
export type AvatarOnboardingFormData = z.infer<typeof avatarOnboardingSchema>;
export type OnboardingFormData = z.infer<typeof onboardingDataSchema>;
