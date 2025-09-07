-- Friends Discovery Database Schema Migration
-- Run this in your Supabase SQL Editor to create the friends and watch_history tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create friends table for managing friend relationships
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate friend requests
  UNIQUE(requester_id, receiver_id),
  -- Prevent self-friendship
  CHECK (requester_id != receiver_id)
);

-- Create watch_history table for tracking user viewing activity
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL, -- TMDB movie/TV ID
  title TEXT NOT NULL,
  poster_url TEXT,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('watched', 'watching', 'dropped')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries for same user/movie
  UNIQUE(user_id, movie_id)
);

-- Create indexes for query performance optimization

-- Friends table indexes
CREATE INDEX IF NOT EXISTS idx_friends_requester_id ON friends(requester_id);
CREATE INDEX IF NOT EXISTS idx_friends_receiver_id ON friends(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_created_at ON friends(created_at DESC);

-- Composite index for efficient friend status queries
CREATE INDEX IF NOT EXISTS idx_friends_users_status ON friends(requester_id, receiver_id, status);

-- Watch history indexes
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(user_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_status ON watch_history(user_id, status);
CREATE INDEX IF NOT EXISTS idx_watch_history_media_type ON watch_history(media_type);
CREATE INDEX IF NOT EXISTS idx_watch_history_movie_id ON watch_history(movie_id);

-- Composite index for recent activity queries
CREATE INDEX IF NOT EXISTS idx_watch_history_user_recent ON watch_history(user_id, watched_at DESC, status);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for friends updated_at
DROP TRIGGER IF EXISTS trigger_friends_updated_at ON friends;
CREATE TRIGGER trigger_friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friends table

-- Users can view their own friendships (sent or received)
CREATE POLICY "Users can view their own friendships" ON friends
  FOR SELECT USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- Users can create friend requests (as requester)
CREATE POLICY "Users can create friend requests" ON friends
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Users can update received friend requests (accept/decline)
CREATE POLICY "Users can update received requests" ON friends
  FOR UPDATE USING (receiver_id = auth.uid());

-- Users can delete their own friend requests or friendships
CREATE POLICY "Users can delete their own friendships" ON friends
  FOR DELETE USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- RLS Policies for watch_history table

-- Users can manage their own watch history
CREATE POLICY "Users can manage their own watch history" ON watch_history
  FOR ALL USING (user_id = auth.uid());

-- Users can view friends' watch history (for profile viewing)
CREATE POLICY "Users can view friends' watch history" ON watch_history
  FOR SELECT USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT CASE 
        WHEN requester_id = auth.uid() THEN receiver_id
        WHEN receiver_id = auth.uid() THEN requester_id
      END
      FROM friends 
      WHERE status = 'accepted' 
      AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON friends TO authenticated;
GRANT ALL ON watch_history TO authenticated;

-- Create helper functions for friend operations

-- Function to get friend status between two users
CREATE OR REPLACE FUNCTION get_friend_status(user1_id UUID, user2_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- Return 'none' if same user
  IF user1_id = user2_id THEN
    RETURN 'none';
  END IF;
  
  -- Check for existing friendship
  RETURN (
    SELECT 
      CASE 
        WHEN status = 'accepted' THEN 'friends'
        WHEN status = 'blocked' THEN 'blocked'
        WHEN requester_id = user1_id THEN 'pending_sent'
        WHEN receiver_id = user1_id THEN 'pending_received'
        ELSE 'none'
      END
    FROM friends 
    WHERE (requester_id = user1_id AND receiver_id = user2_id)
       OR (requester_id = user2_id AND receiver_id = user1_id)
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending friend requests for a user
CREATE OR REPLACE FUNCTION get_pending_friend_requests(user_id UUID)
RETURNS TABLE(
  request_id UUID,
  requester_id UUID,
  requester_name TEXT,
  requester_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.requester_id,
    up.display_name,
    up.avatar_url,
    f.created_at
  FROM friends f
  JOIN user_profiles up ON f.requester_id = up.user_id
  WHERE f.receiver_id = user_id 
    AND f.status = 'pending'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's friends list
CREATE OR REPLACE FUNCTION get_user_friends(user_id UUID)
RETURNS TABLE(
  friend_id UUID,
  friend_name TEXT,
  friend_avatar TEXT,
  friendship_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN f.requester_id = user_id THEN f.receiver_id
      ELSE f.requester_id
    END as friend_id,
    up.display_name,
    up.avatar_url,
    f.created_at
  FROM friends f
  JOIN user_profiles up ON (
    CASE 
      WHEN f.requester_id = user_id THEN f.receiver_id
      ELSE f.requester_id
    END = up.user_id
  )
  WHERE (f.requester_id = user_id OR f.receiver_id = user_id)
    AND f.status = 'accepted'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_friend_status(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_friend_requests(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_friends(UUID) TO authenticated;

-- Create views for common queries

-- View for user profiles with friend status (for discovery)
CREATE OR REPLACE VIEW public_profiles_with_friend_status AS
SELECT 
  up.user_id,
  up.display_name,
  up.avatar_url,
  up.bio,
  up.favorite_genres,
  up.favorite_titles,
  up.is_public,
  up.created_at,
  get_friend_status(auth.uid(), up.user_id) as friend_status
FROM user_profiles up
WHERE up.is_public = true 
  AND up.user_id != auth.uid();

-- View for recent watch activity
CREATE OR REPLACE VIEW recent_watch_activity AS
SELECT 
  wh.*,
  up.display_name as user_name,
  up.avatar_url as user_avatar
FROM watch_history wh
JOIN user_profiles up ON wh.user_id = up.user_id
WHERE wh.watched_at >= NOW() - INTERVAL '30 days'
ORDER BY wh.watched_at DESC;

-- Grant access to views
GRANT SELECT ON public_profiles_with_friend_status TO authenticated;
GRANT SELECT ON recent_watch_activity TO authenticated;

-- Add comments to document the schema
COMMENT ON TABLE friends IS 'Manages friend relationships between users with request/accept workflow';
COMMENT ON TABLE watch_history IS 'Tracks user viewing activity for movies and TV shows';

COMMENT ON COLUMN friends.requester_id IS 'User who sent the friend request';
COMMENT ON COLUMN friends.receiver_id IS 'User who received the friend request';
COMMENT ON COLUMN friends.status IS 'Status of the friendship: pending, accepted, or blocked';

COMMENT ON COLUMN watch_history.movie_id IS 'TMDB movie or TV show ID';
COMMENT ON COLUMN watch_history.media_type IS 'Type of media: movie or tv';
COMMENT ON COLUMN watch_history.status IS 'Viewing status: watched, watching, or dropped';
COMMENT ON COLUMN watch_history.rating IS 'User rating from 1-10';
COMMENT ON COLUMN watch_history.watched_at IS 'When the user marked this as watched';