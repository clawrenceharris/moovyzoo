# Database Migration Scripts

This directory contains SQL migration scripts for setting up the Zoovie database schema in Supabase.

## Files

### Habitats Feature
- `habitats-schema.sql` - Creates the complete habitats feature database schema
- `verify-habitats-schema.sql` - Verifies that the habitats schema was created correctly

### Friends Discovery Feature
- `friends-discovery-migration.sql` - Creates friends and watch_history tables with RLS policies
- `verify-friends-discovery-migration.sql` - Verifies the friends discovery migration
- `rollback-friends-discovery-migration.sql` - Rollback script for friends discovery
- `friends-discovery-migration-README.md` - Detailed documentation for friends discovery migration

### Watch Party Media Integration
- `watch-party-media-integration-migration.sql` - Adds TMDB media integration to watch parties
- `verify-media-integration-migration.sql` - Verifies media integration migration
- `rollback-media-integration-migration.sql` - Rollback script for media integration
- `media-integration-migration-README.md` - Documentation for media integration

### Dashboard Migration
- `habitats-dashboard-migration.sql` - Dashboard-related database changes
- `verify-dashboard-migration.sql` - Verifies dashboard migration
- `rollback-dashboard-migration.sql` - Rollback script for dashboard changes
- `dashboard-migration-README.md` - Documentation for dashboard migration

### General
- `verify-database.sql` - General database verification script
- `run-migrations.md` - Guide for running migrations in order

## Usage

### Running Migrations

For detailed migration instructions, see `run-migrations.md` or the individual README files for each feature.

**Quick Start:**
1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run migrations in the recommended order (see `run-migrations.md`)
4. Use verification scripts to ensure successful setup

### Feature-Specific Setup

- **Habitats**: Run `habitats-schema.sql` then verify with `verify-habitats-schema.sql`
- **Friends Discovery**: Run `friends-discovery-migration.sql` then verify with `verify-friends-discovery-migration.sql`
- **Media Integration**: Run `watch-party-media-integration-migration.sql` after habitats setup
- **Dashboard**: Run `habitats-dashboard-migration.sql` for dashboard enhancements

## Schema Overview

### Tables Created

1. **habitats** - Main habitats table with basic information

   - `id` (UUID, Primary Key)
   - `name` (VARCHAR(100), NOT NULL)
   - `description` (TEXT)
   - `tags` (TEXT[])
   - `is_public` (BOOLEAN, default true)
   - `created_by` (UUID, references profiles)
   - `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)
   - `banner_url` (TEXT)
   - `member_count` (INTEGER, default 0)

2. **habitat_members** - Junction table for user-habitat relationships

   - `habitat_id` (UUID, references habitats)
   - `user_id` (UUID, references profiles)
   - `joined_at`, `last_active` (TIMESTAMP WITH TIME ZONE)
   - Composite primary key on (habitat_id, user_id)

3. **habitat_messages** - Chat messages within habitats
   - `id` (UUID, Primary Key)
   - `habitat_id` (UUID, references habitats)
   - `user_id` (UUID, references profiles)
   - `content` (TEXT, NOT NULL, max 1000 chars)
   - `created_at` (TIMESTAMP WITH TIME ZONE)

### Features

- **Row Level Security (RLS)** enabled on all tables with appropriate policies
- **Automatic triggers** for updating `updated_at` timestamps and member counts
- **Performance indexes** on commonly queried columns
- **Data constraints** for data integrity
- **Cascade deletes** to maintain referential integrity
- **user_habitats view** for easy querying of user's habitats with membership info

### Security Policies

- Users can only view public habitats or habitats they're members of
- Users can only send messages to habitats they've joined
- Users can only update/delete their own content
- Habitat creators have full control over their habitats

## Notes

- The schema assumes a `profiles` table exists (from the auth system)
- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- The `member_count` field is automatically maintained by triggers
- Message content is limited to 1000 characters
- The schema is designed to work with Supabase's built-in auth system (`auth.uid()`)
