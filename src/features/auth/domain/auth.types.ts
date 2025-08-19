import { User } from "@supabase/supabase-js";
import { signupSchema } from "./auth.schema";
import z from "zod";

// Type inference
export type SignupData = z.infer<typeof signupSchema>;

// Onboarding data interface
export interface OnboardingData {
  displayName: string;
  favoriteGenres: string[];
  bio?: string;
  email: string;
  quote?: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Login form data
export interface LoginData {
  email: string;
  password: string;
}
