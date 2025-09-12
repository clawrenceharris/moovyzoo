-- Rollback script for Streaming Session Media Integration Migration
-- Run this to undo the media integration changes if needed

-- Drop the validation trigger
DROP TRIGGER IF EXISTS trigger_validate_watch_party_media ON habitat_watch_parties;

-- Drop the validation function
DROP FUNCTION IF EXISTS validate_watch_party_media();

-- Drop the TMDB URL function
DROP FUNCTION IF EXISTS get_tmdb_poster_url(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_tmdb_poster_url(TEXT);

-- Drop the new view
DROP VIEW IF EXISTS streams_with_media;

-- Restore the original upcoming_watch_parties view (without media columns)
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
  is_active
FROM habitat_watch_parties
WHERE is_active = true 
  AND scheduled_time > NOW()
ORDER BY scheduled_time ASC;

-- Grant access to the restored view
GRANT SELECT ON upcoming_watch_parties TO authenticated;

-- Restore the original habitat_dashboard_data view (without media columns)
DROP VIEW IF EXISTS habitat_dashboard_data;
CREATE OR REPLACE VIEW habitat_dashboard_data AS
SELECT 
  h.id as habitat_id,
  h.name,
  h.description,
  h.tags,
  h.member_count,
  h.created_at,
  h.created_by,
  
  -- Count active discussions
  COALESCE(d.discussion_count, 0) as active_discussions,
  
  -- Count active polls
  COALESCE(p.poll_count, 0) as active_polls,
  
  -- Count upcoming streaming sessions
  COALESCE(wp.watch_party_count, 0) as upcoming_watch_parties
  
FROM habitats h
LEFT JOIN (
  SELECT habitat_id, COUNT(*) as discussion_count
  FROM habitat_discussions 
  WHERE is_active = true
  GROUP BY habitat_id
) d ON h.id = d.habitat_id
LEFT JOIN (
  SELECT habitat_id, COUNT(*) as poll_count
  FROM habitat_polls 
  WHERE is_active = true
  GROUP BY habitat_id
) p ON h.id = p.habitat_id
LEFT JOIN (
  SELECT habitat_id, COUNT(*) as watch_party_count
  FROM habitat_watch_parties 
  WHERE is_active = true AND scheduled_time > NOW()
  GROUP BY habitat_id
) wp ON h.id = wp.habitat_id;

-- Grant access to the restored dashboard view
GRANT SELECT ON habitat_dashboard_data TO authenticated;

-- Drop the media-related indexes
DROP INDEX IF EXISTS idx_habitat_streams_tmdb_id;
DROP INDEX IF EXISTS idx_habitat_streams_media_type;
DROP INDEX IF EXISTS idx_habitat_streams_media_title;
DROP INDEX IF EXISTS idx_habitat_streams_release_date;
DROP INDEX IF EXISTS idx_habitat_streams_media_composite;

-- Remove the media-related columns from habitat_watch_parties table
-- Note: This will permanently delete any media data that was stored
-- Make sure to backup the data if you need to preserve it

ALTER TABLE habitat_watch_parties 
DROP COLUMN IF EXISTS tmdb_id,
DROP COLUMN IF EXISTS media_type,
DROP COLUMN IF EXISTS media_title,
DROP COLUMN IF EXISTS poster_path,
DROP COLUMN IF EXISTS release_date,
DROP COLUMN IF EXISTS runtime;

-- Verification: Check that columns were removed
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'habitat_watch_parties' 
  AND column_name IN ('tmdb_id', 'media_type', 'media_title', 'poster_path', 'release_date', 'runtime');

-- This should return no rows if the rollback was successful

SELECT 'Media integration migration rollback completed' as status;