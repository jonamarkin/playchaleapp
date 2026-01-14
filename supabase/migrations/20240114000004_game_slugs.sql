-- Add slug field to games table for public-facing URLs
-- Slugs are URL-friendly identifiers that hide raw database IDs

-- Add slug column to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);

-- Function to generate a URL-friendly slug from title
CREATE OR REPLACE FUNCTION generate_game_slug(title TEXT, game_id TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INT := 0;
BEGIN
    -- Convert title to lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Add a short unique suffix from the game ID
    final_slug := base_slug || '-' || substring(game_id::TEXT from 1 for 8);
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing games to have slugs
UPDATE public.games 
SET slug = generate_game_slug(title, id)
WHERE slug IS NULL;

-- Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_game_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_game_slug(NEW.title, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_game_slug ON public.games;
CREATE TRIGGER trigger_auto_game_slug
    BEFORE INSERT ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_game_slug();
