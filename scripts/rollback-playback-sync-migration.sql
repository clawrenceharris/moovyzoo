-- Rollback: Remove playback synchronization schema for enhanced sync state
-- This rollback removes all playback synchronization tables, columns, and functions

-- ============================================================================
-- 1. Drop cleanup functions
-- ============================================================================

DROP FUNCTION IF EXISTS maintain_playback_sync_data();
DROP FUNCTION IF EXISTS cleanup_inactive_stream_sync_state();
DROP FUNCTION IF EXISTS cleanup_old_playback_events();

-- ============================================================================
-- 2. Drop playback_events table and its indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_playback_events_stream_type;
DROP INDEX IF EXISTS idx_playback_events_cleanup;
DROP INDEX IF EXISTS idx_playback_events_event_id;
DROP INDEX IF EXISTS idx_playback_events_stream_timestamp;

DROP TABLE IF EXISTS playback_events;

-- ============================================================================
-- 3. Drop indexes on streams table
-- ============================================================================

DROP INDEX IF EXISTS idx_streams_sync_enabled;
DROP INDEX IF EXISTS idx_streams_playback_sync;

-- ============================================================================
-- 4. Remove playback synchronization columns from streams table
-- ============================================================================

ALTER TABLE streams 
DROP COLUMN IF EXISTS sync_tolerance,
DROP COLUMN IF EXISTS sync_enabled,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS last_sync_at,
DROP COLUMN IF EXISTS is_playing,
DROP COLUMN IF EXISTS current_time;