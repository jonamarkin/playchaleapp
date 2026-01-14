create table public.game_participants (
    id uuid default gen_random_uuid() primary key,
    game_id text references public.games(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    joined_at timestamptz default now(),
    status text default 'confirmed',
    unique(game_id, user_id)
);

alter table public.game_participants enable row level security;

create policy "Participants viewable by everyone"
    on public.game_participants for select
    using (true);

create policy "Authenticated users can join"
    on public.game_participants for insert
    with check (auth.uid() = user_id);

create policy "Users can leave"
    on public.game_participants for delete
    using (auth.uid() = user_id);
