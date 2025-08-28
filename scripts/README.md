# Database Migration Scripts

This directory contains SQL migration scripts for setting up the Zoovie database schema in Supabase.

## Files

- `habitats-schema.sql` - Creates the complete habitats feature database schema
- `verify-habitats-schema.sql` - Verifies that the habitats schema was created correctly
- `verify-database.sql` - General database verification script

## Usage

### Setting up Habitats Schema

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `habitats-schema.sql`
4. Run the script to create all tables, indexes, triggers, and RLS policies

### Verifying the Setup

After running the migration, use the verification script:

1. In the Supabase SQL Editor, copy and paste the contents of `verify-habitats-schema.sql`
2. Run the script to check that all tables, indexes, and policies were created correctly
3. Review the output to ensure everything is set up properly

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
