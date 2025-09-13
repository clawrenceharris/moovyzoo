# Running Database Migrations

## Prerequisites

1. Access to your Supabase project dashboard
2. SQL Editor access in Supabase

## Migration Overview

The system includes several feature migrations:

### Habitats Feature (3 migrations):

1. **Base Schema** - Core habitats, members, and messages tables
2. **Dashboard Migration** - Discussion rooms, polls, and streaming sessions
3. **Media Integration** - TMDB media support for streaming sessions

### Streaming Feature (2 migrations):

1. **Stream Participants** - Participant management and host transfer
2. **Enhanced Playback Sync** - Real-time synchronization with event logging

## Step-by-Step Migration Process

### 1. Run the Base Habitats Schema Migration

1. Open your Supabase project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `scripts/habitats-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### 2. Run the Dashboard Migration

1. In the SQL Editor, create a new query
2. Copy the entire contents of `scripts/habitats-dashboard-migration.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the dashboard migration

### 3. Run the Media Integration Migration

1. In the SQL Editor, create a new query
2. Copy the entire contents of `scripts/watch-party-media-integration-migration.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the media integration migration

### 4. Verify the Complete Migration

1. In the SQL Editor, create a new query
2. Copy the contents of `scripts/verify-complete-habitats-schema.sql`
3. Paste and run the comprehensive verification script
4. Review the output to ensure all tables, indexes, and policies were created

### 5. Run the Enhanced Playback Synchronization Migration

1. In the SQL Editor, create a new query
2. Copy the entire contents of `scripts/playback-sync-migration.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the enhanced playback sync migration

### 6. Verify the Playback Sync Migration

1. In the SQL Editor, create a new query
2. Copy the contents of `scripts/verify-playback-sync-enhanced-migration.sql`
3. Paste and run the verification script
4. Review the output to ensure all columns, tables, indexes, and functions were created

### 7. Test the Enhanced Migration (Optional)

1. In the SQL Editor, create a new query
2. Copy the contents of `scripts/test-playback-sync-enhanced-migration.sql`
3. Paste and run the test script
4. Verify all tests pass successfully

### 8. Expected Results

After successful migration, you should see:

**Base Schema:**

- ✅ 3 base tables: `habitats`, `habitat_members`, `habitat_messages`
- ✅ Base indexes and RLS policies
- ✅ Triggers for automatic updates
- ✅ A `user_habitats` view

**Dashboard Schema:**

- ✅ 3 dashboard tables: `habitat_discussions`, `habitat_polls`, `habitat_watch_parties`
- ✅ Updated `habitat_messages` table with `chat_id` column
- ✅ Dashboard-specific indexes and RLS policies
- ✅ 3 dashboard views for data aggregation

**Media Integration:**

- ✅ 6 new media columns in `habitat_watch_parties` table
- ✅ Media-specific indexes and validation constraints
- ✅ Updated views with media information
- ✅ Helper functions for TMDB integration

**Enhanced Playback Synchronization:**

- ✅ 6 new sync columns in `streams` table (time, is_playing, last_sync_at, video_url, sync_enabled, sync_tolerance)
- ✅ New `playback_events` table for event logging and recovery
- ✅ 6 performance indexes for efficient sync queries
- ✅ 3 cleanup functions for automatic data maintenance
- ✅ Event deduplication and conflict resolution capabilities

### 9. Troubleshooting

If you encounter errors:

1. **Foreign key constraint errors**: Ensure the `profiles` table exists first
2. **Permission errors**: Make sure you have admin access to the Supabase project
3. **Duplicate object errors**: The scripts use `IF NOT EXISTS` clauses, so they're safe to re-run
4. **Migration order errors**: Always run base schema before dashboard migration

### 10. Rollback Options

#### Rollback Media Integration Only

Use the media integration rollback script:

```sql
-- Copy contents of scripts/rollback-media-integration-migration.sql
```

#### Rollback Dashboard Migration Only

Use the provided rollback script:

```sql
-- Copy contents of scripts/rollback-dashboard-migration.sql
```

#### Rollback Enhanced Playback Sync

Use the playback sync rollback script:

```sql
-- Copy contents of scripts/rollback-playback-sync-migration.sql
```

#### Complete Rollback (All Habitats Tables)

```sql
-- Drop all habitat tables in reverse order due to foreign key constraints
DROP TABLE IF EXISTS habitat_watch_parties CASCADE;
DROP TABLE IF EXISTS habitat_polls CASCADE;
DROP TABLE IF EXISTS habitat_discussions CASCADE;
DROP TABLE IF EXISTS habitat_messages CASCADE;
DROP TABLE IF EXISTS habitat_members CASCADE;
DROP TABLE IF EXISTS habitats CASCADE;
DROP VIEW IF EXISTS upcoming_watch_parties CASCADE;
DROP VIEW IF EXISTS popular_habitat_discussions CASCADE;
DROP VIEW IF EXISTS habitat_dashboard_data CASCADE;
DROP VIEW IF EXISTS user_habitats CASCADE;
DROP FUNCTION IF EXISTS update_watch_party_participant_count() CASCADE;
DROP FUNCTION IF EXISTS update_habitat_member_count() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
```

## Migration Files Reference

### Habitats Feature

- **`habitats-schema.sql`** - Base schema migration
- **`habitats-dashboard-migration.sql`** - Dashboard architecture migration
- **`watch-party-media-integration-migration.sql`** - Media integration migration
- **`verify-complete-habitats-schema.sql`** - Comprehensive verification
- **`verify-media-integration-migration.sql`** - Media integration verification
- **`rollback-dashboard-migration.sql`** - Dashboard rollback only
- **`rollback-media-integration-migration.sql`** - Media integration rollback
- **`dashboard-migration-README.md`** - Detailed dashboard migration docs
- **`media-integration-migration-README.md`** - Detailed media integration docs

### Streaming Feature

- **`stream-participants-migration.sql`** - Stream participant management migration
- **`playback-sync-migration.sql`** - Enhanced playback synchronization migration
- **`verify-playback-sync-enhanced-migration.sql`** - Playback sync verification
- **`test-playback-sync-enhanced-migration.sql`** - Playback sync functionality tests
- **`rollback-playback-sync-migration.sql`** - Playback sync rollback
- **`playback-sync-migration-README.md`** - Detailed playback sync migration docs

## Next Steps

After successful migration:

1. Update your TypeScript types to include new dashboard models
2. Test the schema with sample data
3. Implement repository methods for new tables
4. Create UI components for dashboard features
5. Set up real-time subscriptions for discussion rooms
6. Implement dashboard data aggregation in services
