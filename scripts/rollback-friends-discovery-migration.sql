-- Rollback script for Friends Discovery migration
-- Run this to remove all friends discovery related database objects
-- WARNING: This will permanently delete all friend relationships and watch history data

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS public_profiles_with_friend_status;
DROP VIEW IF EXISTS recent_watch_activity;

-- Drop functions
DROP FUNCTION IF EXISTS get_friend_status(UUID, UUID);
DROP FUNCTION IF EXISTS get_pending_friend_requests(UUID);
DROP FUNCTION IF EXISTS get_user_friends(UUID);

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_friends_updated_at ON friends;

-- Drop tables (this will also drop all indexes and constraints)
DROP TABLE IF EXISTS watch_history;
DROP TABLE IF EXISTS friends;

-- Verify cleanup
SELECT 'Rollback verification...' as status;

-- Check that tables were dropped
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ All friends discovery tables removed'
    ELSE '⚠ Some tables still exist: ' || string_agg(table_name, ', ')
  END as table_cleanup_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('friends', 'watch_history');

-- Check that functions were dropped
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ All friends discovery functions removed'
    ELSE '⚠ Some functions still exist: ' || string_agg(routine_name, ', ')
  END as function_cleanup_status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_friend_status', 'get_pending_friend_requests', 'get_user_friends');

-- Check that views were dropped
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ All friends discovery views removed'
    ELSE '⚠ Some views still exist: ' || string_agg(table_name, ', ')
  END as view_cleanup_status
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('public_profiles_with_friend_status', 'recent_watch_activity');

SELECT 'Rollback complete!' as status;