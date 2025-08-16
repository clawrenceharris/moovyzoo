"use client";
import { useState, useEffect, useCallback } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import type { AuthState, SignupData, LoginData } from "..//domain/auth.types";
import { authServices, sessionUtils } from "../domain/auth.service";
import { useRouter } from "next/navigation";
import { getFriendlyErrorMessage } from "@/utils/normalize-error";
// Custom hook for authentication state management
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  // Initialize auth state and listen for changes
  useEffect(() => {
    const unsubscribe = authServices.onAuthStateChange(
      async (supabaseUser: SupabaseUser | null) => {
        try {
          if (supabaseUser) {
            // Convert Supabase user to app User interface
            const user = authServices.convertSupabaseUser(supabaseUser);

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
            error: getFriendlyErrorMessage(error),
          });
        }
      }
    );

    return unsubscribe;
  }, [router]);

  // Sign up new user
  const signup = useCallback(
    async (data: SignupData): Promise<void> => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await authServices.signup(data);
        router.replace("/");
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: getFriendlyErrorMessage(error),
        }));
        console.log("Sign up error: " + error);
        throw error;
      }
    },
    [router]
  );

  // Sign in existing user
  const login = useCallback(
    async (data: LoginData): Promise<void> => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await authServices.login(data);
        router.replace("/");
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Login failed",
        }));
        console.error(error);
        throw error;
      }
    },
    [router]
  );

  // Sign out current user
  const logout = useCallback(async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authServices.logout();
      router.replace("/login");
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: getFriendlyErrorMessage(error),
      }));
      throw error;
    }
  }, [router]);

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
