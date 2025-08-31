-- Verification script for Habitats database schema
-- Run this in your Supabase SQL Editor to verify the habitats setup

-- Check if all habitat tables exist
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('habitats', 'habitat_members', 'habitat_messages')
ORDER BY table_name;

-- Check habitats table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitats'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check habitat_members table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitat_members'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check habitat_messages table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitat_messages'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check indexes for all habitat tables
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('habitats', 'habitat_members', 'habitat_messages')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Check RLS policies for habitat tables
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('habitats', 'habitat_members', 'habitat_messages')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if RLS is enabled on all habitat tables
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('habitats', 'habitat_members', 'habitat_messages')
  AND schemaname = 'public'
ORDER BY tablename;

-- Check triggers
SELECT 
  event_object_table,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('habitats', 'habitat_members', 'habitat_messages')
  AND event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check trigger functions
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name IN ('set_updated_at', 'update_habitat_member_count')
  AND routine_schema = 'public';

-- Check foreign key constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('habitats', 'habitat_members', 'habitat_messages')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Check table constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.check_constraints AS cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('habitats', 'habitat_members', 'habitat_messages')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- Check if user_habitats view exists
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_name = 'user_habitats'
  AND table_schema = 'public';

-- Test data insertion (optional - comment out if you don't want test data)
/*
-- Insert a test habitat
INSERT INTO habitats (name, description, tags, created_by) 
VALUES (
  'Test Habitat', 
  'A test habitat for verification', 
  ARRAY['test', 'verification'], 
  auth.uid()
) ON CONFLICT DO NOTHING;

-- Check if the test habitat was created
SELECT * FROM habitats WHERE name = 'Test Habitat';
*/