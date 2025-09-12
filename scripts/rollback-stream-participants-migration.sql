-- Rollback Stream Participants Migration
-- This script removes all changes made by the stream-participants-migration.sql
-- Run this in your Supabase SQL Editor to rollback the stream participants feature

-- Drop the function first
DROP FUNCTION IF EXISTS get_stream_participants(UUID);

-- Drop views that depend on stream_participants
DROP VIEW IF EXISTS streams_with_participants;

-- Restore the original upcoming_watch_parties view (without participant data)
DROP VIEW IF EXISTS upcoming_watch_parties;
CREATE OR REPLACE VIEW upcoming_watch_parties AS
SELECT 
  id,
  habitat_id,
  title,
  description,
  scheduled_time,
  participant_count,
  max_participants,
  created_by,
  created_at,
  is_active,
  tmdb_id,
  media_type,
  media_title,
  poster_path,
  release_date,
  runtime
FROM habitat_watch_parties
WHERE is_active = true 
  AND scheduled_time > NOW()
ORDER BY scheduled_time ASC;

-- Grant access to the restored view
GRANT SELECT ON upcoming_watch_parties TO authenticated;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_stream_participant_insert ON stream_participants;
DROP TRIGGER IF EXISTS trigger_stream_participant_delete ON stream_participants;
DROP TRIGGER IF EXISTS trigger_assign_first_host ON stream_participants;
DROP TRIGGER IF EXISTS trigger_reassign_host ON stream_participants;

-- Drop trigger functions
DROP FUNCTION IF EXISTS update_stream_participant_count();
DROP FUNCTION IF EXISTS assign_first_participant_as_host();
DROP FUNCTION IF EXISTS reassign_host_on_leave();

-- Drop the stream_participants table
DROP TABLE IF EXISTS stream_participants CASCADE;

-- Restore the original update_watch_party_participant_count function
CREATE OR REPLACE FUNCTION update_watch_party_participant_count()
RETURNS TRIGGER AS $
BEGIN
  -- This function will be used later when we implement streaming session participation
  -- For now, it's a placeholder that can be extended
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;