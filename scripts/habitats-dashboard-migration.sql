-- Habitats Dashboard Architecture Migration
-- This migration adds the new tables and schema changes needed for the dashboard architecture
-- Run this in your Supabase SQL Editor after the base habitats schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habitat_discussions table (chat rooms)
CREATE TABLE IF NOT EXISTS habitat_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_id UUID REFERENCES habitats(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT habitat_discussions_name_length CHECK (length(name) >= 1 AND length(name) <= 100)
);

-- Create habitat_polls table
CREATE TABLE IF NOT EXISTS habitat_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_id UUID REFERENCES habitats(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  options JSON NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT habitat_polls_title_length CHECK (length(title) >= 1 AND length(title) <= 200)
);

-- Create habitat_watch_parties table
CREATE TABLE IF NOT EXISTS habitat_watch_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_id UUID REFERENCES habitats(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  participant_count INTEGER DEFAULT 0,
  max_participants INTEGER,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT habitat_streams_title_length CHECK (length(title) >= 1 AND length(title) <= 200),
  CONSTRAINT habitat_streams_participant_count_positive CHECK (participant_count >= 0),
  CONSTRAINT habitat_streams_max_participants_positive CHECK (max_participants IS NULL OR max_participants > 0),
  CONSTRAINT habitat_streams_scheduled_future CHECK (scheduled_time > created_at)
);

-- Add chat_id column to habitat_messages table
-- First, add the column as nullable
ALTER TABLE habitat_messages 
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES habitat_discussions(id) ON DELETE CASCADE;

-- Create indexes for efficient querying
-- Discussions indexes
CREATE INDEX IF NOT EXISTS idx_habitat_discussions_habitat_id ON habitat_discussions(habitat_id);
CREATE INDEX IF NOT EXISTS idx_habitat_discussions_created_by ON habitat_discussions(created_by);
CREATE INDEX IF NOT EXISTS idx_habitat_discussions_created_at ON habitat_discussions(habitat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_habitat_discussions_is_active ON habitat_discussions(habitat_id, is_active);

-- Polls indexes
CREATE INDEX IF NOT EXISTS idx_habitat_polls_habitat_id ON habitat_polls(habitat_id);
CREATE INDEX IF NOT EXISTS idx_habitat_polls_created_by ON habitat_polls(created_by);
CREATE INDEX IF NOT EXISTS idx_habitat_polls_created_at ON habitat_polls(habitat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_habitat_polls_is_active ON habitat_polls(habitat_id, is_active);

-- Watch streams indexes
CREATE INDEX IF NOT EXISTS idx_habitat_streams_habitat_id ON habitat_watch_parties(habitat_id);
CREATE INDEX IF NOT EXISTS idx_habitat_streams_created_by ON habitat_watch_parties(created_by);
CREATE INDEX IF NOT EXISTS idx_habitat_streams_scheduled_time ON habitat_watch_parties(habitat_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_habitat_streams_is_active ON habitat_watch_parties(habitat_id, is_active);

-- Messages table indexes (updated for chat_id)
CREATE INDEX IF NOT EXISTS idx_habitat_messages_chat_id ON habitat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_habitat_messages_chat_created_at ON habitat_messages(chat_id, created_at DESC);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE habitat_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitat_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitat_watch_parties ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habitat_discussions table
-- Users can view discussions in habitats they are members of
CREATE POLICY "Users can view discussions in their habitats" ON habitat_discussions
  FOR SELECT USING (
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can create discussions in habitats they are members of
CREATE POLICY "Users can create discussions in their habitats" ON habitat_discussions
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can update discussions they created
CREATE POLICY "Users can update their own discussions" ON habitat_discussions
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete discussions they created
CREATE POLICY "Users can delete their own discussions" ON habitat_discussions
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for habitat_polls table
-- Users can view polls in habitats they are members of
CREATE POLICY "Users can view polls in their habitats" ON habitat_polls
  FOR SELECT USING (
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can create polls in habitats they are members of
CREATE POLICY "Users can create polls in their habitats" ON habitat_polls
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can update polls they created
CREATE POLICY "Users can update their own polls" ON habitat_polls
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete polls they created
CREATE POLICY "Users can delete their own polls" ON habitat_polls
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for habitat_watch_parties table
-- Users can view streaming sessions in habitats they are members of
CREATE POLICY "Users can view streaming sessions in their habitats" ON habitat_watch_parties
  FOR SELECT USING (
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can create streaming sessions in habitats they are members of
CREATE POLICY "Users can create streaming sessions in their habitats" ON habitat_watch_parties
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can update streaming sessions they created
CREATE POLICY "Users can update their own streaming sessions" ON habitat_watch_parties
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete streaming sessions they created
CREATE POLICY "Users can delete their own streaming sessions" ON habitat_watch_parties
  FOR DELETE USING (auth.uid() = created_by);

-- Update habitat_messages RLS policy to work with chat_id
-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view messages in their habitats" ON habitat_messages;
DROP POLICY IF EXISTS "Users can send messages to their habitats" ON habitat_messages;

-- Updated policies for messages with chat_id support
CREATE POLICY "Users can view messages in their habitats" ON habitat_messages
  FOR SELECT USING (
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their habitats" ON habitat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    ) AND
    (chat_id IS NULL OR chat_id IN (
      SELECT id FROM habitat_discussions 
      WHERE habitat_id IN (
        SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
      )
    ))
  );

-- Grant necessary permissions for new tables
GRANT ALL ON habitat_discussions TO authenticated;
GRANT ALL ON habitat_polls TO authenticated;
GRANT ALL ON habitat_watch_parties TO authenticated;

-- Create trigger function to update streaming session participant count
CREATE OR REPLACE FUNCTION update_watch_party_participant_count()
RETURNS TRIGGER AS $
BEGIN
  -- This function will be used later when we implement streaming session participation
  -- For now, it's a placeholder that can be extended
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Create views for dashboard data aggregation
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

-- Grant access to the dashboard view
GRANT SELECT ON habitat_dashboard_data TO authenticated;

-- Create a view for popular discussions (most recent activity)
CREATE OR REPLACE VIEW popular_habitat_discussions AS
SELECT 
  d.*,
  COALESCE(msg.message_count, 0) as message_count,
  COALESCE(msg.last_message_at, d.created_at) as last_activity
FROM habitat_discussions d
LEFT JOIN (
  SELECT 
    chat_id,
    COUNT(*) as message_count,
    MAX(created_at) as last_message_at
  FROM habitat_messages 
  WHERE chat_id IS NOT NULL
  GROUP BY chat_id
) msg ON d.id = msg.chat_id
WHERE d.is_active = true
ORDER BY last_activity DESC;

-- Grant access to the popular discussions view
GRANT SELECT ON popular_habitat_discussions TO authenticated;

-- Create a view for upcoming streaming sessions
CREATE OR REPLACE VIEW upcoming_watch_parties AS
SELECT *
FROM habitat_watch_parties
WHERE is_active = true 
  AND scheduled_time > NOW()
ORDER BY scheduled_time ASC;

-- Grant access to the upcoming streaming sessions view
GRANT SELECT ON upcoming_watch_parties TO authenticated;