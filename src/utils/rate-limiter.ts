/**
 * Simple in-memory rate limiter for API endpoints
 * Uses sliding window approach with user-based tracking
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if a request is allowed for the given identifier
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window has expired
    if (!entry || now >= entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Within window, check if under limit
    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemainingRequests(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() >= entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until reset for identifier
   */
  getTimeUntilReset(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() >= entry.resetTime) {
      return 0;
    }
    return entry.resetTime - Date.now();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiter instances for different endpoints
export const recommendationsRateLimiter = new RateLimiter(60000, 10); // 10 requests per minute
export const refreshRateLimiter = new RateLimiter(300000, 3); // 3 refreshes per 5 minutes

// Cleanup expired entries every 5 minutes
setInterval(() => {
  recommendationsRateLimiter.cleanup();
  refreshRateLimiter.cleanup();
}, 300000);