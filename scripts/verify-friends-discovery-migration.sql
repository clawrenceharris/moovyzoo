-- Verification script for Friends Discovery migration
-- Run this after the friends-discovery-migration.sql to verify everything was created correctly

-- Check if tables exist
SELECT 'Checking tables...' as status;

SELECT 
  table_name,
  CASE WHEN table_name IN ('friends', 'watch_history') THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('friends', 'watch_history')
ORDER BY table_name;

-- Check table structures
SELECT 'Checking friends table structure...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'friends'
ORDER BY ordinal_position;

SELECT 'Checking watch_history table structure...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'watch_history'
ORDER BY ordinal_position;

-- Check constraints
SELECT 'Checking table constraints...' as status;

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  CASE WHEN tc.constraint_type = 'CHECK' THEN cc.check_clause ELSE NULL END as check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('friends', 'watch_history')
ORDER BY tc.table_name, tc.constraint_type;

-- Check indexes
SELECT 'Checking indexes...' as status;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('friends', 'watch_history')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT 'Checking Row Level Security policies...' as status;

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('friends', 'watch_history')
ORDER BY tablename, policyname;

-- Check functions
SELECT 'Checking functions...' as status;

SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_friend_status', 'get_pending_friend_requests', 'get_user_friends')
ORDER BY routine_name;

-- Check views
SELECT 'Checking views...' as status;

SELECT 
  table_name,
  view_definition
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('public_profiles_with_friend_status', 'recent_watch_activity')
ORDER BY table_name;

-- Check triggers
SELECT 'Checking triggers...' as status;

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table IN ('friends', 'watch_history')
ORDER BY event_object_table, trigger_name;

-- Test basic functionality (if user_profiles table exists)
SELECT 'Testing basic functionality...' as status;

-- Check if user_profiles table exists for foreign key references
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') 
    THEN '✓ user_profiles table exists - foreign keys should work'
    ELSE '⚠ user_profiles table not found - foreign keys may fail'
  END as user_profiles_status;

-- Summary
SELECT 'Migration verification complete!' as status;

SELECT 
  'Expected tables: 2, Found: ' || COUNT(*) as table_summary
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('friends', 'watch_history');

SELECT 
  'Expected functions: 3, Found: ' || COUNT(*) as function_summary
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_friend_status', 'get_pending_friend_requests', 'get_user_friends');

SELECT 
  'Expected views: 2, Found: ' || COUNT(*) as view_summary
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('public_profiles_with_friend_status', 'recent_watch_activity');