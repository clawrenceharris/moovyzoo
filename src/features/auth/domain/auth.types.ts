// Genre interface

// Onboarding data interface
export interface OnboardingData {
  favoriteGenres: string[];
  favoriteMovies: string[];
  displayName: string;
  avatarUrl?: string;
}

// Onboarding step enum
export enum OnboardingStep {
  WELCOME = "welcome",
  DISPLAY_NAME = "display_name",
  GENRE_SELECTION = "genre_selection",
  AVATAR = "avatar",
  COMPLETE = "complete",
}

// Onboarding state interface
export interface OnboardingState {
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  isComplete: boolean;
  canSkip: boolean;
}

// Core User interface from Supabase Auth
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

// Authentication state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Signup form data
export interface SignupData {
  email: string;
  password: string;
  displayName: string;
}

// Login form data
export interface LoginData {
  email: string;
  password: string;
}
