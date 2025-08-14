/**
 * Security utilities for authentication and session management
 * Implements client-side security measures and rate limiting
 */

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  LOGIN_ATTEMPTS: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  PASSWORD_RESET: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
  PROFILE_UPDATES: {
    MAX_ATTEMPTS: 10,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },
} as const

// Session timeout configuration
const SESSION_CONFIG = {
  TIMEOUT_WARNING: 5 * 60 * 1000, // 5 minutes before expiry
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
  CHECK_INTERVAL: 60 * 1000, // Check every minute
} as const

// Rate limiting storage
interface RateLimitEntry {
  count: number
  firstAttempt: number
  lastAttempt: number
  isLocked: boolean
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>()

  /**
   * Check if an action is rate limited
   */
  isRateLimited(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): { isLimited: boolean; remainingTime?: number } {
    const now = Date.now()
    const entry = this.attempts.get(key)

    if (!entry) {
      return { isLimited: false }
    }

    // Check if window has expired
    if (now - entry.firstAttempt > windowMs) {
      this.attempts.delete(key)
      return { isLimited: false }
    }

    // Check if locked and lockout period has expired
    if (entry.isLocked) {
      const lockoutExpiry = entry.lastAttempt + windowMs
      if (now < lockoutExpiry) {
        const remainingTime = Math.ceil((lockoutExpiry - now) / 60000) // minutes
        return { isLimited: true, remainingTime }
      } else {
        // Lockout expired, reset
        this.attempts.delete(key)
        return { isLimited: false }
      }
    }

    // Check if max attempts reached
    if (entry.count >= maxAttempts) {
      entry.isLocked = true
      entry.lastAttempt = now
      const remainingTime = Math.ceil(windowMs / 60000) // minutes
      return { isLimited: true, remainingTime }
    }

    return { isLimited: false }
  }

  /**
   * Record an attempt
   */
  recordAttempt(key: string): void {
    const now = Date.now()
    const entry = this.attempts.get(key)

    if (!entry) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        isLocked: false,
      })
    } else {
      entry.count += 1
      entry.lastAttempt = now
    }
  }

  /**
   * Reset attempts for a key (on successful action)
   */
  resetAttempts(key: string): void {
    this.attempts.delete(key)
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): number {
    const now = Date.now()
    const entry = this.attempts.get(key)

    if (!entry) {
      return maxAttempts
    }

    // Check if window has expired
    if (now - entry.firstAttempt > windowMs) {
      return maxAttempts
    }

    return Math.max(0, maxAttempts - entry.count)
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

/**
 * Security utilities for authentication and session management
 */
export const securityUtils = {
  /**
   * Check login rate limiting
   */
  checkLoginRateLimit(email: string): {
    allowed: boolean
    remainingAttempts?: number
    lockoutTime?: number
  } {
    const key = `login:${email.toLowerCase()}`
    const { isLimited, remainingTime } = rateLimiter.isRateLimited(
      key,
      RATE_LIMIT_CONFIG.LOGIN_ATTEMPTS.MAX_ATTEMPTS,
      RATE_LIMIT_CONFIG.LOGIN_ATTEMPTS.WINDOW_MS
    )

    if (isLimited) {
      return {
        allowed: false,
        lockoutTime: remainingTime,
      }
    }

    const remainingAttempts = rateLimiter.getRemainingAttempts(
      key,
      RATE_LIMIT_CONFIG.LOGIN_ATTEMPTS.MAX_ATTEMPTS,
      RATE_LIMIT_CONFIG.LOGIN_ATTEMPTS.WINDOW_MS
    )

    return {
      allowed: true,
      remainingAttempts,
    }
  },

  /**
   * Record failed login attempt
   */
  recordFailedLogin(email: string): void {
    const key = `login:${email.toLowerCase()}`
    rateLimiter.recordAttempt(key)
  },

  /**
   * Reset login attempts on successful login
   */
  resetLoginAttempts(email: string): void {
    const key = `login:${email.toLowerCase()}`
    rateLimiter.resetAttempts(key)
  },

  /**
   * Check password reset rate limiting
   */
  checkPasswordResetRateLimit(email: string): {
    allowed: boolean
    remainingAttempts?: number
    lockoutTime?: number
  } {
    const key = `password-reset:${email.toLowerCase()}`
    const { isLimited, remainingTime } = rateLimiter.isRateLimited(
      key,
      RATE_LIMIT_CONFIG.PASSWORD_RESET.MAX_ATTEMPTS,
      RATE_LIMIT_CONFIG.PASSWORD_RESET.WINDOW_MS
    )

    if (isLimited) {
      return {
        allowed: false,
        lockoutTime: remainingTime,
      }
    }

    const remainingAttempts = rateLimiter.getRemainingAttempts(
      key,
      RATE_LIMIT_CONFIG.PASSWORD_RESET.MAX_ATTEMPTS,
      RATE_LIMIT_CONFIG.PASSWORD_RESET.WINDOW_MS
    )

    return {
      allowed: true,
      remainingAttempts,
    }
  },

  /**
   * Record password reset attempt
   */
  recordPasswordResetAttempt(email: string): void {
    const key = `password-reset:${email.toLowerCase()}`
    rateLimiter.recordAttempt(key)
  },

  /**
   * Check profile update rate limiting
   */
  checkProfileUpdateRateLimit(uid: string): {
    allowed: boolean
    remainingAttempts?: number
    lockoutTime?: number
  } {
    const key = `profile-update:${uid}`
    const { isLimited, remainingTime } = rateLimiter.isRateLimited(
      key,
      RATE_LIMIT_CONFIG.PROFILE_UPDATES.MAX_ATTEMPTS,
      RATE_LIMIT_CONFIG.PROFILE_UPDATES.WINDOW_MS
    )

    if (isLimited) {
      return {
        allowed: false,
        lockoutTime: remainingTime,
      }
    }

    const remainingAttempts = rateLimiter.getRemainingAttempts(
      key,
      RATE_LIMIT_CONFIG.PROFILE_UPDATES.MAX_ATTEMPTS,
      RATE_LIMIT_CONFIG.PROFILE_UPDATES.WINDOW_MS
    )

    return {
      allowed: true,
      remainingAttempts,
    }
  },

  /**
   * Record profile update attempt
   */
  recordProfileUpdateAttempt(uid: string): void {
    const key = `profile-update:${uid}`
    rateLimiter.recordAttempt(key)
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long')
    } else if (password.length >= 12) {
      score += 2
    } else {
      score += 1
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include uppercase letters')

    if (/\d/.test(password)) score += 1
    else feedback.push('Include numbers')

    if (/[^a-zA-Z\d]/.test(password)) score += 1
    else feedback.push('Include special characters')

    // Common password patterns
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeating characters')
      score -= 1
    }

    if (/123|abc|qwe/i.test(password)) {
      feedback.push('Avoid common sequences')
      score -= 1
    }

    const isValid = password.length >= 8 && score >= 3
    return { isValid, score: Math.max(0, score), feedback }
  },

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  },

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  },

  /**
   * Check if running over HTTPS (in production)
   */
  isSecureConnection(): boolean {
    if (typeof window === 'undefined') return true // SSR
    return (
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost'
    )
  },

  /**
   * Generate secure headers for API requests
   */
  getSecureHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }

    // Add CSRF protection in production
    if (typeof window !== 'undefined' && this.isSecureConnection()) {
      headers['X-CSRF-Token'] = this.generateCSRFToken()
    }

    return headers
  },

  /**
   * Generate CSRF token (simple implementation)
   */
  generateCSRFToken(): string {
    return btoa(Math.random().toString()).substring(0, 32)
  },

  /**
   * Detect suspicious activity patterns
   */
  detectSuspiciousActivity(
    actions: Array<{ timestamp: number; type: string }>
  ): {
    isSuspicious: boolean
    reasons: string[]
  } {
    const reasons: string[] = []
    const now = Date.now()
    const recentActions = actions.filter(
      (action) => now - action.timestamp < 60000
    ) // Last minute

    // Too many actions in short time
    if (recentActions.length > 20) {
      reasons.push('Unusually high activity rate')
    }

    // Multiple failed login attempts
    const failedLogins = recentActions.filter(
      (action) => action.type === 'failed_login'
    )
    if (failedLogins.length > 3) {
      reasons.push('Multiple failed login attempts')
    }

    // Rapid profile updates
    const profileUpdates = recentActions.filter(
      (action) => action.type === 'profile_update'
    )
    if (profileUpdates.length > 5) {
      reasons.push('Rapid profile modifications')
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
    }
  },
}

/**
 * Session timeout manager
 */
export class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null
  private warningTimeoutId: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private onWarning?: () => void
  private onTimeout?: () => void

  constructor(onWarning?: () => void, onTimeout?: () => void) {
    this.onWarning = onWarning
    this.onTimeout = onTimeout
    this.setupActivityListeners()
    this.resetTimeout()
  }

  /**
   * Setup activity listeners
   */
  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    const handleActivity = () => {
      this.updateActivity()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.lastActivity = Date.now()
    this.resetTimeout()
  }

  /**
   * Reset timeout timers
   */
  private resetTimeout(): void {
    // Clear existing timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId)
    }

    // Set warning timeout
    this.warningTimeoutId = setTimeout(() => {
      this.onWarning?.()
    }, SESSION_CONFIG.IDLE_TIMEOUT - SESSION_CONFIG.TIMEOUT_WARNING)

    // Set session timeout
    this.timeoutId = setTimeout(() => {
      this.onTimeout?.()
    }, SESSION_CONFIG.IDLE_TIMEOUT)
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiry(): number {
    const timeSinceActivity = Date.now() - this.lastActivity
    return Math.max(0, SESSION_CONFIG.IDLE_TIMEOUT - timeSinceActivity)
  }

  /**
   * Check if session is about to expire
   */
  isAboutToExpire(): boolean {
    return this.getTimeUntilExpiry() <= SESSION_CONFIG.TIMEOUT_WARNING
  }

  /**
   * Extend session
   */
  extendSession(): void {
    this.updateActivity()
  }

  /**
   * Destroy session manager
   */
  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId)
    }
  }
}

/**
 * Password confirmation utilities for sensitive operations
 */
export const passwordConfirmationUtils = {
  /**
   * Operations that require password confirmation
   */
  SENSITIVE_OPERATIONS: [
    'change_password',
    'change_email',
    'delete_account',
    'update_privacy_settings',
    'export_data',
  ] as const,

  /**
   * Check if operation requires password confirmation
   */
  requiresConfirmation(operation: string): boolean {
    return this.SENSITIVE_OPERATIONS.includes(operation as any)
  },

  /**
   * Validate password confirmation timing
   */
  isConfirmationValid(confirmedAt: number): boolean {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes
    return now - confirmedAt < maxAge
  },

  /**
   * Generate confirmation token
   */
  generateConfirmationToken(): string {
    return btoa(Date.now().toString() + Math.random().toString()).substring(
      0,
      32
    )
  },
}

// Export rate limiter for testing
export { rateLimiter }
