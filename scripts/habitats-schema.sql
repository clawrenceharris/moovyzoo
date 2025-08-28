-- Habitats Database Schema Migration
-- Run this in your Supabase SQL Editor to create the habitats tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habitats table
CREATE TABLE IF NOT EXISTS habitats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT,
  member_count INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT habitats_name_length CHECK (length(name) >= 2),
  CONSTRAINT habitats_member_count_positive CHECK (member_count >= 0)
);

-- Create habitat_members junction table
CREATE TABLE IF NOT EXISTS habitat_members (
  habitat_id UUID REFERENCES habitats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Composite primary key
  PRIMARY KEY (habitat_id, user_id)
);

-- Create habitat_messages table
CREATE TABLE IF NOT EXISTS habitat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_id UUID REFERENCES habitats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT habitat_messages_content_length CHECK (length(content) > 0 AND length(content) <= 1000)
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_habitats_created_by ON habitats(created_by);
CREATE INDEX IF NOT EXISTS idx_habitats_is_public ON habitats(is_public);
CREATE INDEX IF NOT EXISTS idx_habitats_tags ON habitats USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_habitats_created_at ON habitats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_habitat_members_user_id ON habitat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_habitat_members_habitat_id ON habitat_members(habitat_id);
CREATE INDEX IF NOT EXISTS idx_habitat_members_joined_at ON habitat_members(joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_habitat_messages_habitat_id ON habitat_messages(habitat_id);
CREATE INDEX IF NOT EXISTS idx_habitat_messages_user_id ON habitat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_habitat_messages_created_at ON habitat_messages(habitat_id, created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for habitats updated_at
DROP TRIGGER IF EXISTS trigger_habitats_updated_at ON habitats;
CREATE TRIGGER trigger_habitats_updated_at
  BEFORE UPDATE ON habitats
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Create trigger function to update member count
CREATE OR REPLACE FUNCTION update_habitat_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE habitats 
    SET member_count = member_count + 1 
    WHERE id = NEW.habitat_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE habitats 
    SET member_count = member_count - 1 
    WHERE id = OLD.habitat_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for member count updates
DROP TRIGGER IF EXISTS trigger_habitat_member_insert ON habitat_members;
CREATE TRIGGER trigger_habitat_member_insert
  AFTER INSERT ON habitat_members
  FOR EACH ROW
  EXECUTE FUNCTION update_habitat_member_count();

DROP TRIGGER IF EXISTS trigger_habitat_member_delete ON habitat_members;
CREATE TRIGGER trigger_habitat_member_delete
  AFTER DELETE ON habitat_members
  FOR EACH ROW
  EXECUTE FUNCTION update_habitat_member_count();

-- Enable Row Level Security (RLS)
ALTER TABLE habitats ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habitats table
-- Users can view public habitats or habitats they are members of
CREATE POLICY "Users can view public habitats or their joined habitats" ON habitats
  FOR SELECT USING (
    is_public = true OR 
    id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can create habitats
CREATE POLICY "Users can create habitats" ON habitats
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update habitats they created
CREATE POLICY "Users can update their own habitats" ON habitats
  FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete habitats they created
CREATE POLICY "Users can delete their own habitats" ON habitats
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for habitat_members table
-- Users can view members of habitats they belong to
CREATE POLICY "Users can view members of their habitats" ON habitat_members
  FOR SELECT USING (
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    ) OR
    habitat_id IN (
      SELECT id FROM habitats WHERE is_public = true
    )
  );

-- Users can join habitats (insert themselves)
CREATE POLICY "Users can join habitats" ON habitat_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave habitats (delete themselves)
CREATE POLICY "Users can leave habitats" ON habitat_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for habitat_messages table
-- Users can view messages in habitats they are members of
CREATE POLICY "Users can view messages in their habitats" ON habitat_messages
  FOR SELECT USING (
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can send messages to habitats they are members of
CREATE POLICY "Users can send messages to their habitats" ON habitat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    habitat_id IN (
      SELECT habitat_id FROM habitat_members WHERE user_id = auth.uid()
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON habitat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON habitat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON habitats TO authenticated;
GRANT ALL ON habitat_members TO authenticated;
GRANT ALL ON habitat_messages TO authenticated;
GRANT SELECT ON habitats TO anon;

-- Create a view for habitats with user membership info
CREATE OR REPLACE VIEW user_habitats AS
SELECT 
  h.*,
  hm.joined_at,
  hm.last_active,
  CASE WHEN hm.user_id IS NOT NULL THEN true ELSE false END as is_member
FROM habitats h
LEFT JOIN habitat_members hm ON h.id = hm.habitat_id AND hm.user_id = auth.uid()
WHERE h.is_public = true OR hm.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_habitats TO authenticated;