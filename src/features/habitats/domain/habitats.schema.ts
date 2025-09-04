import { z } from "zod";

/**
 * Validation schemas for habitat service operations
 * Used to validate input parameters and ensure data integrity
 */

// Message content validation schema
export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message content cannot be empty")
  .max(1000, "Message is too long (max 1000 characters)")
  .refine(
    (content) => content.replace(/\s+/g, " ").length > 0,
    "Message content is invalid"
  );

// Discussion name validation schema
export const discussionNameSchema = z
  .string()
  .trim()
  .min(3, "Discussion name must be at least 3 characters")
  .max(100, "Discussion name is too long (max 100 characters)")
  .refine(
    (name) => name.replace(/\s+/g, " ").length >= 3,
    "Discussion name is invalid"
  );

// Discussion description validation schema
export const discussionDescriptionSchema = z
  .string()
  .trim()

  .max(500, "Discussion description is too long (max 500 characters)")
  .optional();

// Poll title validation schema
export const pollTitleSchema = z
  .string()
  .trim()
  .min(5, "Poll title must be at least 5 characters")
  .max(200, "Poll title is too long (max 200 characters)")
  .refine(
    (title) => title.replace(/\s+/g, " ").length >= 5,
    "Poll title is invalid"
  );

// Poll options validation schema
export const pollOptionsSchema = z
  .record(z.string(), z.number().int().min(0))
  .refine(
    (options) => Object.keys(options).length >= 2,
    "Poll must have at least 2 options"
  )
  .refine(
    (options) => Object.keys(options).length <= 10,
    "Poll cannot have more than 10 options"
  );

// Watch party description validation schema
export const watchPartyDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Watch party description is too long (max 500 characters)")
  .refine(
    (description) => description.replace(/\s+/g, " ").length >= 10,
    "Watch party description is invalid"
  )
  .optional();

// Max participants validation schema
export const maxParticipantsSchema = z
  .number()
  .int()
  .min(2, "Watch party must allow at least 2 participants")
  .max(100, "Watch party cannot have more than 100 participants")
  .optional();

// Scheduled time validation schema
export const scheduledTimeSchema = z.string().refine((time) => {
  const date = new Date(time);
  return !isNaN(date.getTime()) && date > new Date();
}, "Scheduled time must be a valid future date");

// Timestamp validation schema
export const timestampSchema = z.date("Invalid timestamp format");

// Pagination parameters schema
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const sendMessageSchema = z.object({
  content: messageContentSchema,
});

// Habitat creation validation schemas
export const habitatNameSchema = z
  .string()
  .trim()
  .min(3, "Habitat name must be at least 3 characters")
  .max(100, "Habitat name is too long (max 100 characters)")
  .refine(
    (name) => name.replace(/\s+/g, " ").length >= 3,
    "Habitat name is invalid"
  );

export const habitatDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Habitat description is too long (max 500 characters)");

export const habitatTagsSchema = z
  .array(z.string().trim().min(1).max(30))
  .min(1, "At least one tag is required")
  .max(5, "Maximum 5 tags allowed")
  .refine((tags) => {
    const uniqueTags = Array.from(
      new Set(tags.map((tag) => tag.toLowerCase()))
    );
    return uniqueTags.length === tags.length;
  }, "Tags must be unique");

export const createHabitatSchema = z.object({
  name: habitatNameSchema,
  description: habitatDescriptionSchema,
  tags: habitatTagsSchema.optional(),
  isPublic: z.boolean().default(true),
});

// Form schema without tags validation (handled separately in component)
export const createHabitatFormSchema = z.object({
  name: habitatNameSchema,
  description: habitatDescriptionSchema,
  isPublic: z.boolean(),
});

export type CreateHabitatFormInput = z.infer<typeof createHabitatFormSchema>;

// Discussion validation schemas
export const createDiscussionSchema = z.object({
  name: discussionNameSchema,
  description: discussionDescriptionSchema,
});

export const getDiscussionsByHabitatSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Poll validation schemas
export const createPollSchema = z.object({
  title: pollTitleSchema,
  options: pollOptionsSchema,
});

export const votePollSchema = z.object({
  option: z.string().min(1, "Vote option is required"),
});

// Media validation schemas
export const mediaTypeSchema = z.enum(["movie", "tv"]);

export const watchPartyMediaSchema = z.object({
  tmdb_id: z.number().int().positive("Enter a movie or show to start watching"),
  media_type: mediaTypeSchema,
  media_title: z.string(),
  poster_path: z.string().optional(),
  release_date: z.string().optional(),
  runtime: z.number().int().positive().optional(),
});

// Watch party validation schemas
export const createWatchPartySchema = z.object({
  description: watchPartyDescriptionSchema,
  scheduledTime: scheduledTimeSchema,
  maxParticipants: maxParticipantsSchema,

  media: watchPartyMediaSchema,
});

// Type exports for use in service layer
export type MessageContent = z.infer<typeof messageContentSchema>;
export type Timestamp = z.infer<typeof timestampSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;

export type HabitatName = z.infer<typeof habitatNameSchema>;
export type HabitatDescription = z.infer<typeof habitatDescriptionSchema>;
export type HabitatTags = z.infer<typeof habitatTagsSchema>;
export type CreateHabitatInput = z.infer<typeof createHabitatSchema>;

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// Dashboard model type exports
export type DiscussionName = z.infer<typeof discussionNameSchema>;
export type DiscussionDescription = z.infer<typeof discussionDescriptionSchema>;
export type PollTitle = z.infer<typeof pollTitleSchema>;
export type PollOptions = z.infer<typeof pollOptionsSchema>;
export type ScheduledTime = z.infer<typeof scheduledTimeSchema>;

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type VotePollInput = z.infer<typeof votePollSchema>;

// Watch party form validation schema (for UI components)
export const createWatchPartyFormSchema = z
  .object({
    description: watchPartyDescriptionSchema.optional(),
    scheduledDate: z.string().min(1, "Scheduled date is required"),
    scheduledTime: z.string().min(1, "Scheduled time is required"),
    maxParticipants: z.string().optional(),
    media: watchPartyMediaSchema,
  })
  .refine(
    (data) => {
      // Validate that scheduled date/time is in the future
      const scheduledDateTime = new Date(
        `${data.scheduledDate}T${data.scheduledTime}`
      );

      return scheduledDateTime > new Date();
    },
    {
      message: "Scheduled time must be in the future",
      path: ["scheduledDate"],
    }
  );

export type CreateWatchPartyInput = z.infer<typeof createWatchPartySchema>;
export type CreateWatchPartyFormInput = z.infer<
  typeof createWatchPartyFormSchema
>;

// Additional validation type exports
export type WatchPartyDescription = z.infer<typeof watchPartyDescriptionSchema>;
export type MaxParticipants = z.infer<typeof maxParticipantsSchema>;
export type MediaType = z.infer<typeof mediaTypeSchema>;
