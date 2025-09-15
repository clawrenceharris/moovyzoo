-- AI Recommendations Database Migration
-- Creates recommendation_sessions cache table with performance indices
-- Based on design specifications in .kiro/specs/ai-recommendations/design.md

-- Create recommendation_sessions cache table
CREATE TABLE IF NOT EXISTS recommendation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  content_recommendations JSONB NOT NULL,
  friend_suggestions JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, session_id)
);

-- Add performance indices
CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_user 
ON recommendation_sessions(user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_expires 
ON recommendation_sessions(expires_at);

-- Add comments for documentation
COMMENT ON TABLE recommendation_sessions IS 'Cache table for AI-generated content and friend recommendations';
COMMENT ON COLUMN recommendation_sessions.user_id IS 'References the user who owns these recommendations';
COMMENT ON COLUMN recommendation_sessions.session_id IS 'Unique session identifier for cache invalidation';
COMMENT ON COLUMN recommendation_sessions.content_recommendations IS 'JSON array of ContentRecommendation objects';
COMMENT ON COLUMN recommendation_sessions.friend_suggestions IS 'JSON array of FriendSuggestion objects';
COMMENT ON COLUMN recommendation_sessions.generated_at IS 'Timestamp when recommendations were generated';
COMMENT ON COLUMN recommendation_sessions.expires_at IS 'Timestamp when cache expires (24 hours from generation)';

-- Create function to clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM recommendation_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment for cleanup function
COMMENT ON FUNCTION cleanup_expired_recommendations() IS 'Removes expired recommendation cache entries and returns count of deleted rows';