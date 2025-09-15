import { describe, it, expect, beforeEach, vi } from 'vitest';
import { recommendationsRateLimiter, refreshRateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear any existing state
    recommendationsRateLimiter.cleanup();
    refreshRateLimiter.cleanup();
  });

  describe('recommendationsRateLimiter', () => {
    it('should allow requests within limit', () => {
      const userId = 'user-123';
      
      // Should allow first request
      expect(recommendationsRateLimiter.isAllowed(userId)).toBe(true);
      
      // Should allow subsequent requests within limit
      for (let i = 0; i < 8; i++) {
        expect(recommendationsRateLimiter.isAllowed(userId)).toBe(true);
      }
      
      // Should still have 1 request remaining (started with 10, used 9)
      expect(recommendationsRateLimiter.getRemainingRequests(userId)).toBe(1);
    });

    it('should block requests when limit exceeded', () => {
      const userId = 'user-456';
      
      // Use up all 10 requests
      for (let i = 0; i < 10; i++) {
        expect(recommendationsRateLimiter.isAllowed(userId)).toBe(true);
      }
      
      // 11th request should be blocked
      expect(recommendationsRateLimiter.isAllowed(userId)).toBe(false);
      expect(recommendationsRateLimiter.getRemainingRequests(userId)).toBe(0);
    });

    it('should reset after window expires', () => {
      const userId = 'user-789';
      
      // Mock Date.now to control time
      const originalNow = Date.now;
      let currentTime = 1000000;
      vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
      
      // Use up all requests
      for (let i = 0; i < 10; i++) {
        expect(recommendationsRateLimiter.isAllowed(userId)).toBe(true);
      }
      
      // Should be blocked
      expect(recommendationsRateLimiter.isAllowed(userId)).toBe(false);
      
      // Advance time past window (60 seconds)
      currentTime += 61000;
      
      // Should be allowed again
      expect(recommendationsRateLimiter.isAllowed(userId)).toBe(true);
      expect(recommendationsRateLimiter.getRemainingRequests(userId)).toBe(9);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('refreshRateLimiter', () => {
    it('should have more restrictive limits', () => {
      const userId = 'user-refresh';
      
      // Should allow 3 requests
      for (let i = 0; i < 3; i++) {
        expect(refreshRateLimiter.isAllowed(userId)).toBe(true);
      }
      
      // 4th request should be blocked
      expect(refreshRateLimiter.isAllowed(userId)).toBe(false);
      expect(refreshRateLimiter.getRemainingRequests(userId)).toBe(0);
    });
  });

  describe('different users', () => {
    it('should track limits separately for different users', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';
      
      // Use up user1's limit
      for (let i = 0; i < 10; i++) {
        expect(recommendationsRateLimiter.isAllowed(user1)).toBe(true);
      }
      
      // user1 should be blocked
      expect(recommendationsRateLimiter.isAllowed(user1)).toBe(false);
      
      // user2 should still be allowed
      expect(recommendationsRateLimiter.isAllowed(user2)).toBe(true);
      expect(recommendationsRateLimiter.getRemainingRequests(user2)).toBe(9);
    });
  });
});