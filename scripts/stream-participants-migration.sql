-- Stream Participants Migration
-- This migration adds the stream_participants table for managing streaming session participation
-- Run this in your Supabase SQL Editor after the media integration migration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stream_participants table
CREATE TABLE IF NOT EXISTS stream_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES habitat_watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_host BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate participation
  CONSTRAINT unique_stream_participant UNIQUE(stream_id, user_id)
);

-- Create indexes for efficient participant queries
CREATE INDEX IF NOT EXISTS idx_stream_participants_stream_id ON stream_participants(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_participants_user_id ON stream_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_participants_joined_at ON stream_participants(joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_stream_participants_is_host ON stream_participants(stream_id, is_host) WHERE is_host = true;

-- Create composite index for efficient queries
CREATE INDEX IF NOT EXISTS idx_stream_participants_stream_user ON stream_participants(stream_id, user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE stream_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stream_participants table
-- Users can view participants of streams they can access
CREATE POLICY "Users can view participants of accessible streams" ON stream_participants
  FOR SELECT USING (
    stream_id IN (
      SELECT wp.id FROM habitat_watch_parties wp
      JOIN habitat_members hm ON wp.habitat_id = hm.habitat_id
      WHERE hm.user_id = auth.uid()
    )
  );

-- Users can join streams (insert themselves as participants)
CREATE POLICY "Users can join streams" ON stream_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    stream_id IN (
      SELECT wp.id FROM habitat_watch_parties wp
      JOIN habitat_members hm ON wp.habitat_id = hm.habitat_id
      WHERE hm.user_id = auth.uid()
    )
  );

-- Users can update their own participation (reminder settings)
CREATE POLICY "Users can update their own participation" ON stream_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can leave streams (delete their own participation)
CREATE POLICY "Users can leave streams" ON stream_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Hosts can manage participants (kick users)
CREATE POLICY "Hosts can manage participants" ON stream_participants
  FOR DELETE USING (
    stream_id IN (
      SELECT stream_id FROM stream_participants 
      WHERE user_id = auth.uid() AND is_host = true
    )
  );

-- Grant necessary permissions
GRANT ALL ON stream_participants TO authenticated;

-- Create trigger function to update participant count in habitat_watch_parties
CREATE OR REPLACE FUNCTION update_stream_participant_count()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE habitat_watch_parties 
    SET participant_count = participant_count + 1 
    WHERE id = NEW.stream_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE habitat_watch_parties 
    SET participant_count = participant_count - 1 
    WHERE id = OLD.stream_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Create triggers for participant count updates
DROP TRIGGER IF EXISTS trigger_stream_participant_insert ON stream_participants;
CREATE TRIGGER trigger_stream_participant_insert
  AFTER INSERT ON stream_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_participant_count();

DROP TRIGGER IF EXISTS trigger_stream_participant_delete ON stream_participants;
CREATE TRIGGER trigger_stream_participant_delete
  AFTER DELETE ON stream_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_participant_count();

-- Create function to automatically assign host to first participant
CREATE OR REPLACE FUNCTION assign_first_participant_as_host()
RETURNS TRIGGER AS $
BEGIN
  -- Check if this is the first participant for this stream
  IF NOT EXISTS (
    SELECT 1 FROM stream_participants 
    WHERE stream_id = NEW.stream_id AND id != NEW.id
  ) THEN
    -- Make this participant the host
    NEW.is_host = true;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for automatic host assignment
DROP TRIGGER IF EXISTS trigger_assign_first_host ON stream_participants;
CREATE TRIGGER trigger_assign_first_host
  BEFORE INSERT ON stream_participants
  FOR EACH ROW
  EXECUTE FUNCTION assign_first_participant_as_host();

-- Create function to handle host reassignment when host leaves
CREATE OR REPLACE FUNCTION reassign_host_on_leave()
RETURNS TRIGGER AS $
BEGIN
  -- If the leaving participant was a host
  IF OLD.is_host = true THEN
    -- Assign host to the next oldest participant (by joined_at)
    UPDATE stream_participants 
    SET is_host = true 
    WHERE stream_id = OLD.stream_id 
      AND id != OLD.id
      AND id = (
        SELECT id FROM stream_participants 
        WHERE stream_id = OLD.stream_id 
          AND id != OLD.id
        ORDER BY joined_at ASC 
        LIMIT 1
      );
  END IF;
  
  RETURN OLD;
END;
$ LANGUAGE plpgsql;

-- Create trigger for host reassignment
DROP TRIGGER IF EXISTS trigger_reassign_host ON stream_participants;
CREATE TRIGGER trigger_reassign_host
  BEFORE DELETE ON stream_participants
  FOR EACH ROW
  EXECUTE FUNCTION reassign_host_on_leave();

-- Create view for streams with participant information
CREATE OR REPLACE VIEW streams_with_participants AS
SELECT 
  wp.*,
  COALESCE(sp.participant_count, 0) as actual_participant_count,
  CASE 
    WHEN sp.user_participant_id IS NOT NULL THEN true 
    ELSE false 
  END as is_user_participant,
  sp.user_is_host,
  sp.user_reminder_enabled
FROM habitat_watch_parties wp
LEFT JOIN (
  SELECT 
    stream_id,
    COUNT(*) as participant_count,
    MAX(CASE WHEN user_id = auth.uid() THEN id END) as user_participant_id,
    MAX(CASE WHEN user_id = auth.uid() THEN is_host END) as user_is_host,
    MAX(CASE WHEN user_id = auth.uid() THEN reminder_enabled END) as user_reminder_enabled
  FROM stream_participants
  GROUP BY stream_id
) sp ON wp.id = sp.stream_id
WHERE wp.is_active = true;

-- Grant access to the view
GRANT SELECT ON streams_with_participants TO authenticated;

-- Update the existing upcoming_watch_parties view to include participant data
DROP VIEW IF EXISTS upcoming_watch_parties;
CREATE OR REPLACE VIEW upcoming_watch_parties AS
SELECT 
  wp.id,
  wp.habitat_id,
  wp.title,
  wp.description,
  wp.scheduled_time,
  wp.participant_count,
  wp.max_participants,
  wp.created_by,
  wp.created_at,
  wp.is_active,
  wp.tmdb_id,
  wp.media_type,
  wp.media_title,
  wp.poster_path,
  wp.release_date,
  wp.runtime,
  COALESCE(sp.actual_participant_count, 0) as actual_participant_count,
  CASE 
    WHEN sp.user_participant_id IS NOT NULL THEN true 
    ELSE false 
  END as is_user_participant,
  sp.user_is_host,
  sp.user_reminder_enabled
FROM habitat_watch_parties wp
LEFT JOIN (
  SELECT 
    stream_id,
    COUNT(*) as actual_participant_count,
    MAX(CASE WHEN user_id = auth.uid() THEN id END) as user_participant_id,
    MAX(CASE WHEN user_id = auth.uid() THEN is_host END) as user_is_host,
    MAX(CASE WHEN user_id = auth.uid() THEN reminder_enabled END) as user_reminder_enabled
  FROM stream_participants
  GROUP BY stream_id
) sp ON wp.id = sp.stream_id
WHERE wp.is_active = true 
  AND wp.scheduled_time > NOW()
ORDER BY wp.scheduled_time ASC;

-- Grant access to the updated view
GRANT SELECT ON upcoming_watch_parties TO authenticated;

-- Add comments to document the new table and columns
COMMENT ON TABLE stream_participants IS 'Tracks user participation in streaming sessions (watch parties)';
COMMENT ON COLUMN stream_participants.stream_id IS 'Reference to the streaming session (habitat_watch_parties)';
COMMENT ON COLUMN stream_participants.user_id IS 'Reference to the participating user';
COMMENT ON COLUMN stream_participants.joined_at IS 'Timestamp when the user joined the streaming session';
COMMENT ON COLUMN stream_participants.is_host IS 'Whether this participant is the host with control permissions';
COMMENT ON COLUMN stream_participants.reminder_enabled IS 'Whether the user wants to receive reminders for this session';

-- Create function to get participant list with profile information
CREATE OR REPLACE FUNCTION get_stream_participants(stream_uuid UUID)
RETURNS TABLE (
  participant_id UUID,
  user_id UUID,
  joined_at TIMESTAMP WITH TIME ZONE,
  is_host BOOLEAN,
  reminder_enabled BOOLEAN,
  display_name TEXT,
  avatar_url TEXT
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    sp.id as participant_id,
    sp.user_id,
    sp.joined_at,
    sp.is_host,
    sp.reminder_enabled,
    p.display_name,
    p.avatar_url
  FROM stream_participants sp
  LEFT JOIN profiles p ON sp.user_id = p.id
  WHERE sp.stream_id = stream_uuid
  ORDER BY sp.is_host DESC, sp.joined_at ASC;
END;
$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_stream_participants(UUID) TO authenticated;