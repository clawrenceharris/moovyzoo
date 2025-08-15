import { useState, useEffect, useCallback } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { authServices, sessionUtils, profileUtils } from "../utils";
import type { User, AuthState, SignupFormData, LoginFormData } from "../types";

// Custom hook for authentication state management
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth state and listen for changes
  useEffect(() => {
    const unsubscribe = authServices.onAuthStateChange(
      async (supabaseUser: SupabaseUser | null) => {
        try {
          if (supabaseUser) {
            // Convert Supabase user to app User interface
            const user = authServices.convertSupabaseUser(supabaseUser);

            // Update last active timestamp if profile exists
            const profileExists = await profileUtils.profileExists(
              supabaseUser.id
            );
            if (profileExists) {
              await profileUtils.updateLastActive(supabaseUser.id);
            }

            setAuthState({
              user,
              loading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          setAuthState({
            user: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Authentication error occurred",
          });
        }
      }
    );

    return unsubscribe;
  }, []);

  // Check for session timeout periodically
  useEffect(() => {
    if (!authState.user) return;

    const checkSessionTimeout = async () => {
      try {
        const isExpired = await sessionUtils.isTokenExpired();
        if (isExpired) {
          await sessionUtils.handleSessionTimeout();
        }
      } catch (error) {
        console.error("Session timeout check failed:", error);
      }
    };

    // Check session every 5 minutes
    const interval = setInterval(checkSessionTimeout, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [authState.user]);

  // Sign up new user
  const signup = useCallback(async (data: SignupFormData): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authServices.signup(data);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Signup failed",
      }));
      throw error;
    }
  }, []);

  // Sign in existing user
  const login = useCallback(async (data: LoginFormData): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authServices.login(data);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      }));
      throw error;
    }
  }, []);

  // Sign out current user
  const logout = useCallback(async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authServices.logout();
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }));
      throw error;
    }
  }, []);

  // Send password reset email
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setAuthState((prev) => ({ ...prev, error: null }));

    try {
      await authServices.resetPassword(email);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password reset failed";
      setAuthState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  // Update user password
  const updatePassword = useCallback(
    async (newPassword: string): Promise<void> => {
      setAuthState((prev) => ({ ...prev, error: null }));

      try {
        await authServices.updateUserPassword(newPassword);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Password update failed";
        setAuthState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Reauthenticate user
  const reauthenticate = useCallback(
    async (password: string): Promise<void> => {
      setAuthState((prev) => ({ ...prev, error: null }));

      try {
        await authServices.reauthenticate(password);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Reauthentication failed";
        setAuthState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Get current session token
  const getSessionToken = useCallback(async (): Promise<string | null> => {
    try {
      return await sessionUtils.getSessionToken();
    } catch (error) {
      console.error("Failed to get session token:", error);
      return null;
    }
  }, []);

  // Refresh session token
  const refreshSessionToken = useCallback(async (): Promise<string | null> => {
    try {
      return await sessionUtils.refreshSessionToken();
    } catch (error) {
      console.error("Failed to refresh session token:", error);
      return null;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Check if user is authenticated
  const isAuthenticated = authState.user !== null;

  // Check if user has verified email
  const isEmailVerified = authState.user?.emailVerified ?? false;

  // Check if session is valid (async function - should be called when needed)
  const checkSessionValid = useCallback(async (): Promise<boolean> => {
    try {
      return await sessionUtils.isSessionValid();
    } catch (error) {
      console.error("Failed to check session validity:", error);
      return false;
    }
  }, []);

  return {
    // State
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated,
    isEmailVerified,

    // Actions
    signup,
    login,
    logout,
    resetPassword,
    updatePassword,
    reauthenticate,
    getSessionToken,
    refreshSessionToken,
    checkSessionValid,
    clearError,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
