-- Create user_profiles table with proper schema
-- This migration sets up the core user_profiles table for MoovyZoo auth system

-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  bio text,
  favorite_genres text[] default '{}',
  favorite_titles text[] default '{}',
  is_public boolean default true,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add helpful indexes for performance
create index if not exists idx_profiles_public on public.user_profiles (is_public);
create index if not exists idx_profiles_display_name on public.user_profiles (display_name);
create index if not exists idx_profiles_email on public.user_profiles (email);
create index if not exists idx_profiles_onboarding on public.user_profiles (onboarding_completed);

-- Create function to automatically update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at on profile updates
drop trigger if exists trg_profiles_updated_at on public.user_profiles;
create trigger trg_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- RLS Policy: Users can select their own profile
create policy "profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = id);

-- RLS Policy: Users can select public profiles of other users
create policy "profiles_select_public"
  on public.user_profiles for select
  using (is_public = true);

-- RLS Policy: Users can insert their own profile
create policy "profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- RLS Policy: Users can update their own profile
create policy "profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policy: Users cannot delete profiles (handled by auth cascade)
-- No delete policy needed as deletion is handled by auth.users cascade

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.user_profiles to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;