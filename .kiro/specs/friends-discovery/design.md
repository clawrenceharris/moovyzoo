# Design Document

## Overview

The Friends Discovery feature extends the existing profile system to enable social connections between users. It builds on the current profile infrastructure (`user_profiles` table, ProfilesRepository, and discovery page) while adding new database tables for friend relationships and watch history tracking.

The design follows the established patterns in the codebase:
- Server-side data fetching with API endpoints
- Repository pattern for data access
- Component composition using shared UI components
- Minimal, clear implementation without unnecessary complexity

## Architecture

### Database Schema Extensions

The feature adds two new tables to the existing schema:

1. **`friends` table** - Manages friend relationships with request/accept workflow
2. **`watch_history` table** - Tracks user viewing activity for profile display

### API Layer

New API endpoints following the existing pattern in `src/app/api/`:
- `/api/friends` - Friend request management
- `/api/profiles/discover` - Enhanced profile discovery
- `/api/profiles/[userId]` - Individual profile viewing
- `/api/watch-history` - Watch history management

### Component Architecture

Builds on existing components:
- Extends current `ProfileCard` for friend actions
- Enhances `ProfilePage` with friend status and watch history
- Updates discovery page to use new API endpoints
- Adds friend request notification component to header

## Components and Interfaces

### Database Tables

#### Friends Table
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate friend requests
  UNIQUE(requester_id, receiver_id),
  -- Prevent self-friendship
  CHECK (requester_id != receiver_id)
);
```

#### Watch History Table
```sql
CREATE TABLE watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL, -- TMDB movie/TV ID
  title TEXT NOT NULL,
  poster_url TEXT,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('watched', 'watching', 'dropped')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries for same user/movie
  UNIQUE(user_id, movie_id)
);
```

### API Endpoints

#### GET /api/profiles/discover
- Returns paginated list of public profiles
- Excludes current user
- Includes friend status for each profile
- Supports filtering by shared interests

#### POST /api/friends
- Creates new friend request
- Validates no existing relationship
- Returns updated friend status

#### PATCH /api/friends/[requestId]
- Updates friend request status (accept/decline)
- Only allows receiver to modify
- Returns updated relationship

#### GET /api/friends/requests
- Returns pending friend requests for current user
- Used for notification count and modal display

#### GET /api/profiles/[userId]
- Returns detailed profile view
- Includes friend status and recent watch history
- Respects privacy settings

#### POST /api/watch-history
- Adds or updates watch history entry
- Validates TMDB movie/TV data
- Returns updated history

### Type Definitions

```typescript
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
```

### Component Updates

#### Enhanced ProfileCard
```typescript
interface ProfileCardProps {
  profile: UserProfile;
  friendStatus: FriendStatus;
  onFriendAction: (action: 'add' | 'accept' | 'decline', profileId: string) => void;
  showFriendButton?: boolean;
}
```

#### Friend Request Notification
```typescript
interface FriendRequestNotificationProps {
  requestCount: number;
  onOpenRequests: () => void;
}
```

#### Friend Requests Modal
```typescript
interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}
```

## Data Models

### Repository Extensions

#### FriendsRepository
```typescript
export class FriendsRepository {
  async sendFriendRequest(requesterId: string, receiverId: string): Promise<Friend>;
  async getFriendStatus(userId1: string, userId2: string): Promise<FriendStatus>;
  async getPendingRequests(userId: string): Promise<FriendRequest[]>;
  async acceptFriendRequest(requestId: string): Promise<Friend>;
  async declineFriendRequest(requestId: string): Promise<void>;
  async getFriends(userId: string): Promise<UserProfile[]>;
  async removeFriend(userId: string, friendId: string): Promise<void>;
}
```

#### WatchHistoryRepository
```typescript
export class WatchHistoryRepository {
  async addWatchEntry(entry: Omit<WatchHistoryEntry, 'id'>): Promise<WatchHistoryEntry>;
  async updateWatchEntry(id: string, updates: Partial<WatchHistoryEntry>): Promise<WatchHistoryEntry>;
  async getUserWatchHistory(userId: string, limit?: number): Promise<WatchHistoryEntry[]>;
  async getRecentActivity(userId: string, limit?: number): Promise<WatchHistoryEntry[]>;
}
```

#### Enhanced ProfilesRepository
```typescript
// Add methods to existing ProfilesRepository
async getPublicProfilesWithFriendStatus(currentUserId: string, limit?: number): Promise<ProfileWithFriendStatus[]>;
async getProfileWithFriendStatus(profileId: string, currentUserId: string): Promise<ProfileWithFriendStatus>;
```

## Error Handling

Following the established error handling patterns:

### New Error Codes
```typescript
export enum AppErrorCode {
  // ... existing codes
  FRIEND_REQUEST_ALREADY_EXISTS = 'FRIEND_REQUEST_ALREADY_EXISTS',
  FRIEND_REQUEST_NOT_FOUND = 'FRIEND_REQUEST_NOT_FOUND',
  CANNOT_FRIEND_SELF = 'CANNOT_FRIEND_SELF',
  PROFILE_NOT_PUBLIC = 'PROFILE_NOT_PUBLIC',
  WATCH_HISTORY_INVALID = 'WATCH_HISTORY_INVALID',
}
```

### Error Messages
```typescript
// Add to error-map.ts
[AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS]: {
  title: "Already Connected",
  message: "You've already sent a friend request to this user."
},
[AppErrorCode.CANNOT_FRIEND_SELF]: {
  title: "Invalid Request",
  message: "You can't send a friend request to yourself."
},
```

## Testing Strategy

### Unit Tests
- Repository methods for friend operations
- API endpoint handlers
- Component friend action handlers
- Error mapping and validation

### Integration Tests
- Friend request workflow (send → accept/decline)
- Profile discovery with friend status
- Watch history tracking
- Privacy setting enforcement

### Component Tests
- ProfileCard with friend actions
- Friend request modal interactions
- Discovery page filtering and pagination
- Watch history display

## Security Considerations

### Row Level Security (RLS)
```sql
-- Friends table policies
CREATE POLICY "Users can view their own friendships" ON friends
  FOR SELECT USING (requester_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create friend requests" ON friends
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update received requests" ON friends
  FOR UPDATE USING (receiver_id = auth.uid());

-- Watch history policies
CREATE POLICY "Users can manage their own watch history" ON watch_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view friends' watch history" ON watch_history
  FOR SELECT USING (
    user_id IN (
      SELECT CASE 
        WHEN requester_id = auth.uid() THEN receiver_id
        WHEN receiver_id = auth.uid() THEN requester_id
      END
      FROM friends 
      WHERE status = 'accepted' 
      AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );
```

### Privacy Controls
- Only public profiles appear in discovery
- Watch history visibility controlled by friendship status
- Friend requests respect user privacy settings
- Profile viewing permissions based on friendship and privacy settings

## Performance Considerations

### Database Indexes
```sql
-- Friends table indexes
CREATE INDEX idx_friends_requester_id ON friends(requester_id);
CREATE INDEX idx_friends_receiver_id ON friends(receiver_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_created_at ON friends(created_at DESC);

-- Watch history indexes
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(user_id, watched_at DESC);
CREATE INDEX idx_watch_history_status ON watch_history(user_id, status);
```

### Query Optimization
- Paginated discovery results to limit data transfer
- Efficient friend status queries using JOINs
- Cached friend counts and mutual connections
- Optimized watch history queries with date ranges

## Migration Strategy

### Database Migration
1. Create new tables with proper constraints and indexes
2. Add RLS policies for security
3. Create database functions for complex queries
4. Verify schema with test data

### Code Migration
1. Add new repository classes following existing patterns
2. Create API endpoints with proper error handling
3. Update existing components with friend functionality
4. Add new components for friend management
5. Update types and interfaces

### Rollback Plan
- Database migration scripts include DROP statements
- Feature flags to disable friend functionality
- Graceful degradation if friend data unavailable
- Preserve existing profile functionality