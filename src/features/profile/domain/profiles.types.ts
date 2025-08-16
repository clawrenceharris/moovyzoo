// Core profile types for the profiles domain

// Badge interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  earnedAt: Date;
}

export interface BadgeDocument {
  id: string;
  name: string;
  icon_url: string;
  description: string;

  earned_at: string;
}
export interface UserProfileDocument {
  id: string;
  display_name?: string;
  avatar_url?: string;
  favorite_genres?: string[];
  privacy_settings: PrivacySettingsDocument;
  badges: BadgeDocument[];
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  last_active_at: string;
}

export interface ProfileUpdateData {
  displayName?: string;
  avatarUrl?: string;
  favoriteGenres?: string[];
  isPublic?: boolean;
}

export interface PrivacySettings {
  isPublic: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  favoriteGenres: string[];
  privacySettings: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface CreateProfileData {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  favoriteGenres: string[];
  privacySettings?: Partial<PrivacySettings>;
}

export interface UpdateProfileData {
  displayName?: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  favoriteGenres?: string[];
}

export interface PublicProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  favoriteGenres?: string[]; // Only if showFavoriteGenres is true
  lastActiveAt: Date;
}

export interface PrivacySettingsDocument {
  is_public: boolean;
  show_favorite_genres?: boolean;
  allow_direct_messages?: boolean;
}

export interface PublicProfileDocument {
  privacy_settings: PrivacySettingsDocument;
  id: string;
  display_name: string;
  avatar_url?: string;
  favorite_genres?: string[]; // Only if showFavoriteGenres is true
  last_active_at: Date;
}

// Service layer results
export interface ProfileServiceResult<T> {
  success: boolean;
  data?: T;
  errorCode?: string;
}
