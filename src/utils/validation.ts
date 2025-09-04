/**
 * Centralized validation utilities for the Habitats feature
 * Provides consistent validation functions across the application
 */

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface UUIDValidationOptions {
  allowNil?: boolean;
  version?: number;
}

/**
 * Validates UUID format
 * @param id - The UUID string to validate
 * @param options - Validation options
 * @returns boolean indicating if UUID is valid
 */
export function isValidUUID(
  id: string,
  options: UUIDValidationOptions = {}
): boolean {
  if (!id) {
    return options.allowNil || false;
  }

  // UUID v4 regex pattern
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates email format
 * @param email - The email string to validate
 * @returns ValidationResult with isValid flag and potential errors
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, errors: ["Email is required"] };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    errors: isValid ? undefined : ["Please enter a valid email address"],
  };
}

/**
 * Validates message content for habitat discussions
 * @param content - The message content to validate
 * @returns ValidationResult with isValid flag and potential errors
 */
export function validateMessageContent(content: string): ValidationResult {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push("Message content is required");
  }

  if (content && content.length > 1000) {
    errors.push("Message content must be 1000 characters or less");
  }

  if (content && content.trim().length < 1) {
    errors.push("Message content cannot be empty");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validates habitat name
 * @param name - The habitat name to validate
 * @returns ValidationResult with isValid flag and potential errors
 */
export function validateHabitatName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push("Habitat name is required");
  }

  if (name && name.length > 100) {
    errors.push("Habitat name must be 100 characters or less");
  }

  if (name && name.trim().length < 1) {
    errors.push("Habitat name cannot be empty");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validates discussion title
 * @param title - The discussion title to validate
 * @returns ValidationResult with isValid flag and potential errors
 */
export function validateDiscussionTitle(title: string): ValidationResult {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push("Discussion title is required");
  }

  if (title && title.length > 200) {
    errors.push("Discussion title must be 200 characters or less");
  }

  if (title && title.trim().length < 3) {
    errors.push("Discussion title must be at least 3 characters");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
