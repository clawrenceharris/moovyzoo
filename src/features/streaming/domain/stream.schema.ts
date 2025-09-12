import { commonSchemas, createMediaSchema } from "@/utils/schema-helpers";
import z from "zod";

// Media validation schemas - use centralized media schema
const baseMediaSchema = createMediaSchema();

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
export type ScheduledTime = z.infer<typeof scheduledTimeSchema>;

export type CreateStreamInput = z.infer<typeof createStreamSchema>;
export type CreateStreamFormInput = z.infer<typeof createStreamFormSchema>;

// Additional validation type exports
export type StreamDescription = z.infer<typeof streamDescriptionSchema>;
export type MaxParticipants = z.infer<typeof maxParticipantsSchema>;
export type MediaType = z.infer<typeof mediaTypeSchema>;
