-- Story Genie database schema (run in Supabase SQL Editor)

-- Profiles (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- Stories (one row per generated story)
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  child_name text not null,
  child_age int not null,
  events text not null,
  theme text not null,
  story_length text not null,
  title text not null,
  narrative_voice text not null default 'Classic',
  created_at timestamptz not null default now()
);

-- Story pages (one row per paragraph + illustration)
create table if not exists public.story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  page_number int not null,
  paragraph_text text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  unique (story_id, page_number)
);

-- Automatically create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.story_pages enable row level security;

-- Profiles: users can see and update only their own profile.
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- Stories: parents can only access their own stories.
create policy "stories_select_own"
on public.stories for select
using (auth.uid() = parent_id);

create policy "stories_insert_own"
on public.stories for insert
with check (auth.uid() = parent_id);

create policy "stories_update_own"
on public.stories for update
using (auth.uid() = parent_id);

create policy "stories_delete_own"
on public.stories for delete
using (auth.uid() = parent_id);

-- Story pages: access is controlled via the parent story.
create policy "story_pages_select_own"
on public.story_pages for select
using (
  exists (
    select 1
    from public.stories s
    where s.id = story_pages.story_id
      and s.parent_id = auth.uid()
  )
);

create policy "story_pages_insert_own"
on public.story_pages for insert
with check (
  exists (
    select 1
    from public.stories s
    where s.id = story_pages.story_id
      and s.parent_id = auth.uid()
  )
);

create policy "story_pages_delete_own"
on public.story_pages for delete
using (
  exists (
    select 1
    from public.stories s
    where s.id = story_pages.story_id
      and s.parent_id = auth.uid()
  )
);

