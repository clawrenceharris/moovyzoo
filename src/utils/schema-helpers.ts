/**
 * Shared Zod schema utilities for the Habitats feature
 * Provides reusable schema patterns and factories
 */

import { z } from "zod";
import { isValidUUID } from "./validation";

/**
 * Common schema patterns used across the Habitats feature
 */
export const commonSchemas = {
  // UUID validation schema
  uuid: z.string().refine(isValidUUID, {
    message: "Invalid UUID format",
  }),

  // Email validation schema
  email: z.string().email("Please enter a valid email address"),

  // Message content schema for habitat discussions
  messageContent: z
    .string()
    .max(1000, "Message content must be 1000 characters or less")
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Message content is required",
    }),

  // Habitat name schema
  habitatName: z
    .string()
    .max(100, "Habitat name must be 100 characters or less")
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: "Habitat name is required",
    }),

  // Discussion title schema
  discussionTitle: z
    .string()
    .min(3, "Discussion title must be at least 3 characters")
    .max(200, "Discussion title must be 200 characters or less")
    .transform((val) => val.trim()),

  // Poll title schema
  pollTitle: z
    .string()
    .min(3, "Poll title must be at least 3 characters")
    .max(150, "Poll title must be 150 characters or less")
    .transform((val) => val.trim()),

  // Description schema (optional, longer text)
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .transform((val) => val?.trim()),

  // URL schema
  url: z.string().url("Please enter a valid URL").optional(),

  // Date schema for future dates
  futureDate: z
    .string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), {
      message: "Date must be in the future",
    }),

  // Positive integer schema
  positiveInt: z
    .number()
    .int("Must be a whole number")
    .positive("Must be a positive number"),

  // Non-negative integer schema
  nonNegativeInt: z
    .number()
    .int("Must be a whole number")
    .min(0, "Must be zero or positive"),
};

/**
 * Creates a pagination schema with configurable limits
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Zod schema for pagination parameters
 */
export function createPaginationSchema(maxLimit = 100) {
  return z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(maxLimit).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  });
}

/**
 * Creates a search schema with query validation
 * @param minLength - Minimum query length (default: 1)
 * @param maxLength - Maximum query length (default: 100)
 * @returns Zod schema for search parameters
 */
export function createSearchSchema(minLength = 1, maxLength = 100) {
  return z.object({
    query: z
      .string()
      .min(minLength, `Search query must be at least ${minLength} characters`)
      .max(maxLength, `Search query must be ${maxLength} characters or less`)
      .transform((val) => val.trim()),
    filters: z.record(z.string(), z.string()).optional(),
    ...createPaginationSchema().shape,
  });
}

/**
 * Creates a schema for habitat member operations
 * @returns Zod schema for member-related operations
 */
export function createMemberSchema() {
  return z.object({
    userId: commonSchemas.uuid,
    habitatId: commonSchemas.uuid,
    role: z.enum(["member", "moderator", "admin", "owner"]).default("member"),
  });
}

/**
 * Creates a schema for time-based operations (watch parties, events)
 * @returns Zod schema for time-based data
 */
export function createTimeBasedSchema() {
  return z
    .object({
      startTime: z.string().datetime("Invalid start time format"),
      endTime: z.string().datetime("Invalid end time format").optional(),
      timezone: z.string().default("UTC"),
    })
    .refine(
      (data) => {
        if (data.endTime) {
          return new Date(data.startTime) < new Date(data.endTime);
        }
        return true;
      },
      {
        message: "End time must be after start time",
        path: ["endTime"],
      }
    );
}

/**
 * Creates a schema for media-related operations
 * @returns Zod schema for media data
 */
export function createMediaSchema() {
  return z.object({
    tmdbId: z.number().int().positive("Invalid TMDB ID"),
    mediaType: z.enum(["movie", "tv"]),
    title: z.string().min(1, "Title is required"),
    posterPath: z.string().optional(),
    backdropPath: z.string().optional(),
    releaseDate: z.string().optional(),
    overview: z.string().optional(),
  });
}

/**
 * Creates a base response schema for API responses
 * @param dataSchema - Schema for the response data
 * @returns Zod schema for API response structure
 */
export function createResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.string(), z.any()).optional(),
      })
      .optional(),
    pagination: z
      .object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
      })
      .optional(),
  });
}
