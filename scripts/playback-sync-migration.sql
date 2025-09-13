-- Migration: Add playback synchronization schema for enhanced sync state
-- This migration adds all necessary tables, columns, and indexes for real-time playback synchronization

-- ============================================================================
-- 1. Extend streams table with playback synchronization columns
-- ============================================================================

-- Add playback synchronization columns to streams table
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_playing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sync_tolerance INTEGER DEFAULT 500; -- milliseconds

-- Add comments for documentation
COMMENT ON COLUMN streams.time IS 'Current playback position in seconds';
COMMENT ON COLUMN streams.is_playing IS 'Whether the stream is currently playing';
COMMENT ON COLUMN streams.last_sync_at IS 'Timestamp of last playback state sync';
COMMENT ON COLUMN streams.video_url IS 'URL to the actual video content for playback';
COMMENT ON COLUMN streams.sync_enabled IS 'Whether synchronization is enabled for this stream';
COMMENT ON COLUMN streams.sync_tolerance IS 'Sync tolerance in milliseconds for lag compensation';

-- ============================================================================
-- 2. Create playback_events table for event logging and recovery
-- ============================================================================

CREATE TABLE IF NOT EXISTS playback_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  host_user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('play', 'pause', 'seek', 'sync_request', 'buffer_start', 'buffer_end')),
  event_id TEXT NOT NULL UNIQUE, -- For deduplication
  timestamp_ms BIGINT NOT NULL, -- Unix timestamp in milliseconds
  time INTEGER NOT NULL, -- Video position in seconds
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add comments for playback_events table
COMMENT ON TABLE playback_events IS 'Stores playback synchronization events for logging and recovery';
COMMENT ON COLUMN playback_events.event_id IS 'Unique identifier for event deduplication';
COMMENT ON COLUMN playback_events.timestamp_ms IS 'Unix timestamp in milliseconds when event occurred';
COMMENT ON COLUMN playback_events.time IS 'Video position in seconds at time of event';
COMMENT ON COLUMN playback_events.metadata IS 'Additional event data (seek positions, buffer reasons, etc.)';

-- ============================================================================
-- 3. Add database indexes for efficient sync state queries
-- ============================================================================

-- Index for efficient playback state queries on active streams
CREATE INDEX IF NOT EXISTS idx_streams_playback_sync 
ON streams(id, last_sync_at) 
WHERE is_active = true;

-- Index for sync-enabled streams
CREATE INDEX IF NOT EXISTS idx_streams_sync_enabled
ON streams(id, sync_enabled, last_sync_at)
WHERE is_active = true AND sync_enabled = true;

-- Indexes for playback_events table performance
CREATE INDEX IF NOT EXISTS idx_playback_events_stream_timestamp 
ON playback_events(stream_id, timestamp_ms);

CREATE INDEX IF NOT EXISTS idx_playback_events_event_id 
ON playback_events(event_id);

CREATE INDEX IF NOT EXISTS idx_playback_events_cleanup 
ON playback_events(created_at);

CREATE INDEX IF NOT EXISTS idx_playback_events_stream_type
ON playback_events(stream_id, event_type, created_at);

-- ============================================================================
-- 4. Implement cleanup procedures for old sync events
-- ============================================================================

-- Function to clean up old playback events (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_playback_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete events older than 7 days
  DELETE FROM playback_events 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup operation
  INSERT INTO playback_events (
    stream_id, 
    host_user_id, 
    event_type, 
    event_id, 
    timestamp_ms, 
    time, 
    metadata
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID, -- System cleanup
    '00000000-0000-0000-0000-000000000000'::UUID, -- System user
    'sync_request', -- Use allowed event type
    'cleanup_' || extract(epoch from now())::text,
    extract(epoch from now())::bigint * 1000,
    0,
    jsonb_build_object('cleanup_operation', true, 'deleted_count', deleted_count)
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old sync state for inactive streams
CREATE OR REPLACE FUNCTION cleanup_inactive_stream_sync_state()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Reset sync state for streams inactive for more than 24 hours
  UPDATE streams 
  SET 
    time = 0,
    is_playing = false,
    last_sync_at = NOW()
  WHERE 
    is_active = false 
    AND last_sync_at < NOW() - INTERVAL '24 hours'
    AND (time != 0 OR is_playing = true);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create a maintenance function that runs both cleanup procedures
CREATE OR REPLACE FUNCTION maintain_playback_sync_data()
RETURNS TABLE(events_deleted INTEGER, streams_reset INTEGER) AS $$
DECLARE
  events_count INTEGER;
  streams_count INTEGER;
BEGIN
  -- Clean up old events
  SELECT cleanup_old_playback_events() INTO events_count;
  
  -- Clean up inactive stream sync state
  SELECT cleanup_inactive_stream_sync_state() INTO streams_count;
  
  RETURN QUERY SELECT events_count, streams_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for cleanup functions
COMMENT ON FUNCTION cleanup_old_playback_events() IS 'Removes playback events older than 7 days to prevent table bloat';
COMMENT ON FUNCTION cleanup_inactive_stream_sync_state() IS 'Resets sync state for streams inactive for more than 24 hours';
COMMENT ON FUNCTION maintain_playback_sync_data() IS 'Comprehensive maintenance function for playback sync data cleanup';