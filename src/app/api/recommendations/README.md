# Recommendations API

This API provides personalized content recommendations and friend suggestions for authenticated users.

## Endpoints

### GET /api/recommendations

Fetch personalized recommendations for the authenticated user.

**Authentication:** Required

**Rate Limiting:** 10 requests per minute per user

**Query Parameters:**
- `force_refresh` (optional): Set to `true` to bypass cache and generate fresh recommendations

**Response:**
```json
{
  "success": true,
  "data": {
    "content_recommendations": [
      {
        "tmdb_id": 123,
        "title": "Movie Title",
        "media_type": "movie",
        "match_score": 85,
        "short_explanation": "Reason for recommendation"
      }
    ],
    "friend_suggestions": [
      {
        "user_id": "user-123",
        "display_name": "John Doe",
        "taste_match_score": 90,
        "short_rationale": "Similar taste in action movies"
      }
    ],
    "cached": false,
    "generated_at": "2024-01-01T12:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Service error

### POST /api/recommendations/refresh

Refresh recommendations by invalidating cache and generating new ones.

**Authentication:** Required

**Rate Limiting:** 3 requests per 5 minutes per user

**Request Body (optional):**
```json
{
  "force_refresh": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content_recommendations": [...],
    "friend_suggestions": [...],
    "generated_at": "2024-01-01T12:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: User not authenticated
- `429 Too Many Requests`: Rate limit exceeded (more restrictive than GET)
- `500 Internal Server Error`: Service error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **GET /api/recommendations**: 10 requests per minute per user
- **POST /api/recommendations/refresh**: 3 requests per 5 minutes per user

When rate limited, the API returns a `429` status with a `retryAfter` field indicating seconds until the next allowed request.

## Caching

Recommendations are cached for 24 hours per user session. The cache key is based on the user ID and current date, ensuring fresh recommendations daily while reducing computational load.

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "retryAfter": 60  // Only for rate limit errors
}
```

## Implementation Notes

- Uses the existing `RecommendationsService` for business logic
- Implements proper authentication via Supabase
- Follows existing API patterns for error handling and response format
- Includes comprehensive test coverage
- Uses in-memory rate limiting suitable for single-instance deployments