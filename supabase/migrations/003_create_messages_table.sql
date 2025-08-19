-- Create messages table with proper schema
-- This migration sets up the messages table for MoovyZoo chat functionality

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

-- Create function to automatically update updated_at timestamp
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

-- Add helpful indexes for performance
create index if not exists idx_messages_habitat_id on public.messages (habitat_id);
create index if not exists idx_messages_user_id on public.messages (user_id);
create index if not exists idx_messages_created_at on public.messages (created_at desc);
create index if not exists idx_messages_reply_to on public.messages (reply_to);
create index if not exists idx_messages_type on public.messages (message_type);
create index if not exists idx_messages_habitat_created on public.messages (habitat_id, created_at desc);

-- Enable Row Level Security
alter table public.messages enable row level security;

-- RLS Policy: Users can read messages from habitats they have access to
-- For now, all habitats are public, so anyone can read messages
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

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.messages to anon, authenticated;
grant insert, update, delete on public.messages to authenticated;
grant all on all sequences in schema public to anon, authenticated;
