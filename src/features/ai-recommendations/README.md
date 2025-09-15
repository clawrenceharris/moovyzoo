# AI Recommendations Feature

This feature implements an AI-powered recommendation system that suggests both content (movies and TV shows) and potential friends to users based on their preferences, viewing history, and social connections.

## Database Setup

### Migration

To set up the database schema for AI recommendations, run the migration script:

```sql
-- Run this in your Supabase SQL editor or database client
\i scripts/ai-recommendations-migration.sql
```

This creates:
- `recommendation_sessions` table for caching recommendations
- Performance indices for efficient queries
- Cleanup function for expired cache entries

### Schema Overview

The `recommendation_sessions` table stores cached recommendations with the following structure:

- `id`: UUID primary key
- `user_id`: References auth.users(id), cascade delete
- `session_id`: Unique session identifier for cache invalidation
- `content_recommendations`: JSONB array of ContentRecommendation objects
- `friend_suggestions`: JSONB array of FriendSuggestion objects
- `generated_at`: Timestamp when recommendations were generated
- `expires_at`: Timestamp when cache expires (24 hours from generation)

### Performance Indices

- `idx_recommendation_sessions_user`: Composite index on (user_id, expires_at)
- `idx_recommendation_sessions_expires`: Partial index on expires_at for active sessions

### Cache Cleanup

The `cleanup_expired_recommendations()` function can be called periodically to remove expired cache entries:

```sql
SELECT cleanup_expired_recommendations();
```

## Types and Schemas

### Core Types

- `ContentRecommendation`: Movie/TV show recommendations with explainable scoring
- `FriendSuggestion`: User recommendations based on taste similarity
- `RecommendationSession`: Cache structure for storing recommendations
- `TasteProfile`: User preference profile for generating recommendations

### Validation

All types include Zod schemas for runtime validation:

```typescript
import { contentRecommendationSchema } from '@/features/ai-recommendations';

const recommendation = contentRecommendationSchema.parse(data);
```

## Requirements Covered

This implementation covers the following requirements:

- **1.1, 1.2**: Content recommendation data structures
- **2.1**: Friend suggestion data structures  
- **3.1**: Session-based caching system
- **5.1, 5.2**: Database schema extensions with performance optimization

## Next Steps

1. Implement Content Recommendation Agent service (Task 2)
2. Implement Friend Suggestion Agent service (Task 3)
3. Create recommendation cache repository and service (Task 4)
4. Build recommendations API endpoints (Task 5)
5. Create recommendation card components (Task 6)
6. Integrate recommendations into home page (Task 7)
7. Add comprehensive error handling and fallbacks (Task 8)