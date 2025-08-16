/**
 * Shared validation utilities for profiles
 */

/**
 * Validate display name format
 */
export function isValidDisplayName(displayName: string): boolean {
  if (!displayName || typeof displayName !== "string") {
    return false;
  }

  const trimmed = displayName.trim();

  // Check length
  if (trimmed.length < 2 || trimmed.length > 50) {
    return false;
  }

  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  return validPattern.test(trimmed);
}

/**
 * Validate avatar URL format
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmed = url.trim();

  // Allow empty string (removes avatar)
  if (trimmed === "") {
    return true;
  }

  try {
    const urlObj = new URL(trimmed);
    // Only allow http/https protocols
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate favorite genres array
 */
export function isValidFavoriteGenres(genres: string[]): boolean {
  if (!Array.isArray(genres)) {
    return false;
  }

  // Check array length
  if (genres.length < 1 || genres.length > 10) {
    return false;
  }

  // Check each genre is a non-empty string
  return genres.every(
    (genre) => typeof genre === "string" && genre.trim().length > 0
  );
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Normalize genre names
 */
export function normalizeGenres(genres: string[]): string[] {
  if (!Array.isArray(genres)) {
    return [];
  }

  return [
    ...new Set(
      genres
        .filter((genre) => genre && typeof genre === "string")
        .map((genre) => genre.trim())
        .filter((genre) => genre.length > 0)
    ),
  ];
}
