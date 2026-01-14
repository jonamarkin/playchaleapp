-- Create a table for public profiles using Supabase's auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  level text,
  sports text[],
  onboarding_completed boolean default false,
  attributes jsonb default '{}'::jsonb,

  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Sport Stats (JSONB variant approach)
create table public.user_sport_stats (
    user_id uuid references public.profiles(id) on delete cascade,
    sport text not null,
    stats jsonb not null default '{}'::jsonb,
    primary key (user_id, sport)
);

alter table public.user_sport_stats enable row level security;

create policy "Sport stats viewable by everyone"
    on public.user_sport_stats for select
    using (true);

create policy "Users can update their own stats"
    on public.user_sport_stats for all
    using (auth.uid() = user_id);

-- Games
create table public.games (
    id text primary key, -- Keeping as text to support legacy 'g1' style IDs during migration, switch to uuid later
    organizer_id uuid references public.profiles(id),
    title text not null,
    sport text not null,
    status text check (status in ('upcoming', 'ongoing', 'completed')),
    location text,
    time text,
    date text,
    max_participants int,
    spots_taken int default 0,
    price text,
    image_url text,
    skill_level text,
    created_at timestamptz default now()
);

alter table public.games enable row level security;

create policy "Games viewable by everyone"
    on public.games for select
    using (true);

create policy "Authenticated users can create games"
    on public.games for insert
    with check (auth.role() = 'authenticated');
