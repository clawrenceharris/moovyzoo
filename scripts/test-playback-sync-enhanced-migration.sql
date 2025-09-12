-- Test script for enhanced playback synchronization migration
-- This script verifies that all schema changes are applied correctly

-- ============================================================================
-- Test 1: Verify streams table has all required columns
-- ============================================================================

DO $$
BEGIN
    -- Check if all new columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streams' AND column_name = 'current_time'
    ) THEN
        RAISE EXCEPTION 'Column current_time not found in streams table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streams' AND column_name = 'is_playing'
    ) THEN
        RAISE EXCEPTION 'Column is_playing not found in streams table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streams' AND column_name = 'last_sync_at'
    ) THEN
        RAISE EXCEPTION 'Column last_sync_at not found in streams table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streams' AND column_name = 'video_url'
    ) THEN
        RAISE EXCEPTION 'Column video_url not found in streams table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streams' AND column_name = 'sync_enabled'
    ) THEN
        RAISE EXCEPTION 'Column sync_enabled not found in streams table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streams' AND column_name = 'sync_tolerance'
    ) THEN
        RAISE EXCEPTION 'Column sync_tolerance not found in streams table';
    END IF;

    RAISE NOTICE 'SUCCESS: All streams table columns exist';
END $$;

-- ============================================================================
-- Test 2: Verify playback_events table exists with correct structure
-- ============================================================================

DO $$
BEGIN
    -- Check if playback_events table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'playback_events'
    ) THEN
        RAISE EXCEPTION 'Table playback_events not found';
    END IF;

    -- Check required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'playback_events' AND column_name = 'id'
    ) THEN
        RAISE EXCEPTION 'Column id not found in playback_events table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'playback_events' AND column_name = 'stream_id'
    ) THEN
        RAISE EXCEPTION 'Column stream_id not found in playback_events table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'playback_events' AND column_name = 'event_type'
    ) THEN
        RAISE EXCEPTION 'Column event_type not found in playback_events table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'playback_events' AND column_name = 'event_id'
    ) THEN
        RAISE EXCEPTION 'Column event_id not found in playback_events table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'playback_events' AND column_name = 'metadata'
    ) THEN
        RAISE EXCEPTION 'Column metadata not found in playback_events table';
    END IF;

    RAISE NOTICE 'SUCCESS: playback_events table structure is correct';
END $$;

-- ============================================================================
-- Test 3: Verify all indexes exist
-- ============================================================================

DO $$
BEGIN
    -- Check streams table indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_streams_playback_sync'
    ) THEN
        RAISE EXCEPTION 'Index idx_streams_playback_sync not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_streams_sync_enabled'
    ) THEN
        RAISE EXCEPTION 'Index idx_streams_sync_enabled not found';
    END IF;

    -- Check playback_events table indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_playback_events_stream_timestamp'
    ) THEN
        RAISE EXCEPTION 'Index idx_playback_events_stream_timestamp not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_playback_events_event_id'
    ) THEN
        RAISE EXCEPTION 'Index idx_playback_events_event_id not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_playback_events_cleanup'
    ) THEN
        RAISE EXCEPTION 'Index idx_playback_events_cleanup not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_playback_events_stream_type'
    ) THEN
        RAISE EXCEPTION 'Index idx_playback_events_stream_type not found';
    END IF;

    RAISE NOTICE 'SUCCESS: All indexes exist';
END $$;

-- ============================================================================
-- Test 4: Verify cleanup functions exist
-- ============================================================================

DO $$
BEGIN
    -- Check cleanup functions
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'cleanup_old_playback_events'
    ) THEN
        RAISE EXCEPTION 'Function cleanup_old_playback_events not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'cleanup_inactive_stream_sync_state'
    ) THEN
        RAISE EXCEPTION 'Function cleanup_inactive_stream_sync_state not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'maintain_playback_sync_data'
    ) THEN
        RAISE EXCEPTION 'Function maintain_playback_sync_data not found';
    END IF;

    RAISE NOTICE 'SUCCESS: All cleanup functions exist';
END $$;

-- ============================================================================
-- Test 5: Test basic functionality
-- ============================================================================

DO $$
DECLARE
    test_stream_id UUID;
    test_user_id UUID;
    event_count INTEGER;
BEGIN
    -- Create test data (assuming streams and auth.users tables exist)
    -- Note: This test assumes you have at least one stream and user in the database
    
    -- Test inserting a playback event
    INSERT INTO playback_events (
        stream_id, 
        host_user_id, 
        event_type, 
        event_id, 
        timestamp_ms, 
        current_time, 
        metadata
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000001'::UUID,
        'play',
        'test_event_' || extract(epoch from now())::text,
        extract(epoch from now())::bigint * 1000,
        120,
        '{"test": true}'::jsonb
    );

    -- Verify event was inserted
    SELECT COUNT(*) INTO event_count 
    FROM playback_events 
    WHERE metadata->>'test' = 'true';

    IF event_count = 0 THEN
        RAISE EXCEPTION 'Failed to insert test playback event';
    END IF;

    -- Clean up test data
    DELETE FROM playback_events WHERE metadata->>'test' = 'true';

    RAISE NOTICE 'SUCCESS: Basic functionality test passed';
END $$;

-- ============================================================================
-- Test 6: Test cleanup functions
-- ============================================================================

DO $$
DECLARE
    cleanup_result RECORD;
BEGIN
    -- Test the maintenance function
    SELECT * INTO cleanup_result FROM maintain_playback_sync_data();
    
    RAISE NOTICE 'SUCCESS: Cleanup functions executed successfully';
    RAISE NOTICE 'Events deleted: %, Streams reset: %', 
        cleanup_result.events_deleted, 
        cleanup_result.streams_reset;
END $$;

-- ============================================================================
-- Summary
-- ============================================================================

SELECT 'Enhanced Playback Synchronization Migration Test Completed Successfully' as result;