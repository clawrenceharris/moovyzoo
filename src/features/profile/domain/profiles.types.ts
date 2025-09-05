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
  username?: string;
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  quote?: string;
  favorite_genres?: string[];
  favorite_titles?: string[];
  is_public: boolean;
  badges?: BadgeDocument[];
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  last_active_at?: string;
  user_id: string;
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
  email: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  quote?: string;
  favoriteGenres: string[];
  favoriteTitles: string[];
  isPublic: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface CreateProfileData {
  userId: string;
  email: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  quote?: string;
  favoriteGenres?: string[];
  favoriteTitles?: string[];
  isPublic?: boolean;
  onboardingCompleted?: boolean;
}

export interface UpdateProfileData {
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  quote?: string;
  favoriteGenres?: string[];
  favoriteTitles?: string[];
  isPublic?: boolean;
  onboardingCompleted?: boolean;
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
