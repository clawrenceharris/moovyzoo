-- Migration: Add playback synchronization columns to streams table
-- This migration adds columns needed for real-time playback synchronization

-- Add playback synchronization columns to streams table
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS current_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_playing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create index for efficient playback state queries
CREATE INDEX IF NOT EXISTS idx_streams_playback_sync 
ON streams(id, last_sync_at) 
WHERE is_active = true;

-- Add comment for documentation
COMMENT ON COLUMN streams.current_time IS 'Current playback position in seconds';
COMMENT ON COLUMN streams.is_playing IS 'Whether the stream is currently playing';
COMMENT ON COLUMN streams.last_sync_at IS 'Timestamp of last playback state sync';
COMMENT ON COLUMN streams.video_url IS 'URL to the actual video content for playback';