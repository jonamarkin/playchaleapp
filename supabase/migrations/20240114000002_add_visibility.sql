-- Add visibility column to games table
alter table public.games 
add column visibility text default 'public' check (visibility in ('public', 'private'));

-- Update RLS policies to respect visibility?
-- Actually, for now, we just want to filter them from the feed ("Discover" query).
-- Access via ID (Link) should still be allowed given the RLS "Games viewable by everyone" policy exists.
-- If true privacy is needed (cannot view even with link unless invited), we'd need tighter RLS.
-- User just said "link to people they want to join", which implies "Unlisted" behavior.
-- So "Games viewable by everyone" is fine for now, we just filter the SELECT query on the client/frontend.
