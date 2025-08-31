-- Complete Verification Script for Habitats Database Schema
-- This script verifies both the base habitats schema and dashboard migration
-- Run this in your Supabase SQL Editor to verify the complete setup

-- ============================================================================
-- TABLE EXISTENCE CHECK
-- ============================================================================

-- Check if all habitat tables exist (base + dashboard)
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
ORDER BY table_name;

-- ============================================================================
-- BASE SCHEMA VERIFICATION
-- ============================================================================

-- Check habitats table structure
SELECT 'HABITATS TABLE STRUCTURE' as check_type;
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
SELECT 'HABITAT_MEMBERS TABLE STRUCTURE' as check_type;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitat_members'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check habitat_messages table structure (should include chat_id after migration)
SELECT 'HABITAT_MESSAGES TABLE STRUCTURE' as check_type;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitat_messages'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- DASHBOARD SCHEMA VERIFICATION
-- ============================================================================

-- Check habitat_discussions table structure
SELECT 'HABITAT_DISCUSSIONS TABLE STRUCTURE' as check_type;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitat_discussions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check habitat_polls table structure
SELECT 'HABITAT_POLLS TABLE STRUCTURE' as check_type;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitat_polls'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check habitat_watch_parties table structure
SELECT 'HABITAT_WATCH_PARTIES TABLE STRUCTURE' as check_type;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'habitat_watch_parties'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- INDEXES VERIFICATION
-- ============================================================================

-- Check indexes for all habitat tables
SELECT 'INDEXES' as check_type;
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- RLS POLICIES VERIFICATION
-- ============================================================================

-- Check RLS policies for all habitat tables
SELECT 'RLS POLICIES' as check_type;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if RLS is enabled on all habitat tables
SELECT 'RLS ENABLED STATUS' as check_type;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS VERIFICATION
-- ============================================================================

-- Check triggers
SELECT 'TRIGGERS' as check_type;
SELECT 
  event_object_table,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check trigger functions
SELECT 'TRIGGER FUNCTIONS' as check_type;
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN (
    'set_updated_at', 
    'update_habitat_member_count',
    'update_watch_party_participant_count'
  )
  AND routine_schema = 'public';

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS VERIFICATION
-- ============================================================================

-- Check foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS' as check_type;
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
  AND tc.table_name IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- CHECK CONSTRAINTS VERIFICATION
-- ============================================================================

-- Check table constraints
SELECT 'CHECK CONSTRAINTS' as check_type;
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints AS tc
LEFT JOIN information_schema.check_constraints AS cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================================================
-- VIEWS VERIFICATION
-- ============================================================================

-- Check if all views exist
SELECT 'VIEWS' as check_type;
SELECT 
  table_name,
  table_type
FROM information_schema.views
WHERE table_name IN (
    'user_habitats',
    'habitat_dashboard_data',
    'popular_habitat_discussions',
    'upcoming_watch_parties'
  )
  AND table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- FUNCTIONAL TESTING
-- ============================================================================

-- Test basic functionality with sample queries
-- (These will return empty results until data is inserted)

SELECT 'FUNCTIONAL TESTS' as check_type;

-- Test base tables
SELECT 'Base Tables Count' as test_name, 
       COUNT(*) as habitat_count FROM habitats
UNION ALL
SELECT 'Members Count', COUNT(*) FROM habitat_members
UNION ALL  
SELECT 'Messages Count', COUNT(*) FROM habitat_messages;

-- Test dashboard tables
SELECT 'Dashboard Tables Count' as test_name,
       COUNT(*) as discussion_count FROM habitat_discussions
UNION ALL
SELECT 'Polls Count', COUNT(*) FROM habitat_polls
UNION ALL
SELECT 'Watch Parties Count', COUNT(*) FROM habitat_watch_parties;

-- Test dashboard view
SELECT 'Dashboard View Test' as test_name;
SELECT 
  habitat_id,
  name,
  active_discussions,
  active_polls,
  upcoming_watch_parties
FROM habitat_dashboard_data
LIMIT 5;

-- Test popular discussions view
SELECT 'Popular Discussions View Test' as test_name;
SELECT 
  id,
  name,
  message_count,
  last_activity
FROM popular_habitat_discussions
LIMIT 5;

-- Test upcoming watch parties view
SELECT 'Upcoming Watch Parties View Test' as test_name;
SELECT 
  id,
  title,
  scheduled_time,
  participant_count
FROM upcoming_watch_parties
LIMIT 5;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 'VERIFICATION SUMMARY' as summary;
SELECT 
  'Tables Created' as item,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
UNION ALL
SELECT 
  'Views Created',
  COUNT(*)
FROM information_schema.views
WHERE table_name IN (
    'user_habitats',
    'habitat_dashboard_data',
    'popular_habitat_discussions',
    'upcoming_watch_parties'
  )
  AND table_schema = 'public'
UNION ALL
SELECT 
  'Indexes Created',
  COUNT(*)
FROM pg_indexes 
WHERE tablename IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND schemaname = 'public'
UNION ALL
SELECT 
  'RLS Policies Created',
  COUNT(*)
FROM pg_policies 
WHERE tablename IN (
    'habitats', 
    'habitat_members', 
    'habitat_messages',
    'habitat_discussions',
    'habitat_polls',
    'habitat_watch_parties'
  )
  AND schemaname = 'public';

-- Final status message
SELECT 
  CASE 
    WHEN (
      SELECT COUNT(*) 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'habitats', 
          'habitat_members', 
          'habitat_messages',
          'habitat_discussions',
          'habitat_polls',
          'habitat_watch_parties'
        )
    ) = 6 THEN 'SUCCESS: All habitat tables exist'
    ELSE 'ERROR: Some habitat tables are missing'
  END as verification_status;