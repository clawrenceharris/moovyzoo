-- MoovyZoo UserProfiles Table Setup for Supabase Cloud
-- Copy and paste this entire script into your Supabase project's SQL Editor

-- Create user_profiles table with proper schema
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

-- Create habitats table
create table if not exists public.habitats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tags text[] default '{}',
  created_at timestamptz default now(),
  description text,
  created_by uuid not null references public.user_profiles(id) on delete cascade,
  banner_url text
);

-- Add helpful indexes for habitats performance
create index if not exists idx_habitats_created_by on public.habitats (created_by);
create index if not exists idx_habitats_name on public.habitats (name);
create index if not exists idx_habitats_created_at on public.habitats (created_at desc);
create index if not exists idx_habitats_tags on public.habitats using gin(tags);

-- Enable Row Level Security for habitats
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

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  habitat_id uuid not null references public.habitats(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  message_type text default 'text',
  media_url text,
  reply_to uuid references public.messages(id) on delete set null
);

-- Add check constraint for message_type
alter table public.messages 
add constraint chk_message_type 
check (message_type in ('text', 'poll', 'meme', 'system'));

-- Create function to automatically update updated_at timestamp for messages
create or replace function public.set_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at on message updates
drop trigger if exists trg_messages_updated_at on public.messages;
create trigger trg_messages_updated_at
  before update on public.messages
  for each row execute function public.set_messages_updated_at();

-- Add helpful indexes for messages performance
create index if not exists idx_messages_habitat_id on public.messages (habitat_id);
create index if not exists idx_messages_user_id on public.messages (user_id);
create index if not exists idx_messages_created_at on public.messages (created_at desc);
create index if not exists idx_messages_reply_to on public.messages (reply_to);
create index if not exists idx_messages_type on public.messages (message_type);
create index if not exists idx_messages_habitat_created on public.messages (habitat_id, created_at desc);

-- Enable Row Level Security for messages
alter table public.messages enable row level security;

-- RLS Policy: Users can read messages from habitats they have access to
create policy "messages_select_public_habitats"
  on public.messages for select
  using (
    exists (
      select 1 from public.habitats 
      where habitats.id = messages.habitat_id
    )
  );

-- RLS Policy: Authenticated users can insert messages
create policy "messages_insert_authenticated"
  on public.messages for insert
  to authenticated
  with check (auth.uid() is not null and user_id = auth.uid());

-- RLS Policy: Users can update their own messages
create policy "messages_update_own"
  on public.messages for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS Policy: Users can delete their own messages
create policy "messages_delete_own"
  on public.messages for delete
  using (user_id = auth.uid());

-- RLS Policy: Habitat creators can delete any message in their habitat
create policy "messages_delete_habitat_owner"
  on public.messages for delete
  using (
    exists (
      select 1 from public.habitats 
      where habitats.id = messages.habitat_id 
      and habitats.created_by = auth.uid()
    )
  );

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

-- Add helpful indexes for polls performance
create index if not exists idx_polls_habitat_id on public.polls (habitat_id);
create index if not exists idx_polls_created_by on public.polls (created_by);
create index if not exists idx_polls_created_at on public.polls (created_at desc);
create index if not exists idx_polls_expires_at on public.polls (expires_at);
create index if not exists idx_polls_habitat_created on public.polls (habitat_id, created_at desc);

-- Enable Row Level Security for polls
alter table public.polls enable row level security;

-- RLS Policy: Users can read polls from habitats they have access to
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

-- Add helpful indexes for poll_votes performance
create index if not exists idx_poll_votes_poll_id on public.poll_votes (poll_id);
create index if not exists idx_poll_votes_user_id on public.poll_votes (user_id);
create index if not exists idx_poll_votes_created_at on public.poll_votes (created_at desc);
create index if not exists idx_poll_votes_poll_user on public.poll_votes (poll_id, user_id);
create index if not exists idx_poll_votes_poll_option on public.poll_votes (poll_id, option_index);

-- Enable Row Level Security for poll_votes
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
grant all on public.user_profiles to anon, authenticated;
grant select on public.habitats to anon, authenticated;
grant insert, update, delete on public.habitats to authenticated;
grant select on public.messages to anon, authenticated;
grant insert, update, delete on public.messages to authenticated;
grant select on public.polls to anon, authenticated;
grant insert, update, delete on public.polls to authenticated;
grant select on public.poll_votes to anon, authenticated;
grant insert, delete on public.poll_votes to authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- Verification queries (optional - run these to verify setup)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name in ('user_profiles', 'habitats', 'messages', 'polls', 'poll_votes');
-- SELECT * FROM pg_policies WHERE tablename in ('user_profiles', 'habitats', 'messages', 'polls', 'poll_votes');
-- SELECT indexname FROM pg_indexes WHERE tablename in ('user_profiles', 'habitats', 'messages', 'polls', 'poll_votes');