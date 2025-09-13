-- Stream Chat Migration
-- This migration adds the stream_messages table for real-time chat functionality
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stream_messages table
CREATE TABLE IF NOT EXISTS stream_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT stream_messages_content_length CHECK (length(message) > 0 AND length(message) <= 500)
);

-- Create indexes for efficient chat queries
CREATE INDEX IF NOT EXISTS idx_stream_messages_stream ON stream_messages(stream_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stream_messages_user ON stream_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_messages_created_at ON stream_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE stream_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stream_messages table
-- Users can view messages in streams they are participants of
CREATE POLICY "Users can view messages in streams they participate in" ON stream_messages
  FOR SELECT USING (
    stream_id IN (
      SELECT stream_id FROM stream_members WHERE user_id = auth.uid()
    )
  );

-- Users can send messages to streams they are participants of
CREATE POLICY "Users can send messages to streams they participate in" ON stream_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    stream_id IN (
      SELECT stream_id FROM stream_members WHERE user_id = auth.uid()
    )
  );

-- Users can update their own messages (for editing)
CREATE POLICY "Users can update their own messages" ON stream_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON stream_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON stream_messages TO authenticated;

-- Create function to get chat messages with profile information
CREATE OR REPLACE FUNCTION get_stream_messages(stream_uuid UUID, message_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  message_id UUID,
  stream_id UUID,
  user_id UUID,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  display_name TEXT,
  avatar_url TEXT
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    sm.id as message_id,
    sm.stream_id,
    sm.user_id,
    sm.message,
    sm.created_at,
    p.display_name,
    p.avatar_url
  FROM stream_messages sm
  LEFT JOIN profiles p ON sm.user_id = p.id
  WHERE sm.stream_id = stream_uuid
  ORDER BY sm.created_at DESC
  LIMIT message_limit;
END;
$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_stream_messages(UUID, INTEGER) TO authenticated;

-- Add comments to document the new table
COMMENT ON TABLE stream_messages IS 'Stores chat messages for streaming sessions';
COMMENT ON COLUMN stream_messages.stream_id IS 'Reference to the streaming session';
COMMENT ON COLUMN stream_messages.user_id IS 'Reference to the user who sent the message';
COMMENT ON COLUMN stream_messages.message IS 'The chat message content';
COMMENT ON COLUMN stream_messages.created_at IS 'Timestamp when the message was sent';