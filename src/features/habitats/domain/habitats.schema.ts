import { z } from "zod";
import {
  commonSchemas,
  createPaginationSchema,
  createTimeBasedSchema,
  createMediaSchema,
} from "../../../utils/schema-helpers";

/**
 * Validation schemas for habitat service operations
 * Used to validate input parameters and ensure data integrity
 */

// Use centralized message content schema
export const messageContentSchema = commonSchemas.messageContent;

// Use centralized discussion title schema
export const discussionNameSchema = commonSchemas.discussionTitle;

// Use centralized description schema
export const discussionDescriptionSchema = commonSchemas.description;

// Use centralized poll title schema
export const pollTitleSchema = commonSchemas.pollTitle;

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

// Streaming session description validation schema
export const streamDescriptionSchema = z
  .string()
  .trim()
  .max(500, "Streaming session description is too long (max 500 characters)")
  .refine(
    (description) => description.replace(/\s+/g, " ").length >= 10,
    "Streaming session description is invalid"
  )
  .optional();

// Max participants validation schema - use centralized positive int with constraints
export const maxParticipantsSchema = commonSchemas.positiveInt
  .min(2, "Streaming session must allow at least 2 participants")
  .max(100, "Streaming session cannot have more than 100 participants")
  .optional();

// Scheduled time validation schema - use centralized future date schema
export const scheduledTimeSchema = commonSchemas.futureDate;

// Timestamp validation schema
export const timestampSchema = z.date("Invalid timestamp format");

// Use centralized pagination schema
export const paginationSchema = createPaginationSchema();

export const sendMessageSchema = z.object({
  content: messageContentSchema,
});

// Habitat creation validation schemas
// Use centralized habitat name schema
export const habitatNameSchema = commonSchemas.habitatName;

// Use centralized description schema (required for habitats)
export const habitatDescriptionSchema = commonSchemas.description.refine(
  (desc) => desc !== undefined && desc.length > 0,
  "Habitat description is required"
);

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
  description: habitatDescriptionSchema.optional(),
  isPublic: z.boolean(),
});

export type CreateHabitatFormInput = z.infer<typeof createHabitatFormSchema>;

// Discussion validation schemas
export const createDiscussionSchema = z.object({
  name: discussionNameSchema,
  description: discussionDescriptionSchema.optional(),
});

// Use centralized pagination schema for discussions
export const getDiscussionsByHabitatSchema = createPaginationSchema()
  .extend({
    offset: commonSchemas.nonNegativeInt.default(0),
  })
  .omit({ page: true }); // Use offset instead of page for this specific case

// Poll validation schemas
export const createPollSchema = z.object({
  title: pollTitleSchema,
  options: pollOptionsSchema,
});

export const votePollSchema = z.object({
  option: z.string().min(1, "Vote option is required"),
});

// Media validation schemas - use centralized media schema
const baseMediaSchema = createMediaSchema();

export const streamMediaSchema = baseMediaSchema
  .extend({
    tmdb_id: baseMediaSchema.shape.tmdbId,
    media_type: baseMediaSchema.shape.mediaType,
    media_title: baseMediaSchema.shape.media_title,
    poster_path: baseMediaSchema.shape.posterPath,
    release_date: baseMediaSchema.shape.releaseDate,
    runtime: commonSchemas.positiveInt.optional(),
  })
  .omit({
    tmdbId: true,
    mediaType: true,
    posterPath: true,
    releaseDate: true,
    backdropPath: true,
    overview: true,
  });

export const mediaTypeSchema = z.enum(["movie", "tv"]);

// Stream validation schemas
export const createStreamSchema = z.object({
  description: streamDescriptionSchema,
  scheduledTime: scheduledTimeSchema,
  maxParticipants: maxParticipantsSchema,

  media: streamMediaSchema,
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

// Streaming session form validation schema (for UI components)
export const createStreamFormSchema = z
  .object({
    description: streamDescriptionSchema.optional(),
    scheduledDate: z.string().min(1, "Scheduled date is required"),
    scheduledTime: z.string().min(1, "Scheduled time is required"),
    maxParticipants: z.string().optional(),
    media: streamMediaSchema,
  })
  .refine(
    (data) => {
      // Validate that scheduled date/time is in the future
      const scheduledDateTime = new Date(
        `${data.scheduledDate.split("T")[0]}T${data.scheduledTime}`
      );
      console.log({
        date: data.scheduledDate,
        time: data.scheduledTime,
        dateTime: scheduledDateTime,
      });
      return scheduledDateTime > new Date();
    },
    {
      message: "Scheduled time must be in the future",
      path: ["scheduledDate"],
    }
  );

export type CreateStreamInput = z.infer<typeof createStreamSchema>;
export type CreateStreamFormInput = z.infer<typeof createStreamFormSchema>;

// Additional validation type exports
export type StreamDescription = z.infer<typeof streamDescriptionSchema>;
export type MaxParticipants = z.infer<typeof maxParticipantsSchema>;
export type MediaType = z.infer<typeof mediaTypeSchema>;
