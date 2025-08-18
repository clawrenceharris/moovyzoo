import z from "zod";

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

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
