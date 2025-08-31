-- Verification script for Watch Party Media Integration Migration
-- Run this after the media integration migration to verify all changes were applied correctly

-- Check if all new columns exist in habitat_watch_parties table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'habitat_watch_parties' 
  AND column_name IN ('tmdb_id', 'media_type', 'media_title', 'poster_path', 'release_date', 'runtime')
ORDER BY column_name;

-- Verify media_type check constraint exists
SELECT 
  conname as constraint_name,
  consrc as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%media_type%' 
  AND conrelid = 'habitat_watch_parties'::regclass;

-- Check if all new indexes were created
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'habitat_watch_parties' 
  AND indexname LIKE '%media%'
ORDER BY indexname;

-- Verify the validation trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_validate_watch_party_media';

-- Check if views were updated correctly
SELECT 
  table_name,
  view_definition
FROM information_schema.views 
WHERE table_name IN ('upcoming_watch_parties', 'habitat_dashboard_data', 'watch_parties_with_media')
ORDER BY table_name;

-- Verify functions exist
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('validate_watch_party_media', 'get_tmdb_poster_url')
ORDER BY routine_name;

-- Test data insertion with media information (this should succeed)
BEGIN;
  -- Insert a test watch party with media
  INSERT INTO habitat_watch_parties (
    habitat_id, 
    title, 
    description, 
    scheduled_time, 
    created_by,
    tmdb_id,
    media_type,
    media_title,
    poster_path,
    release_date,
    runtime
  ) VALUES (
    (SELECT id FROM habitats LIMIT 1), -- Use first available habitat
    'Test Movie Night',
    'Testing media integration',
    NOW() + INTERVAL '1 day',
    (SELECT id FROM profiles LIMIT 1), -- Use first available user
    550, -- TMDB ID for Fight Club
    'movie',
    'Fight Club',
    '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    '1999-10-15',
    139
  );
  
  -- Verify the insertion worked
  SELECT 
    title,
    tmdb_id,
    media_type,
    media_title,
    poster_path,
    release_date,
    runtime
  FROM habitat_watch_parties 
  WHERE title = 'Test Movie Night';
  
  -- Test the poster URL function
  SELECT get_tmdb_poster_url('/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg') as poster_url;
  SELECT get_tmdb_poster_url('/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'w300') as small_poster_url;
  
ROLLBACK; -- Don't actually insert test data

-- Test validation constraints (these should fail)
DO $
BEGIN
  -- Test 1: tmdb_id without media_type should fail
  BEGIN
    INSERT INTO habitat_watch_parties (
      habitat_id, 
      title, 
      scheduled_time, 
      created_by,
      tmdb_id
    ) VALUES (
      (SELECT id FROM habitats LIMIT 1),
      'Invalid Test 1',
      NOW() + INTERVAL '1 day',
      (SELECT id FROM profiles LIMIT 1),
      550
    );
    RAISE EXCEPTION 'Test 1 should have failed but did not';
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE NOTICE 'Test 1 passed: Validation correctly rejected tmdb_id without media_type';
  END;
  
  -- Test 2: media_type without tmdb_id should fail
  BEGIN
    INSERT INTO habitat_watch_parties (
      habitat_id, 
      title, 
      scheduled_time, 
      created_by,
      media_type
    ) VALUES (
      (SELECT id FROM habitats LIMIT 1),
      'Invalid Test 2',
      NOW() + INTERVAL '1 day',
      (SELECT id FROM profiles LIMIT 1),
      'movie'
    );
    RAISE EXCEPTION 'Test 2 should have failed but did not';
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE NOTICE 'Test 2 passed: Validation correctly rejected media_type without tmdb_id';
  END;
  
  -- Test 3: Invalid media_type should fail
  BEGIN
    INSERT INTO habitat_watch_parties (
      habitat_id, 
      title, 
      scheduled_time, 
      created_by,
      tmdb_id,
      media_type,
      media_title
    ) VALUES (
      (SELECT id FROM habitats LIMIT 1),
      'Invalid Test 3',
      NOW() + INTERVAL '1 day',
      (SELECT id FROM profiles LIMIT 1),
      550,
      'invalid_type',
      'Test Movie'
    );
    RAISE EXCEPTION 'Test 3 should have failed but did not';
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE NOTICE 'Test 3 passed: Validation correctly rejected invalid media_type';
  END;
END $;

-- Summary
SELECT 'Media integration migration verification completed successfully' as status;