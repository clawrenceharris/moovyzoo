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

// Banner URL validation schema
export const bannerUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""));

// Form schema without tags validation (handled separately in component)
export const createHabitatFormSchema = z.object({
  name: habitatNameSchema,
  description: habitatDescriptionSchema.optional(),
  bannerUrl: bannerUrlSchema,
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

// Type exports for use in service layer
export type MessageContent = z.infer<typeof messageContentSchema>;
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

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type VotePollInput = z.infer<typeof votePollSchema>;
