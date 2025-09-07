# Habitats Dashboard Migration

This directory contains the database migration scripts for implementing the habitats dashboard architecture.

## Overview

The dashboard migration adds new tables and schema changes to support:

- Discussion rooms (chat rooms within habitats)
- Polls for community engagement
- Watch streams for synchronized viewing
- Enhanced message system with discussion room support

## Migration Files

### Core Migration

- **`habitats-dashboard-migration.sql`** - Main migration script that creates new tables, indexes, and policies

### Verification & Maintenance

- **`verify-dashboard-migration.sql`** - Verification script to check migration success
- **`rollback-dashboard-migration.sql`** - Rollback script to revert changes if needed
- **`dashboard-migration-README.md`** - This documentation file

## Prerequisites

1. The base habitats schema must be applied first (`habitats-schema.sql`)
2. Supabase project with authentication enabled
3. User profiles table must exist (referenced by foreign keys)

## Migration Steps

### 1. Apply the Migration

Run the main migration script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of habitats-dashboard-migration.sql
```

### 2. Verify the Migration

Run the verification script to ensure everything was created correctly:

```sql
-- Copy and paste the contents of verify-dashboard-migration.sql
```

Expected results:

- 3 new tables: `habitat_discussions`, `habitat_polls`, `habitat_watch_parties`
- `chat_id` column added to `habitat_messages`
- Multiple indexes created for query performance
- RLS policies applied to all new tables
- 3 new views for dashboard data aggregation

### 3. Test Basic Functionality

The verification script includes basic functionality tests. All count queries should return 0 initially (no data yet).

## New Database Schema

### Tables Added

#### `habitat_discussions`

- Discussion rooms/chat rooms within habitats
- Each habitat can have multiple discussion topics
- Messages are linked to specific discussions via `chat_id`

#### `habitat_polls`

- Community polls within habitats
- JSON options field for flexible poll structures
- Active/inactive status for poll management

#### `habitat_watch_parties`

- Scheduled streaming sessions for synchronized viewing
- Participant tracking and limits
- Time-based scheduling with future date constraints

### Schema Changes

#### `habitat_messages` Table

- Added `chat_id` column (nullable, references `habitat_discussions.id`)
- Updated RLS policies to support discussion-specific messaging
- New indexes for efficient chat room queries

## Views Created

### `habitat_dashboard_data`

Aggregates dashboard statistics for each habitat:

- Active discussion count
- Active poll count
- Upcoming streaming session count

### `popular_habitat_discussions`

Shows discussions ordered by recent activity:

- Message count per discussion
- Last activity timestamp
- Only active discussions

### `upcoming_watch_parties`

Shows future streaming sessions ordered by scheduled time:

- Only active streaming sessions
- Only future events (scheduled_time > NOW())

## Security (RLS Policies)

All new tables have Row Level Security enabled with policies that:

- Allow users to view content in habitats they're members of
- Allow users to create content in habitats they're members of
- Allow users to modify/delete their own content
- Prevent unauthorized access to private habitat content

## Performance Considerations

### Indexes Created

- Habitat-based queries: `habitat_id` indexes on all tables
- Time-based queries: `created_at` and `scheduled_time` indexes
- User-based queries: `created_by` indexes
- Chat-specific queries: `chat_id` indexes on messages

### Query Optimization

- Views use LEFT JOINs with COUNT aggregations for dashboard data
- Composite indexes for common query patterns
- Proper foreign key constraints for referential integrity

## Rollback Process

If you need to revert the migration:

1. **Backup Data**: Export any important data from new tables
2. **Run Rollback**: Execute `rollback-dashboard-migration.sql`
3. **Verify**: Check that original schema is restored

⚠️ **Warning**: Rollback will permanently delete all data in the new tables.

## Troubleshooting

### Common Issues

1. **Foreign Key Errors**: Ensure `profiles` table exists and has correct structure
2. **Permission Errors**: Verify you have sufficient database privileges
3. **RLS Policy Conflicts**: Check for existing policies with same names

### Verification Failures

If verification queries fail:

1. Check Supabase logs for error details
2. Verify all prerequisite tables exist
3. Ensure migration script ran completely without errors
4. Check user permissions and RLS policy setup

## Next Steps

After successful migration:

1. Update application code to use new schema
2. Implement repository methods for new tables
3. Create UI components for dashboard features
4. Test real-time functionality with new discussion rooms
5. Implement data seeding for development/testing

## Support

For issues with this migration:

1. Check the verification script output
2. Review Supabase logs for detailed error messages
3. Ensure all prerequisites are met
4. Consider running rollback and re-applying if needed
