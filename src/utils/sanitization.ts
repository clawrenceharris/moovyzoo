/**
 * Input sanitization utilities for the Habitats feature
 * Provides consistent sanitization functions to prevent XSS and ensure data integrity
 */

/**
 * Sanitizes user input by removing potentially harmful content
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for storage and display
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return "";

  return (
    input
      .trim()
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
  );
}

/**
 * Sanitizes message content for habitat discussions
 * @param content - The message content to sanitize
 * @returns Sanitized message content
 */
export function sanitizeMessageContent(content: string): string {
  if (!content) return "";

  return (
    content
      .trim()
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove control characters but preserve newlines
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Normalize excessive whitespace but preserve single newlines
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
  ); // Max 2 consecutive newlines
}

/**
 * Sanitizes habitat or discussion titles
 * @param title - The title to sanitize
 * @returns Sanitized title
 */
export function sanitizeTitle(title: string): string {
  if (!title) return "";

  return (
    title
      .trim()
      // Replace all control characters including newlines and null bytes with spaces for titles
      .replace(/[\x00-\x1F\x7F]/g, " ")
      // Normalize whitespace to single spaces
      .replace(/\s+/g, " ")
  );
}

/**
 * Sanitizes search queries
 * @param query - The search query to sanitize
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";

  return (
    query
      .trim()
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      // Remove potentially harmful SQL-like patterns (basic protection)
      .replace(/['"`;\\]/g, "")
  );
}

/**
 * Sanitizes URLs for safe usage
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";

  const sanitized = url.trim();

  // Only allow http and https protocols
  if (!sanitized.match(/^https?:\/\//i)) {
    return "";
  }

  // Remove control characters
  return sanitized.replace(/[\x00-\x1F\x7F]/g, "");
}
