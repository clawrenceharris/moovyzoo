-- Streaming Session Media Integration Migration
-- This migration adds TMDB media integration columns to the habitat_watch_parties table
-- Run this in your Supabase SQL Editor after the dashboard migration

-- Add media-related columns to habitat_watch_parties table
ALTER TABLE habitat_watch_parties 
ADD COLUMN IF NOT EXISTS tmdb_id INTEGER,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) CHECK (media_type IN ('movie', 'tv')),
ADD COLUMN IF NOT EXISTS media_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS poster_path VARCHAR(255),
ADD COLUMN IF NOT EXISTS release_date DATE,
ADD COLUMN IF NOT EXISTS runtime INTEGER;

-- Create indexes for efficient media queries
CREATE INDEX IF NOT EXISTS idx_habitat_streams_tmdb_id ON habitat_watch_parties(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_habitat_streams_media_type ON habitat_watch_parties(media_type);
CREATE INDEX IF NOT EXISTS idx_habitat_streams_media_title ON habitat_watch_parties(media_title);
CREATE INDEX IF NOT EXISTS idx_habitat_streams_release_date ON habitat_watch_parties(release_date);

-- Create composite index for media queries
CREATE INDEX IF NOT EXISTS idx_habitat_streams_media_composite ON habitat_watch_parties(tmdb_id, media_type) WHERE tmdb_id IS NOT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN habitat_watch_parties.tmdb_id IS 'The Movie Database (TMDB) ID for the associated movie or TV show';
COMMENT ON COLUMN habitat_watch_parties.media_type IS 'Type of media: movie or tv';
COMMENT ON COLUMN habitat_watch_parties.media_title IS 'Title of the movie or TV show from TMDB';
COMMENT ON COLUMN habitat_watch_parties.poster_path IS 'TMDB poster image path (relative path, not full URL)';
COMMENT ON COLUMN habitat_watch_parties.release_date IS 'Release date of the movie or first air date of the TV show';
COMMENT ON COLUMN habitat_watch_parties.runtime IS 'Runtime in minutes for movies, or average episode runtime for TV shows';

-- Update the existing view to include media information
DROP VIEW IF EXISTS upcoming_watch_parties;
CREATE OR REPLACE VIEW upcoming_watch_parties AS
SELECT 
  id,
  habitat_id,
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

-- Grant access to the updated view
GRANT SELECT ON upcoming_watch_parties TO authenticated;

-- Update the dashboard view to include media information
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
  COALESCE(wp.watch_party_count, 0) as upcoming_watch_parties,
  
  -- Count streaming sessions with media
  COALESCE(wp.media_watch_party_count, 0) as media_watch_parties
  
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
  SELECT 
    habitat_id, 
    COUNT(*) as watch_party_count,
    COUNT(CASE WHEN tmdb_id IS NOT NULL THEN 1 END) as media_watch_party_count
  FROM habitat_watch_parties 
  WHERE is_active = true AND scheduled_time > NOW()
  GROUP BY habitat_id
) wp ON h.id = wp.habitat_id;

-- Grant access to the updated dashboard view
GRANT SELECT ON habitat_dashboard_data TO authenticated;

-- Create a new view for streaming sessions with media information
CREATE OR REPLACE VIEW streams_with_media AS
SELECT 
  wp.*,
  CASE 
    WHEN wp.tmdb_id IS NOT NULL THEN true 
    ELSE false 
  END as has_media,
  CASE 
    WHEN wp.poster_path IS NOT NULL THEN 
      'https://image.tmdb.org/t/p/w500' || wp.poster_path
    ELSE NULL 
  END as poster_url
FROM habitat_watch_parties wp
WHERE wp.is_active = true
ORDER BY wp.scheduled_time ASC;

-- Grant access to the media view
GRANT SELECT ON streams_with_media TO authenticated;

-- Add validation function for media data consistency
CREATE OR REPLACE FUNCTION validate_watch_party_media()
RETURNS TRIGGER AS $
BEGIN
  -- If tmdb_id is provided, media_type and media_title must also be provided
  IF NEW.tmdb_id IS NOT NULL THEN
    IF NEW.media_type IS NULL OR NEW.media_title IS NULL THEN
      RAISE EXCEPTION 'media_type and media_title are required when tmdb_id is provided';
    END IF;
  END IF;
  
  -- If any media field is provided, tmdb_id must be provided
  IF (NEW.media_type IS NOT NULL OR NEW.media_title IS NOT NULL OR 
      NEW.poster_path IS NOT NULL OR NEW.release_date IS NOT NULL OR 
      NEW.runtime IS NOT NULL) AND NEW.tmdb_id IS NULL THEN
    RAISE EXCEPTION 'tmdb_id is required when any media information is provided';
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for media data validation
DROP TRIGGER IF EXISTS trigger_validate_watch_party_media ON habitat_watch_parties;
CREATE TRIGGER trigger_validate_watch_party_media
  BEFORE INSERT OR UPDATE ON habitat_watch_parties
  FOR EACH ROW
  EXECUTE FUNCTION validate_watch_party_media();

-- Create function to construct TMDB image URLs
CREATE OR REPLACE FUNCTION get_tmdb_poster_url(poster_path TEXT, size TEXT DEFAULT 'w500')
RETURNS TEXT AS $
BEGIN
  IF poster_path IS NULL OR poster_path = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN 'https://image.tmdb.org/t/p/' || size || poster_path;
END;
$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_tmdb_poster_url(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tmdb_poster_url(TEXT) TO authenticated;