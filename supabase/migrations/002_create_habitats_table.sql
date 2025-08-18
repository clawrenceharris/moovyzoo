-- Create habitats table with proper schema
-- This migration sets up the habitats table for MoovyZoo group chat functionality

-- Create habitats table
create table if not exists public.habitats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tags text[] default '{}',
  created_at timestamptz default now(),
  description text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  banner_url text
);

-- Add helpful indexes for performance
create index if not exists idx_habitats_created_by on public.habitats (created_by);
create index if not exists idx_habitats_name on public.habitats (name);
create index if not exists idx_habitats_created_at on public.habitats (created_at desc);
create index if not exists idx_habitats_tags on public.habitats using gin(tags);

-- Enable Row Level Security
alter table public.habitats enable row level security;

-- RLS Policy: Anyone can read public habitats (all habitats are public for now)
create policy "habitats_select_all"
  on public.habitats for select
  using (true);

-- RLS Policy: Authenticated users can create habitats
create policy "habitats_insert_authenticated"
  on public.habitats for insert
  to authenticated
  with check (auth.uid() is not null);

-- RLS Policy: Habitat creators can update their own habitats
create policy "habitats_update_own"
  on public.habitats for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- RLS Policy: Habitat creators can delete their own habitats
create policy "habitats_delete_own"
  on public.habitats for delete
  using (created_by = auth.uid());

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.habitats to anon, authenticated;
grant insert, update, delete on public.habitats to authenticated;
grant all on all sequences in schema public to anon, authenticated;
