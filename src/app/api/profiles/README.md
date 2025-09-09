# Profiles API Endpoints

This directory contains the enhanced profiles API endpoints that provide friend status and watch history data for the Friends Discovery feature.

## Endpoints

### GET /api/profiles/discover

Returns a paginated list of public profiles with friend status information, excluding the current user.

**Query Parameters:**
- `limit` (optional): Number of profiles to return (default: 20, max: 50)
- `offset` (optional): Number of profiles to skip for pagination (default: 0)

**Response:**
```json
{
  "profiles": [
    {
      "id": "profile-id",
      "userId": "user-id",
      "displayName": "User Name",
      "avatarUrl": "https://example.com/avatar.jpg",
      "favoriteGenres": ["Action", "Comedy"],
      "favoriteTitles": ["Movie 1", "Movie 2"],
      "friendStatus": {
        "status": "none" | "pending_sent" | "pending_received" | "friends" | "blocked",
        "friendshipId": "friendship-id" // only if status is not "none"
      },
      // ... other profile fields
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Authentication:** Required

### GET /api/profiles/[userId]

Returns detailed profile information with friend status and recent watch history (if accessible).

**Path Parameters:**
- `userId`: The ID of the user whose profile to retrieve

**Response:**
```json
{
  "profile": {
    "id": "profile-id",
    "userId": "user-id",
    "displayName": "User Name",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "User bio",
    "favoriteGenres": ["Action", "Comedy"],
    "favoriteTitles": ["Movie 1", "Movie 2"],
    "friendStatus": {
      "status": "friends",
      "friendshipId": "friendship-id"
    },
    "recentWatchHistory": [
      {
        "id": "watch-id",
        "movieId": "12345",
        "title": "Movie Title",
        "posterUrl": "https://example.com/poster.jpg",
        "mediaType": "movie",
        "status": "watched",
        "rating": 8,
        "watchedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "mutualFriendsCount": 5,
    // ... other profile fields
  }
}
```

**Authentication:** Required

**Privacy Rules:**
- Recent watch history is only included if:
  - The profile is public, OR
  - The current user is friends with the profile owner
- Mutual friends count is only calculated for friends

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE" // Optional, for known error types
}
```

**Common Error Codes:**
- `401 Unauthorized`: User is not authenticated
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Profile not found
- `500 Internal Server Error`: Server error

## Usage Examples

### Fetch profiles for discovery page
```typescript
const response = await fetch('/api/profiles/discover?limit=10&offset=0');
const data = await response.json();
```

### Fetch individual profile
```typescript
const response = await fetch('/api/profiles/user-123');
const data = await response.json();
```

## Dependencies

These endpoints depend on:
- `ProfilesServerRepository` for profile data operations
- `FriendsServerRepository` for friend status information
- `WatchHistoryServerRepository` for watch history data
- Supabase server client for authentication and database access