-- Verification script for habitats dashboard migration
-- Run this to verify that all tables, indexes, and policies were created correctly

-- Check if new tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'habitat_discussions',
    'habitat_polls', 
    'habitat_watch_parties'
  )
ORDER BY table_name;

-- Check if chat_id column was added to habitat_messages
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'habitat_messages'
  AND column_name = 'chat_id';

-- Check indexes for new tables
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN (
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
ORDER BY tablename, indexname;

-- Check RLS policies for new tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
ORDER BY tablename, policyname;

-- Check if views were created
SELECT 
  table_name,
  table_type
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN (
    'habitat_dashboard_data',
    'popular_habitat_discussions',
    'upcoming_watch_parties'
  )
ORDER BY table_name;

-- Test basic functionality with sample queries
-- (These will return empty results until data is inserted)

-- Test habitat_discussions table
SELECT COUNT(*) as discussion_count FROM habitat_discussions;

-- Test habitat_polls table  
SELECT COUNT(*) as poll_count FROM habitat_polls;

-- Test habitat_watch_parties table
SELECT COUNT(*) as watch_party_count FROM habitat_watch_parties;

-- Test dashboard view
SELECT 
  habitat_id,
  name,
  active_discussions,
  active_polls,
  upcoming_watch_parties
FROM habitat_dashboard_data
LIMIT 5;

-- Test popular discussions view
SELECT 
  id,
  name,
  message_count,
  last_activity
FROM popular_habitat_discussions
LIMIT 5;

-- Test upcoming watch parties view
SELECT 
  id,
  title,
  scheduled_time,
  participant_count
FROM upcoming_watch_parties
LIMIT 5;