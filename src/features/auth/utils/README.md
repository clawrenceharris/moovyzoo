# Auth Utils - Supabase Configuration

## Setup Instructions

1. **Create a Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure Environment Variables**

   - Copy `.env.local.example` to `.env`
   - Replace the placeholder values with your actual Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```

3. **Database Setup**
   - The database schema will be created in task 2
   - Row Level Security (RLS) policies will be configured

## Files Overview

- `supabase.ts` - Main Supabase client configuration
- `env.ts` - Environment variable validation and helpers
- `firebase.ts` - Legacy Firebase utilities (will be removed)

## Migration Status

- ✅ Supabase client configured
- ✅ Environment variables set up
- ⏳ Database schema (next task)
- ⏳ Auth utilities migration (task 4)
- ⏳ Hook updates (task 5)
