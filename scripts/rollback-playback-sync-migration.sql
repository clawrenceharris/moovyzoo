-- Rollback: Remove playback synchronization columns from streams table
-- This rollback removes the playback synchronization columns added in the migration

-- Drop the index first
DROP INDEX IF EXISTS idx_streams_playback_sync;

-- Remove playback synchronization columns from streams table
ALTER TABLE streams 
DROP COLUMN IF EXISTS current_time,
DROP COLUMN IF EXISTS is_playing,
DROP COLUMN IF EXISTS last_sync_at,
DROP COLUMN IF EXISTS video_url;