-- Verification Script for Stream Participants Migration
-- Run this script to verify that the stream participants migration was successful

-- Check if the stream_participants table exists and has the correct structure
SELECT 
  'stream_participants table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'stream_participants' AND table_schema = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check if all required columns exist with correct types
SELECT 
  'stream_participants columns' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.columns 
      WHERE table_name = 'stream_participants' 
      AND column_name IN ('id', 'stream_id', 'user_id', 'joined_at', 'is_host', 'reminder_enabled', 'created_at')
    ) = 7 THEN '✅ ALL COLUMNS PRESENT'
    ELSE '❌ MISSING COLUMNS'
  END as status;

-- Check if the unique constraint exists
SELECT 
  'unique constraint' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'stream_participants' 
      AND constraint_name = 'unique_stream_participant'
      AND constraint_type = 'UNIQUE'
    ) THEN '✅ UNIQUE CONSTRAINT EXISTS'
    ELSE '❌ UNIQUE CONSTRAINT MISSING'
  END as status;

-- Check if foreign key constraints exist
SELECT 
  'foreign key constraints' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.table_constraints 
      WHERE table_name = 'stream_participants' 
      AND constraint_type = 'FOREIGN KEY'
    ) >= 2 THEN '✅ FOREIGN KEYS EXIST'
    ELSE '❌ FOREIGN KEYS MISSING'
  END as status;

-- Check if required indexes exist
SELECT 
  'required indexes' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_indexes 
      WHERE tablename = 'stream_participants'
      AND indexname IN (
        'idx_stream_participants_stream_id',
        'idx_stream_participants_user_id', 
        'idx_stream_participants_joined_at',
        'idx_stream_participants_is_host',
        'idx_stream_participants_stream_user'
      )
    ) >= 4 THEN '✅ INDEXES CREATED'
    ELSE '❌ INDEXES MISSING'
  END as status;

-- Check if RLS is enabled
SELECT 
  'row level security' as check_name,
  CASE 
    WHEN (
      SELECT relrowsecurity FROM pg_class 
      WHERE relname = 'stream_participants'
    ) THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status;

-- Check if RLS policies exist
SELECT 
  'rls policies' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE tablename = 'stream_participants'
    ) >= 4 THEN '✅ POLICIES CREATED'
    ELSE '❌ POLICIES MISSING'
  END as status;

-- Check if trigger functions exist
SELECT 
  'trigger functions' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_proc 
      WHERE proname IN (
        'update_stream_participant_count',
        'assign_first_participant_as_host',
        'reassign_host_on_leave'
      )
    ) = 3 THEN '✅ TRIGGER FUNCTIONS EXIST'
    ELSE '❌ TRIGGER FUNCTIONS MISSING'
  END as status;

-- Check if triggers exist
SELECT 
  'triggers' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_trigger 
      WHERE tgname IN (
        'trigger_stream_participant_insert',
        'trigger_stream_participant_delete',
        'trigger_assign_first_host',
        'trigger_reassign_host'
      )
    ) = 4 THEN '✅ TRIGGERS CREATED'
    ELSE '❌ TRIGGERS MISSING'
  END as status;

-- Check if views exist
SELECT 
  'views' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.views 
      WHERE table_name IN ('streams_with_participants', 'upcoming_watch_parties')
    ) = 2 THEN '✅ VIEWS CREATED'
    ELSE '❌ VIEWS MISSING'
  END as status;

-- Check if helper function exists
SELECT 
  'helper functions' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'get_stream_participants'
    ) THEN '✅ HELPER FUNCTION EXISTS'
    ELSE '❌ HELPER FUNCTION MISSING'
  END as status;

-- Test basic functionality with sample data (if habitat_watch_parties table has data)
DO $
DECLARE
  test_stream_id UUID;
  test_user_id UUID;
  participant_count INTEGER;
BEGIN
  -- Try to get a test stream ID
  SELECT id INTO test_stream_id FROM habitat_watch_parties LIMIT 1;
  
  IF test_stream_id IS NOT NULL THEN
    -- Create a test user ID (this would normally be from auth.users)
    test_user_id := gen_random_uuid();
    
    -- Test insert (this will fail due to foreign key constraint, but that's expected)
    BEGIN
      INSERT INTO stream_participants (stream_id, user_id) 
      VALUES (test_stream_id, test_user_id);
      
      -- If we get here, the insert worked (shouldn't happen due to FK constraint)
      SELECT COUNT(*) INTO participant_count FROM stream_participants WHERE stream_id = test_stream_id;
      
      -- Clean up test data
      DELETE FROM stream_participants WHERE stream_id = test_stream_id AND user_id = test_user_id;
      
      RAISE NOTICE '✅ Basic functionality test passed (participant count: %)', participant_count;
    EXCEPTION 
      WHEN foreign_key_violation THEN
        RAISE NOTICE '✅ Foreign key constraint working correctly';
      WHEN OTHERS THEN
        RAISE NOTICE '❌ Unexpected error during functionality test: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'ℹ️  No test data available in habitat_watch_parties table';
  END IF;
END $;

-- Summary
SELECT 
  '=== MIGRATION VERIFICATION COMPLETE ===' as summary,
  CASE 
    WHEN (
      -- Count successful checks (this is a simplified check)
      SELECT COUNT(*) FROM (
        SELECT 1 WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stream_participants')
        UNION ALL
        SELECT 1 WHERE (SELECT relrowsecurity FROM pg_class WHERE relname = 'stream_participants')
        UNION ALL  
        SELECT 1 WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_stream_participant_count')
        UNION ALL
        SELECT 1 WHERE EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'streams_with_participants')
      ) checks
    ) >= 4 THEN '✅ MIGRATION SUCCESSFUL'
    ELSE '❌ MIGRATION INCOMPLETE'
  END as result;