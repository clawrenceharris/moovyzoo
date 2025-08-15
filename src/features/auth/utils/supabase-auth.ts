// Supabase auth utilities - migrated from Firebase
import { supabase } from "../../../lib/supabase-client";
import { securityUtils } from "./security";
import type { User, SignupFormData, LoginFormData } from "../types";
import type { User as SupabaseUser, AuthError } from "@supabase/supabase-js";

// Authentication utilities
export const authServices = {
  // Create new user account
  async signup(data: SignupFormData): Promise<SupabaseUser> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      return authData.user;
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Sign in existing user with enhanced rate limiting
  async login(data: LoginFormData): Promise<SupabaseUser> {
    // Validate email format
    if (!securityUtils.isValidEmail(data.email)) {
      throw new Error("Please enter a valid email address");
    }

    // Check rate limiting
    const rateLimitCheck = securityUtils.checkLoginRateLimit(data.email);
    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Too many failed login attempts. Please try again in ${rateLimitCheck.lockoutTime} minutes.`
      );
    }

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (!authData.user) {
        throw new Error("Failed to sign in");
      }

      // Reset login attempts on successful login
      securityUtils.resetLoginAttempts(data.email);

      return authData.user;
    } catch (error) {
      // Record failed login attempt
      securityUtils.recordFailedLogin(data.email);
      throw this.normalizeAuthError(error);
    }
  },

  // Sign out current user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Send password reset email with rate limiting
  async resetPassword(email: string): Promise<void> {
    // Validate email format
    if (!securityUtils.isValidEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Check rate limiting
    const rateLimitCheck = securityUtils.checkPasswordResetRateLimit(email);
    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Too many password reset attempts. Please try again in ${rateLimitCheck.lockoutTime} minutes.`
      );
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Record password reset attempt
      securityUtils.recordPasswordResetAttempt(email);
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Update user password with strength validation (requires recent authentication)
  async updateUserPassword(newPassword: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No authenticated user");
    }

    // Validate password strength
    const passwordValidation =
      securityUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password requirements not met: ${passwordValidation.feedback.join(
          ", "
        )}`
      );
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Reauthenticate user with password (Supabase handles this automatically)
  async reauthenticate(password: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      throw new Error("No authenticated user");
    }

    try {
      // In Supabase, we re-authenticate by signing in again
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<SupabaseUser | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user || null;
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  },

  // Convert Supabase user to app User interface
  convertSupabaseUser(supabaseUser: SupabaseUser): User {
    return {
      uid: supabaseUser.id,
      email: supabaseUser.email!,
      emailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: new Date(supabaseUser.created_at),
      lastLoginAt: supabaseUser.last_sign_in_at
        ? new Date(supabaseUser.last_sign_in_at)
        : new Date(supabaseUser.created_at),
    };
  },

  // Normalize Supabase Auth errors to consistent format
  normalizeAuthError(error: unknown): Error {
    if (this.isAuthError(error)) {
      return new Error(this.getAuthErrorMessage(error));
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error("An unexpected error occurred. Please try again.");
  },

  // Check if error is a Supabase Auth error
  isAuthError(error: unknown): error is AuthError {
    return (
      error !== null &&
      error !== undefined &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as AuthError).message === "string"
    );
  },

  // Get user-friendly error message from Supabase Auth error
  getAuthErrorMessage(error: AuthError): string {
    const message = error.message.toLowerCase();

    if (
      message.includes("email already registered") ||
      message.includes("user already registered")
    ) {
      return "An account with this email already exists";
    }
    if (message.includes("invalid email")) {
      return "Please enter a valid email address";
    }
    if (message.includes("signup is disabled")) {
      return "Account registration is currently disabled";
    }
    if (message.includes("password") && message.includes("weak")) {
      return "Password should be at least 6 characters";
    }
    if (message.includes("email not confirmed")) {
      return "Please check your email and confirm your account";
    }
    if (
      message.includes("invalid login credentials") ||
      message.includes("invalid credentials")
    ) {
      return "Invalid email or password";
    }
    if (message.includes("too many requests")) {
      return "Too many failed login attempts. Please try again later";
    }
    if (message.includes("network")) {
      return "Network error. Please check your connection";
    }
    if (
      message.includes("session not found") ||
      message.includes("jwt expired")
    ) {
      return "Please log in again to complete this action";
    }

    return "An unexpected error occurred. Please try again";
  },
};

// Re-export enhanced profile operations
export { profileOperations as profileUtils } from "./profile-operations";

// Genre interface for mock data
interface Genre {
  id: string;
  name: string;
  isActive: boolean;
}

// Database utilities for genres (using mock data for now)
export const genreUtils = {
  // Get all active genres (using mock data until genres table is implemented)
  async getGenres(): Promise<Genre[]> {
    // For now, return mock genres - this will be replaced with Supabase query later
    const mockGenres: Genre[] = [
      { id: "action", name: "Action", isActive: true },
      { id: "comedy", name: "Comedy", isActive: true },
      { id: "drama", name: "Drama", isActive: true },
      { id: "horror", name: "Horror", isActive: true },
      { id: "sci-fi", name: "Science Fiction", isActive: true },
      { id: "romance", name: "Romance", isActive: true },
      { id: "thriller", name: "Thriller", isActive: true },
      { id: "documentary", name: "Documentary", isActive: true },
    ];

    return mockGenres;
  },

  // Get genre by ID
  async getGenre(genreId: string): Promise<Genre | null> {
    const genres = await this.getGenres();
    return genres.find((genre) => genre.id === genreId) || null;
  },
};

// Error handling utilities (for backward compatibility with existing tests)
export const errorUtils = {
  // Check if error is a Supabase Auth error
  isAuthError(error: unknown): error is AuthError {
    return authServices.isAuthError(error);
  },

  // Get user-friendly error message from Supabase Auth error
  getAuthErrorMessage(error: AuthError): string {
    return authServices.getAuthErrorMessage(error);
  },
};

// Session management utilities
export const sessionUtils = {
  // Check if user session is valid
  async isSessionValid(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session !== null && session.user.email_confirmed_at !== null;
  },

  // Get session token for API calls
  async getSessionToken(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  },

  // Refresh session token
  async refreshSessionToken(): Promise<string | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Failed to refresh session token:", error);
        return null;
      }

      return session?.access_token || null;
    } catch (error) {
      console.error("Failed to refresh session token:", error);
      return null;
    }
  },

  // Check if session token is expired
  async isTokenExpired(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return true;

    const expirationTime = new Date(session.expires_at! * 1000);
    const now = new Date();

    // Consider token expired if it expires within the next 5 minutes
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return expirationTime.getTime() - now.getTime() < bufferTime;
  },

  // Handle session timeout
  async handleSessionTimeout(): Promise<void> {
    try {
      await authServices.logout();
      // Redirect to login page would be handled by the useAuth hook
    } catch (error) {
      console.error("Failed to handle session timeout:", error);
    }
  },
};
