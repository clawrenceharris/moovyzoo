"use client";
import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import type { AuthState, SignupData, LoginData } from "../domain/auth.types";
import { authServices } from "../domain/auth.service";
import { useRouter } from "next/navigation";
import { getFriendlyErrorMessage } from "@/utils/normalize-error";

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
      async (user: User | null) => {
        try {
          if (user) {
            // Convert Supabase user to app User interface

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
  const signup = useCallback(async (data: SignupData): Promise<User> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      return await authServices.signup(data);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: getFriendlyErrorMessage(error),
      }));
      throw error;
    }
  }, []);

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
          error: getFriendlyErrorMessage(error),
        }));
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
      router.replace("/auth/login");
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
      setAuthState((prev) => ({
        ...prev,
        error: getFriendlyErrorMessage(error),
      }));
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
        setAuthState((prev) => ({
          ...prev,
          error: getFriendlyErrorMessage(error),
        }));
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
        setAuthState((prev) => ({
          ...prev,
          error: getFriendlyErrorMessage(error),
        }));
      }
    },
    []
  );

  // Clear error state
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Check if user is authenticated
  const isAuthenticated = authState.user !== null;

  // Check if user has verified email

  return {
    // State
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated,

    // Actions
    signup,
    login,
    logout,
    resetPassword,
    updatePassword,
    reauthenticate,
    clearError,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
