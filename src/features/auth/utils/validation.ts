import { z } from "zod";
import {
  signupSchema,
  loginSchema,
  onboardingProfileDataSchema,
  genreSelectionSchema,
  displayNameOnboardingSchema,
  avatarOnboardingSchema,
} from "../domain/auth.schema";
import { errorMap } from "@/utils/error-map";
import {
  privacySettingsSchema,
  updateProfileSchema,
} from "@/features/profile/domain/profiles.schema";
import { AppErrorCode } from "@/types/error";

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};

      error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: { general: ["Validation failed"] },
    };
  }
}
