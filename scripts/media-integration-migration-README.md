# Streaming Session Media Integration Migration

This migration adds TMDB (The Movie Database) media integration support to the existing `habitat_watch_parties` table, enabling streaming sessions to be associated with specific movies and TV shows.

## Overview

The migration adds the following capabilities:

- Associate streaming sessions with TMDB movies and TV shows
- Store media metadata (title, poster, release date, runtime)
- Validate media data consistency
- Provide helper functions for TMDB image URLs
- Update existing views to include media information

## Files

- `watch-party-media-integration-migration.sql` - Main migration script
- `verify-media-integration-migration.sql` - Verification and testing script
- `rollback-media-integration-migration.sql` - Rollback script
- `media-integration-migration-README.md` - This documentation

## Database Changes

### New Columns Added to `habitat_watch_parties`

| Column         | Type         | Nullable | Description                   |
| -------------- | ------------ | -------- | ----------------------------- |
| `tmdb_id`      | INTEGER      | YES      | TMDB movie/TV show ID         |
| `media_type`   | VARCHAR(10)  | YES      | 'movie' or 'tv'               |
| `media_title`  | VARCHAR(255) | YES      | Movie/TV show title from TMDB |
| `poster_path`  | VARCHAR(255) | YES      | TMDB poster image path        |
| `release_date` | DATE         | YES      | Release/first air date        |
| `runtime`      | INTEGER      | YES      | Runtime in minutes            |

### Constraints

- `media_type` must be either 'movie' or 'tv'
- If `tmdb_id` is provided, `media_type` and `media_title` are required
- If any media field is provided, `tmdb_id` is required

### New Indexes

- `idx_habitat_streams_tmdb_id` - For TMDB ID lookups
- `idx_habitat_streams_media_type` - For filtering by media type
- `idx_habitat_streams_media_title` - For title searches
- `idx_habitat_streams_release_date` - For date-based queries
- `idx_habitat_streams_media_composite` - Composite index for media queries

### New Functions

- `validate_watch_party_media()` - Trigger function for data validation
- `get_tmdb_poster_url(poster_path, size)` - Constructs TMDB image URLs

### Updated Views

- `upcoming_watch_parties` - Now includes media columns
- `habitat_dashboard_data` - Includes media streaming session count
- `streams_with_media` - New view with media information and poster URLs

## Migration Process

### Prerequisites

1. Ensure the base habitats schema is installed (`habitats-schema.sql`)
2. Ensure the dashboard migration is installed (`habitats-dashboard-migration.sql`)
3. Have appropriate database permissions

### Installation Steps

1. **Run the migration:**

   ```sql
   -- In Supabase SQL Editor or psql
   \i scripts/watch-party-media-integration-migration.sql
   ```

2. **Verify the migration:**

   ```sql
   \i scripts/verify-media-integration-migration.sql
   ```

3. **Check the output** for any errors or warnings

### Verification

The verification script will:

- Check that all new columns exist with correct types
- Verify constraints and indexes are in place
- Test the validation trigger with valid and invalid data
- Confirm views and functions are working correctly

### Rollback (if needed)

If you need to undo the migration:

```sql
\i scripts/rollback-media-integration-migration.sql
```

**⚠️ Warning:** Rollback will permanently delete any media data that was stored. Backup your data first if needed.

## Usage Examples

### Creating a Streaming Session with Media

```sql
INSERT INTO habitat_watch_parties (
  habitat_id,
  title,
  description,
  scheduled_time,
  created_by,
  tmdb_id,
  media_type,
  media_title,
  poster_path,
  release_date,
  runtime
) VALUES (
  'habitat-uuid-here',
  'Fight Club Movie Night',
  'Classic movie discussion after viewing',
  '2024-02-15 20:00:00+00',
  'user-uuid-here',
  550,
  'movie',
  'Fight Club',
  '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  '1999-10-15',
  139
);
```

### Querying Streaming Sessions with Media

```sql
-- Get all streaming sessions with media information
SELECT * FROM streams_with_media
WHERE habitat_id = 'habitat-uuid-here';

-- Get poster URL for a streaming session
SELECT
  title,
  get_tmdb_poster_url(poster_path) as poster_url,
  get_tmdb_poster_url(poster_path, 'w300') as small_poster_url
FROM habitat_watch_parties
WHERE tmdb_id IS NOT NULL;
```

### Dashboard Queries

```sql
-- Get habitat dashboard data including media stats
SELECT * FROM habitat_dashboard_data
WHERE habitat_id = 'habitat-uuid-here';

-- Get upcoming streaming sessions with media
SELECT * FROM upcoming_watch_parties
WHERE habitat_id = 'habitat-uuid-here';
```

## Data Validation

The migration includes automatic validation:

- **Valid:** Streaming session with complete media information
- **Valid:** Streaming session without any media information
- **Invalid:** Streaming session with `tmdb_id` but missing `media_type` or `media_title`
- **Invalid:** Streaming session with media fields but missing `tmdb_id`
- **Invalid:** Streaming session with `media_type` other than 'movie' or 'tv'

## Backward Compatibility

- Existing streaming sessions continue to work unchanged
- All media columns are nullable
- Existing queries continue to work
- Views include both media and non-media streaming sessions

## Performance Considerations

- New indexes optimize media-related queries
- Composite index supports efficient TMDB lookups
- Views use efficient joins and aggregations
- Validation triggers have minimal performance impact

## Security

- All new columns respect existing RLS policies
- Media data is validated before insertion
- No sensitive information is stored in media fields
- TMDB poster paths are relative (not full URLs)

## Troubleshooting

### Common Issues

1. **Migration fails with constraint error:**

   - Check that the dashboard migration was run first
   - Verify habitat_watch_parties table exists

2. **Validation trigger prevents insertion:**

   - Ensure media data is complete (tmdb_id, media_type, media_title)
   - Check that media_type is 'movie' or 'tv'

3. **Views not updating:**
   - Check that views were recreated successfully
   - Verify permissions are granted

### Checking Migration Status

```sql
-- Check if columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'habitat_watch_parties'
  AND column_name LIKE '%media%' OR column_name IN ('tmdb_id', 'poster_path', 'release_date', 'runtime');

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trigger_validate_watch_party_media';
```

## Next Steps

After successful migration:

1. Update application code to handle media fields
2. Implement TMDB API integration
3. Create UI components for media search and display
4. Test with real TMDB data
5. Monitor performance and optimize as needed
