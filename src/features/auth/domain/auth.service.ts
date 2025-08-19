import type { SignupData, LoginData } from "../domain/auth.types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Genre } from "@/types/movie";
import { validationUtils } from "../utils";
import { normalizeError } from "@/utils/normalize-error";
import { AppErrorCode } from "@/types/error";
import { supabase } from "@/utils/supabase/client";

// Authentication utilities
export const authServices = {
  // Create new user account
  async signup(data: SignupData): Promise<SupabaseUser> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      return authData.user;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async login(data: LoginData): Promise<SupabaseUser> {
    // Validate email format
    if (!validationUtils.isValidEmail(data.email)) {
      throw new Error(AppErrorCode.VALIDATION_INVALID_EMAIL);
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
        throw new Error(AppErrorCode.AUTH_USER_NOT_FOUND);
      }

      return authData.user;
    } catch (error) {
      // Record failed login attempt
      throw normalizeError(error);
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
      throw normalizeError(error);
    }
  },

  // Send password reset email with rate limiting
  async resetPassword(email: string): Promise<void> {
    // Validate email format
    if (!validationUtils.isValidEmail(email)) {
      throw new Error(AppErrorCode.VALIDATION_INVALID_EMAIL);
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw normalizeError(error);
    }
  },

  // Update user password with strength validation (requires recent authentication)
  async updateUserPassword(newPassword: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(AppErrorCode.AUTH_USER_NOT_FOUND);
    }

    if (!validationUtils.isValidPassword(newPassword)) {
      throw new Error(AppErrorCode.VALIDATION_INVALID_PASSWORD);
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw normalizeError(error);
    }
  },

  // Reauthenticate user with password (Supabase handles this automatically)
  async reauthenticate(password: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      throw new Error(AppErrorCode.AUTH_USER_NOT_FOUND);
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
      throw normalizeError(error);
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
};

// Database utilities for genres (using mock data for now)
export const genreUtils = {
  // Get all active genres (using mock data until genres table is implemented)
  async getGenres(): Promise<Genre[]> {
    // For now, return mock genres - this will be replaced with TMBD query later
    const mockGenres: Genre[] = [
      {
        id: "action",
        name: "Action",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
      {
        id: "comedy",
        name: "Comedy",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
      {
        id: "drama",
        name: "Drama",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
      {
        id: "horror",
        name: "Horror",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
      {
        id: "sci-fi",
        name: "Science Fiction",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
      {
        id: "romance",
        name: "Romance",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
      {
        id: "thriller",
        name: "Thriller",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
      {
        id: "documentary",
        name: "Documentary",
        isActive: true,
        tmdbId: 0,
        description: "",
      },
    ];

    return mockGenres;
  },

  // Get genre by ID
  async getGenre(genreId: string): Promise<Genre | null> {
    const genres = await this.getGenres();
    return genres.find((genre) => genre.id === genreId) || null;
  },
};
