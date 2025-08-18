-- Create poll_votes table with proper schema
-- This migration sets up the poll_votes table for MoovyZoo polling functionality

-- Create poll_votes table
create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  option_index int not null,
  created_at timestamptz default now()
);

-- Add check constraint for option_index (must be non-negative)
alter table public.poll_votes 
add constraint chk_poll_votes_option_index 
check (option_index >= 0);

-- Create a function to validate voting constraints
create or replace function public.validate_poll_vote()
returns trigger as $$
declare
  poll_is_multiple_choice boolean;
  poll_options_count int;
begin
  -- Get poll details
  select is_multiple_choice, array_length(options, 1)
  into poll_is_multiple_choice, poll_options_count
  from public.polls
  where id = new.poll_id;

  -- Check if option_index is valid for this poll
  if new.option_index >= poll_options_count then
    raise exception 'Invalid option_index: % (poll has % options)', new.option_index, poll_options_count;
  end if;

  -- If poll is NOT multiple choice, check for existing votes from this user
  if not poll_is_multiple_choice then
    if exists (
      select 1 from public.poll_votes 
      where poll_id = new.poll_id 
      and user_id = new.user_id
    ) then
      raise exception 'User has already voted on this single-choice poll';
    end if;
  else
    -- If poll IS multiple choice, check for duplicate option votes
    if exists (
      select 1 from public.poll_votes 
      where poll_id = new.poll_id 
      and user_id = new.user_id 
      and option_index = new.option_index
    ) then
      raise exception 'User has already voted for this option';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- Create trigger to validate votes before insert
create trigger trg_validate_poll_vote
  before insert on public.poll_votes
  for each row execute function public.validate_poll_vote();

-- Add helpful indexes for performance
create index if not exists idx_poll_votes_poll_id on public.poll_votes (poll_id);
create index if not exists idx_poll_votes_user_id on public.poll_votes (user_id);
create index if not exists idx_poll_votes_created_at on public.poll_votes (created_at desc);
create index if not exists idx_poll_votes_poll_user on public.poll_votes (poll_id, user_id);
create index if not exists idx_poll_votes_poll_option on public.poll_votes (poll_id, option_index);

-- Create unique index for single-choice polls (conditional)
-- This will be enforced by the trigger function instead of a constraint
-- to handle the multiple choice scenario properly

-- Enable Row Level Security
alter table public.poll_votes enable row level security;

-- RLS Policy: Users can read votes for polls in habitats they have access to
create policy "poll_votes_select_public_habitats"
  on public.poll_votes for select
  using (
    exists (
      select 1 from public.polls p
      join public.habitats h on h.id = p.habitat_id
      where p.id = poll_votes.poll_id
    )
  );

-- RLS Policy: Authenticated users can insert votes
create policy "poll_votes_insert_authenticated"
  on public.poll_votes for insert
  to authenticated
  with check (auth.uid() is not null and user_id = auth.uid());

-- RLS Policy: Users can delete their own votes (for changing votes)
create policy "poll_votes_delete_own"
  on public.poll_votes for delete
  using (user_id = auth.uid());

-- RLS Policy: Poll creators can delete any vote on their polls
create policy "poll_votes_delete_poll_creator"
  on public.poll_votes for delete
  using (
    exists (
      select 1 from public.polls 
      where polls.id = poll_votes.poll_id 
      and polls.created_by = auth.uid()
    )
  );

-- RLS Policy: Habitat creators can delete any vote in their habitat
create policy "poll_votes_delete_habitat_owner"
  on public.poll_votes for delete
  using (
    exists (
      select 1 from public.polls p
      join public.habitats h on h.id = p.habitat_id
      where p.id = poll_votes.poll_id 
      and h.created_by = auth.uid()
    )
  );

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.poll_votes to anon, authenticated;
grant insert, delete on public.poll_votes to authenticated;
grant all on all sequences in schema public to anon, authenticated;
