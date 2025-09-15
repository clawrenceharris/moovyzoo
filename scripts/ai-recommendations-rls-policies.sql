-- RLS Policies for AI Recommendations
-- Run this after enabling RLS on the recommendation_sessions table

-- Enable RLS on the table (if not already enabled)
ALTER TABLE recommendation_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own recommendation sessions
CREATE POLICY "Users can read own recommendations" ON recommendation_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own recommendation sessions
CREATE POLICY "Users can insert own recommendations" ON recommendation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recommendation sessions
CREATE POLICY "Users can update own recommendations" ON recommendation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own recommendation sessions
CREATE POLICY "Users can delete own recommendations" ON recommendation_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Allow service role to manage all recommendations (for cleanup function)
CREATE POLICY "Service role full access" ON recommendation_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON POLICY "Users can read own recommendations" ON recommendation_sessions IS 'Users can only access their own cached recommendations';
COMMENT ON POLICY "Users can insert own recommendations" ON recommendation_sessions IS 'Users can create new recommendation cache entries';
COMMENT ON POLICY "Users can update own recommendations" ON recommendation_sessions IS 'Users can refresh their recommendation cache';
COMMENT ON POLICY "Users can delete own recommendations" ON recommendation_sessions IS 'Users can clear their recommendation cache';
COMMENT ON POLICY "Service role full access" ON recommendation_sessions IS 'Allows backend services to manage cache cleanup and maintenance';