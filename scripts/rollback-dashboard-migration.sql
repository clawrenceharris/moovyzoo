-- Rollback script for habitats dashboard migration
-- Run this to revert the dashboard architecture changes
-- WARNING: This will delete all data in the new tables

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS upcoming_watch_parties;
DROP VIEW IF EXISTS popular_habitat_discussions;
DROP VIEW IF EXISTS habitat_dashboard_data;

-- Drop trigger functions
DROP FUNCTION IF EXISTS update_watch_party_participant_count();

-- Remove chat_id column from habitat_messages
-- Note: This will remove any data in the chat_id column
ALTER TABLE habitat_messages DROP COLUMN IF EXISTS chat_id;

-- Drop new tables (this will delete all data in these tables)
DROP TABLE IF EXISTS habitat_watch_parties;
DROP TABLE IF EXISTS habitat_polls;
DROP TABLE IF EXISTS habitat_discussions;

-- Recreate original habitat_messages RLS policies
DROP POLICY IF EXISTS "Users can view messages in their habitats" ON habitat_messages;
DROP POLICY IF EXISTS "Users can send messages to their habitats" ON habitat_messages;

-- Restore original policies
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
    )
  );

-- Note: Indexes will be automatically dropped when tables are dropped
-- The original habitat_messages indexes remain intact