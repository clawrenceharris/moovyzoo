import { z } from "zod";

// Privacy settings schema
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "private"]).default("public"),
  showFavoriteGenres: z.boolean().default(true),
  allowDirectMessages: z.boolean().default(true),
});

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

// Type inference from schemas

// Create profile schema
export const createProfileSchema = z.object({
  userId: z.string("Invalid user ID format"),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Display name contains invalid characters"),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  favoriteGenres: z
    .array(z.string())
    .min(1, "Please select at least one favorite genre")
    .max(10, "You can select up to 10 favorite genres"),
  privacySettings: privacySettingsSchema.partial().optional(),
});

// Update profile schema
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Display name contains invalid characters")
    .optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  favoriteGenres: z
    .array(z.string())
    .min(1, "Please select at least one favorite genre")
    .max(10, "You can select up to 10 favorite genres")
    .optional(),
});
