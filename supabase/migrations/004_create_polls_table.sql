-- Create polls table with proper schema
-- This migration sets up the polls table for MoovyZoo polling functionality

-- Create polls table
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  habitat_id uuid not null references public.habitats(id) on delete cascade,
  created_by uuid not null references public.user_profiles(id) on delete cascade,
  question text not null,
  options text[] not null,
  created_at timestamptz default now(),
  expires_at timestamptz,
  is_multiple_choice boolean default false
);

-- Add check constraint for options array (must have at least 2 options)
alter table public.polls 
add constraint chk_polls_options_length 
check (array_length(options, 1) >= 2);

-- Add check constraint for expires_at (must be in the future if set)
alter table public.polls 
add constraint chk_polls_expires_at 
check (expires_at is null or expires_at > created_at);

-- Add helpful indexes for performance
create index if not exists idx_polls_habitat_id on public.polls (habitat_id);
create index if not exists idx_polls_created_by on public.polls (created_by);
create index if not exists idx_polls_created_at on public.polls (created_at desc);
create index if not exists idx_polls_expires_at on public.polls (expires_at);
create index if not exists idx_polls_habitat_created on public.polls (habitat_id, created_at desc);

-- Enable Row Level Security
alter table public.polls enable row level security;

-- RLS Policy: Users can read polls from habitats they have access to
-- For now, all habitats are public, so anyone can read polls
create policy "polls_select_public_habitats"
  on public.polls for select
  using (
    exists (
      select 1 from public.habitats 
      where habitats.id = polls.habitat_id
    )
  );

-- RLS Policy: Authenticated users can create polls
create policy "polls_insert_authenticated"
  on public.polls for insert
  to authenticated
  with check (auth.uid() is not null and created_by = auth.uid());

-- RLS Policy: Poll creators can update their own polls
create policy "polls_update_own"
  on public.polls for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- RLS Policy: Poll creators can delete their own polls
create policy "polls_delete_own"
  on public.polls for delete
  using (created_by = auth.uid());

-- RLS Policy: Habitat creators can delete any poll in their habitat
create policy "polls_delete_habitat_owner"
  on public.polls for delete
  using (
    exists (
      select 1 from public.habitats 
      where habitats.id = polls.habitat_id 
      and habitats.created_by = auth.uid()
    )
  );

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.polls to anon, authenticated;
grant insert, update, delete on public.polls to authenticated;
grant all on all sequences in schema public to anon, authenticated;
