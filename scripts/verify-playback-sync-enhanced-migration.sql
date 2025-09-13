-- Verification script for enhanced playback synchronization migration
-- This script provides a comprehensive overview of the migration status

-- ============================================================================
-- 1. Streams Table Schema Verification
-- ============================================================================

SELECT 
    'Streams Table Columns' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'streams' 
    AND column_name IN ('time', 'is_playing', 'last_sync_at', 'video_url', 'sync_enabled', 'sync_tolerance')
ORDER BY column_name;

-- ============================================================================
-- 2. Playback Events Table Schema Verification
-- ============================================================================

SELECT 
    'Playback Events Table Structure' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'playback_events'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. Index Verification
-- ============================================================================

SELECT 
    'Database Indexes' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE '%playback%' OR indexname LIKE '%sync%'
ORDER BY tablename, indexname;

-- ============================================================================
-- 4. Function Verification
-- ============================================================================

SELECT 
    'Cleanup Functions' as section,
    proname as function_name,
    pg_get_function_result(oid) as return_type,
    pronargs as argument_count
FROM pg_proc 
WHERE proname IN ('cleanup_old_playback_events', 'cleanup_inactive_stream_sync_state', 'maintain_playback_sync_data')
ORDER BY proname;

-- ============================================================================
-- 5. Constraint Verification
-- ============================================================================

SELECT 
    'Table Constraints' as section,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'playback_events'::regclass
ORDER BY conname;

-- ============================================================================
-- 6. Table Comments Verification
-- ============================================================================

SELECT 
    'Table and Column Comments' as section,
    obj_description('playback_events'::regclass) as table_comment;

SELECT 
    'Column Comments' as section,
    a.attname as column_name,
    col_description(a.attrelid, a.attnum) as column_comment
FROM pg_attribute a
WHERE a.attrelid = 'playback_events'::regclass 
    AND a.attnum > 0 
    AND NOT a.attisdropped
    AND col_description(a.attrelid, a.attnum) IS NOT NULL
ORDER BY a.attnum;

-- ============================================================================
-- 7. Sample Data Verification (if any exists)
-- ============================================================================

SELECT 
    'Playback Events Sample' as section,
    COUNT(*) as total_events,
    COUNT(DISTINCT stream_id) as unique_streams,
    COUNT(DISTINCT event_type) as unique_event_types,
    MIN(created_at) as earliest_event,
    MAX(created_at) as latest_event
FROM playback_events;

SELECT 
    'Event Types Distribution' as section,
    event_type,
    COUNT(*) as count
FROM playback_events
GROUP BY event_type
ORDER BY count DESC;

-- ============================================================================
-- 8. Streams with Sync Data
-- ============================================================================

SELECT 
    'Streams with Sync Data' as section,
    COUNT(*) as total_streams,
    COUNT(*) FILTER (WHERE sync_enabled = true) as sync_enabled_streams,
    COUNT(*) FILTER (WHERE time > 0) as streams_with_position,
    COUNT(*) FILTER (WHERE is_playing = true) as currently_playing_streams,
    AVG(sync_tolerance) as avg_sync_tolerance
FROM streams
WHERE time IS NOT NULL; -- Only count streams that have been migrated

-- ============================================================================
-- 9. Migration Status Summary
-- ============================================================================

SELECT 
    'Migration Status Summary' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'streams' AND column_name = 'sync_tolerance')
            AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'playback_events')
            AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'maintain_playback_sync_data')
        THEN 'COMPLETE - Enhanced playback synchronization migration applied successfully'
        ELSE 'INCOMPLETE - Migration not fully applied'
    END as status;

-- ============================================================================
-- 10. Performance Check
-- ============================================================================

EXPLAIN (ANALYZE, BUFFERS) 
SELECT s.id, s.time, s.is_playing, s.last_sync_at
FROM streams s
WHERE s.is_active = true AND s.sync_enabled = true
ORDER BY s.last_sync_at DESC
LIMIT 10;