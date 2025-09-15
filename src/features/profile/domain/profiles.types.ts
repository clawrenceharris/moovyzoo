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
  user_id: string;
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
  userId: string; // Add userId field for friend requests
  displayName: string;
  avatarUrl?: string;
  favoriteGenres?: string[]; // Only if showFavoriteGenres is true
  createdAt: Date;
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
  created_at: string;
}

// Friend relationship types
export interface Friend {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  requester: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: Date;
}

export interface FriendStatus {
  status: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
  friendshipId?: string;
}

// Watch history types
export interface WatchHistoryEntry {
  id: string;
  userId: string;
  movieId: string;
  title: string;
  posterUrl?: string;
  mediaType: 'movie' | 'tv';
  status: 'watched' | 'watching' | 'dropped';
  rating?: number;
  watchedAt: Date;
}

// Enhanced profile types
export interface ProfileWithFriendStatus extends UserProfile {
  friendStatus: FriendStatus;
  recentWatchHistory?: WatchHistoryEntry[];
  mutualFriendsCount?: number;
}

// Service layer results
export interface ProfileServiceResult<T> {
  success: boolean;
  data?: T;
  errorCode?: string;
}