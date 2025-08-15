// Core profile types for the profiles domain

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  favoriteGenres: string[];
  privacySettings: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private";
  showFavoriteGenres: boolean;
  allowDirectMessages: boolean;
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
  favoriteGenres?: string[];
  privacySettings?: Partial<PrivacySettings>;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  favoriteGenres?: string[]; // Only if showFavoriteGenres is true
  lastActiveAt: Date;
}

// Repository operation results
export interface ProfileOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Service layer results
export interface ProfileServiceResult<T> {
  success: boolean;
  data?: T;
  errorCode?: string;
}
