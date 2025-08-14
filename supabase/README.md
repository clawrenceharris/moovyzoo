# MoovyZoo Database Setup

This directory contains the Supabase database schema, migrations, and configuration for the MoovyZoo application.

## Quick Start

### Option 1: Supabase Cloud (Recommended)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the setup SQL**:

   - Copy the contents of `supabase/setup-cloud.sql`
   - Paste it into your Supabase project's SQL Editor
   - Click "Run" to execute

3. **Update your environment variables**:
   - Go to Project Settings > API in your Supabase dashboard
   - Copy the Project URL and anon public key to your `.env` file

### Option 2: Local Development

1. **Install Docker Desktop** and ensure it's running

2. **Install Supabase CLI**:

   ```bash
   npm install -g supabase
   ```

3. **Run the setup script**:

   ```bash
   ./scripts/setup-database.sh
   ```

4. **Update your environment variables**:
   ```bash
   supabase status
   ```
   Copy the API URL and anon key to your `.env` file.

## Database Schema

### Profiles Table

The `profiles` table stores user profile information and preferences:

| Column                 | Type          | Description                              |
| ---------------------- | ------------- | ---------------------------------------- |
| `id`                   | `uuid`        | Primary key, references `auth.users(id)` |
| `email`                | `text`        | User's email address                     |
| `display_name`         | `text`        | User's display name                      |
| `avatar_url`           | `text`        | Optional avatar image URL                |
| `bio`                  | `text`        | Optional user bio                        |
| `favorite_genres`      | `text[]`      | Array of favorite movie/TV genres        |
| `favorite_titles`      | `text[]`      | Array of favorite movies/shows           |
| `is_public`            | `boolean`     | Whether profile is publicly visible      |
| `onboarding_completed` | `boolean`     | Whether user completed onboarding        |
| `created_at`           | `timestamptz` | Profile creation timestamp               |
| `updated_at`           | `timestamptz` | Last update timestamp                    |

### Row Level Security (RLS) Policies

The following RLS policies are implemented:

1. **profiles_select_own**: Users can read their own profile
2. **profiles_select_public**: Users can read public profiles of others
3. **profiles_insert_own**: Users can create their own profile
4. **profiles_update_own**: Users can update their own profile

### Indexes

Performance indexes are created on:

- `is_public` - for filtering public profiles
- `display_name` - for searching users
- `email` - for user lookups
- `onboarding_completed` - for filtering onboarded users

### Triggers

- **set_updated_at**: Automatically updates `updated_at` timestamp on profile changes

## Manual Setup (Alternative)

If you prefer to set up manually:

1. **Initialize Supabase project**:

   ```bash
   supabase init
   ```

2. **Start local Supabase**:

   ```bash
   supabase start
   ```

3. **Apply migrations**:

   ```bash
   supabase db reset
   ```

4. **Generate TypeScript types** (optional):
   ```bash
   supabase gen types typescript --local > src/types/supabase.ts
   ```

## Production Deployment

For production deployment:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Link your local project**:

   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Push migrations to production**:

   ```bash
   supabase db push
   ```

4. **Update environment variables** with production credentials

## Testing the Setup

You can test the database setup by:

1. **Accessing Supabase Studio**: http://localhost:54323
2. **Viewing the profiles table** in the Table Editor
3. **Testing RLS policies** in the SQL Editor
4. **Running the application** and creating a test user

## Troubleshooting

### Common Issues

- **Port conflicts**: If ports are in use, stop other services or modify `supabase/config.toml`
- **Permission errors**: Ensure the setup script is executable: `chmod +x scripts/setup-database.sh`
- **Migration errors**: Check the migration SQL syntax and ensure Supabase is running

### Useful Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Stop Supabase
supabase stop

# Reset database (careful - this deletes all data)
supabase db reset

# Generate new migration
supabase migration new migration_name
```

## Security Considerations

- RLS policies ensure users can only access appropriate data
- The `auth.users` table is managed by Supabase Auth
- Profile deletion is handled automatically via foreign key cascade
- All database operations require authentication (except public profile reads)

## Next Steps

After setting up the database:

1. Implement the Supabase client configuration
2. Create the profile management hooks and utilities
3. Build the authentication components
4. Test the complete auth flow
