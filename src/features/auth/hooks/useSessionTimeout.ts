import { useEffect, useRef, useState, useCallback } from 'react'
import { SessionTimeoutManager } from '../utils/security'
import { useAuth } from './useAuth'

interface UseSessionTimeoutOptions {
  onWarning?: () => void
  onTimeout?: () => void
  enabled?: boolean
}

interface SessionTimeoutState {
  timeUntilExpiry: number
  isAboutToExpire: boolean
  extendSession: () => void
  isActive: boolean
}

/**
 * Hook for managing session timeout and idle detection
 */
export function useSessionTimeout(
  options: UseSessionTimeoutOptions = {}
): SessionTimeoutState {
  const { user, logout } = useAuth()
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0)
  const [isAboutToExpire, setIsAboutToExpire] = useState(false)
  const sessionManagerRef = useRef<SessionTimeoutManager | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { onWarning, onTimeout, enabled = true } = options

  // Handle session warning
  const handleWarning = useCallback(() => {
    setIsAboutToExpire(true)
    onWarning?.()
  }, [onWarning])

  // Handle session timeout
  const handleTimeout = useCallback(async () => {
    try {
      await logout()
      onTimeout?.()
    } catch (error) {
      console.error('Failed to logout on session timeout:', error)
    }
  }, [logout, onTimeout])

  // Extend session
  const extendSession = useCallback(() => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.extendSession()
      setIsAboutToExpire(false)
    }
  }, [])

  // Update timer display
  const updateTimer = useCallback(() => {
    if (sessionManagerRef.current) {
      const remaining = sessionManagerRef.current.getTimeUntilExpiry()
      setTimeUntilExpiry(remaining)
      setIsAboutToExpire(sessionManagerRef.current.isAboutToExpire())
    }
  }, [])

  // Initialize session manager
  useEffect(() => {
    if (!enabled || !user) {
      return
    }

    // Create session manager
    sessionManagerRef.current = new SessionTimeoutManager(
      handleWarning,
      handleTimeout
    )

    // Start timer update interval
    intervalRef.current = setInterval(updateTimer, 1000)

    // Initial timer update
    updateTimer()

    return () => {
      // Cleanup
      if (sessionManagerRef.current) {
        sessionManagerRef.current.destroy()
        sessionManagerRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, user, handleWarning, handleTimeout, updateTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionManagerRef.current) {
        sessionManagerRef.current.destroy()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    timeUntilExpiry,
    isAboutToExpire,
    extendSession,
    isActive: enabled && !!user,
  }
}

/**
 * Hook for session timeout warning dialog
 */
export function useSessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const sessionTimeout = useSessionTimeout({
    onWarning: () => {
      setShowWarning(true)
      setCountdown(5 * 60) // 5 minutes countdown
    },
    onTimeout: () => {
      setShowWarning(false)
      setCountdown(0)
    },
  })

  // Countdown timer for warning dialog
  useEffect(() => {
    if (!showWarning || countdown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowWarning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showWarning, countdown])

  const dismissWarning = useCallback(() => {
    setShowWarning(false)
    setCountdown(0)
    sessionTimeout.extendSession()
  }, [sessionTimeout])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  return {
    showWarning,
    countdown,
    formattedCountdown: formatTime(countdown),
    dismissWarning,
    extendSession: sessionTimeout.extendSession,
    isActive: sessionTimeout.isActive,
  }
}
