# Stream Participants Migration

## Overview

This migration adds comprehensive participant management functionality to streaming sessions (watch parties). It creates the `stream_participants` table and associated infrastructure to track user participation, host management, and reminder preferences.

## What This Migration Does

### 1. Creates `stream_participants` Table

The new table tracks:

- **User participation** in streaming sessions
- **Host status** with automatic assignment and reassignment
- **Reminder preferences** for notifications
- **Join timestamps** for participant ordering

### 2. Database Features

- **Unique constraints** prevent duplicate participation
- **Foreign key constraints** ensure data integrity
- **Indexes** for efficient queries
- **Row Level Security (RLS)** for access control
- **Triggers** for automatic participant count updates
- **Functions** for host management logic

### 3. Automatic Behaviors

- **First participant becomes host** automatically
- **Host reassignment** when current host leaves
- **Participant count updates** in real-time
- **Access control** based on habitat membership

## Prerequisites

Before running this migration:

1. ✅ Base habitats schema must be installed
2. ✅ Dashboard migration must be completed
3. ✅ Media integration migration must be completed
4. ✅ `habitat_watch_parties` table must exist
5. ✅ User authentication system must be set up

## Migration Files

- **`stream-participants-migration.sql`** - Main migration script
- **`rollback-stream-participants-migration.sql`** - Rollback script
- **`verify-stream-participants-migration.sql`** - Verification script
- **`stream-participants-migration-README.md`** - This documentation

## Running the Migration

### Step 1: Backup Your Database

```sql
-- Create a backup of your current schema
pg_dump your_database > backup_before_stream_participants.sql
```

### Step 2: Run the Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `scripts/stream-participants-migration.sql`
5. Paste and execute the migration

### Step 3: Verify the Migration

1. Create a new query in SQL Editor
2. Copy the contents of `scripts/verify-stream-participants-migration.sql`
3. Run the verification script
4. Check that all status indicators show ✅

## Expected Results

After successful migration, you should see:

### New Database Objects

- ✅ `stream_participants` table with 7 columns
- ✅ 5 indexes for efficient querying
- ✅ 5 RLS policies for access control
- ✅ 4 triggers for automatic behaviors
- ✅ 3 trigger functions for business logic
- ✅ 2 updated views with participant data
- ✅ 1 helper function for participant queries

### Automatic Behaviors

- ✅ Participant count updates automatically
- ✅ First joiner becomes host
- ✅ Host reassignment when host leaves
- ✅ Access control based on habitat membership

## Database Schema

### `stream_participants` Table Structure

```sql
CREATE TABLE stream_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES habitat_watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_host BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_stream_participant UNIQUE(stream_id, user_id)
);
```

### Key Indexes

- `idx_stream_participants_stream_id` - Fast participant lookups by stream
- `idx_stream_participants_user_id` - Fast stream lookups by user
- `idx_stream_participants_is_host` - Fast host identification
- `idx_stream_participants_stream_user` - Composite queries

### RLS Policies

1. **View participants** - Users can see participants of accessible streams
2. **Join streams** - Users can join streams in their habitats
3. **Update participation** - Users can modify their own settings
4. **Leave streams** - Users can remove themselves
5. **Host management** - Hosts can manage other participants

## Business Logic

### Host Assignment Rules

1. **First participant** automatically becomes host
2. **Host leaves** → Next oldest participant becomes host
3. **No participants left** → Stream continues without host
4. **Manual host transfer** → Supported through future UI

### Access Control Rules

1. **Habitat membership required** to participate
2. **Stream visibility** respects habitat permissions
3. **Participant data** only visible to habitat members
4. **Host actions** restricted to actual hosts

### Participant Count Management

- **Real-time updates** via database triggers
- **Automatic synchronization** with `habitat_watch_parties.participant_count`
- **Consistency checks** prevent count drift
- **Performance optimized** with efficient queries

## Testing the Migration

### Basic Functionality Test

```sql
-- Test participant insertion (requires valid stream_id and user_id)
INSERT INTO stream_participants (stream_id, user_id)
VALUES ('your-stream-id', 'your-user-id');

-- Verify host assignment
SELECT is_host FROM stream_participants
WHERE stream_id = 'your-stream-id' AND user_id = 'your-user-id';

-- Test participant count update
SELECT participant_count FROM habitat_watch_parties
WHERE id = 'your-stream-id';
```

### View Testing

```sql
-- Test streams with participants view
SELECT * FROM streams_with_participants LIMIT 5;

-- Test updated upcoming watch parties view
SELECT * FROM upcoming_watch_parties LIMIT 5;

-- Test participant helper function
SELECT * FROM get_stream_participants('your-stream-id');
```

## Troubleshooting

### Common Issues

1. **Foreign key violations**

   - Ensure `habitat_watch_parties` table exists
   - Verify user authentication is set up
   - Check that referenced IDs exist

2. **Permission errors**

   - Confirm you have admin access to Supabase
   - Check that RLS policies are correctly applied
   - Verify user is authenticated

3. **Trigger failures**

   - Check that trigger functions compiled successfully
   - Verify no conflicting triggers exist
   - Review trigger execution order

4. **View creation errors**
   - Ensure all referenced tables exist
   - Check for naming conflicts with existing views
   - Verify column names match table schema

### Debugging Commands

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'stream_participants';

-- Check triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'stream_participants';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'stream_participants';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'stream_participants';
```

## Rollback Instructions

If you need to rollback this migration:

1. **Run rollback script**:

   ```sql
   -- Copy contents of scripts/rollback-stream-participants-migration.sql
   ```

2. **Verify rollback**:

   ```sql
   -- Check table is removed
   SELECT table_name FROM information_schema.tables
   WHERE table_name = 'stream_participants';
   ```

3. **Restore from backup** (if needed):
   ```bash
   psql your_database < backup_before_stream_participants.sql
   ```

## Next Steps

After successful migration:

1. **Update TypeScript types** to include participant data
2. **Implement repository methods** for participant management
3. **Create service layer methods** for join/leave operations
4. **Build UI components** for participant display
5. **Add real-time subscriptions** for participant updates
6. **Implement host management** features

## Integration with Existing Code

### Repository Updates Needed

The existing `StreamingRepository` will need updates to:

- Use `habitat_watch_parties` instead of `streams` table
- Use `stream_participants` instead of `streaming_members` table
- Implement new participant management methods
- Update queries to use new schema

### Service Layer Updates

The `StreamService` will need:

- New methods for reminder management
- Host assignment logic
- Updated participant queries
- Real-time subscription handling

### UI Component Updates

Components will need:

- Participant list display
- Join/leave button functionality
- Host indicator UI
- Reminder toggle controls

## Performance Considerations

### Query Optimization

- **Indexes** are optimized for common query patterns
- **Composite indexes** support complex filtering
- **Partial indexes** reduce storage for boolean columns
- **Foreign key indexes** ensure join performance

### Real-time Performance

- **Triggers** are lightweight and efficient
- **Participant counts** update atomically
- **Host reassignment** happens in single transaction
- **RLS policies** use efficient filtering

### Scalability

- **Pagination** supported in views
- **Efficient joins** with proper indexing
- **Minimal trigger overhead** for high-frequency operations
- **Connection pooling** compatible

## Security Considerations

### Access Control

- **RLS policies** enforce habitat-based access
- **User isolation** prevents cross-user data access
- **Host privileges** properly restricted
- **Input validation** at database level

### Data Protection

- **Cascade deletes** maintain referential integrity
- **Unique constraints** prevent duplicate participation
- **Foreign keys** ensure valid references
- **Audit trail** via timestamps

## Monitoring and Maintenance

### Health Checks

```sql
-- Check participant count consistency
SELECT
  wp.id,
  wp.participant_count as stored_count,
  COUNT(sp.id) as actual_count
FROM habitat_watch_parties wp
LEFT JOIN stream_participants sp ON wp.id = sp.stream_id
GROUP BY wp.id, wp.participant_count
HAVING wp.participant_count != COUNT(sp.id);

-- Check host assignment consistency
SELECT stream_id, COUNT(*) as host_count
FROM stream_participants
WHERE is_host = true
GROUP BY stream_id
HAVING COUNT(*) > 1;
```

### Performance Monitoring

```sql
-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'stream_participants';

-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM streams_with_participants
WHERE is_user_participant = true;
```

## Support

For issues with this migration:

1. **Check verification script** output first
2. **Review troubleshooting section** for common issues
3. **Run health checks** to identify problems
4. **Use rollback script** if migration fails
5. **Restore from backup** as last resort
