-- Add slug column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'slug') THEN
        ALTER TABLE profiles ADD COLUMN slug text UNIQUE;
    END IF;
END $$;

-- Function to generate a slug from text
CREATE OR REPLACE FUNCTION generate_slug(name text) RETURNS text AS $$
DECLARE
    new_slug text;
    base_slug text;
    counter integer := 1;
BEGIN
    -- Convert to lowercase, replace spaces/special chars with hyphens, remove non-alphanumeric
    base_slug := lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    
    -- If slug is empty (e.g. name was only special chars), fallback to 'user'
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'user';
    END IF;

    new_slug := base_slug;

    -- Check for conflicts and append number if necessary
    WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = new_slug) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set slug on insert/update if not provided
CREATE OR REPLACE FUNCTION set_profile_slug() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        IF NEW.full_name IS NOT NULL THEN
             -- Check conflict with existing ID to avoid recursion issues if needed for complex logic, 
             -- but here we just check uniqueness against table in generate_slug
             NEW.slug := generate_slug(NEW.full_name);
        ELSE
             NEW.slug := generate_slug('user');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_profile_slug ON profiles;
CREATE TRIGGER ensure_profile_slug
    BEFORE INSERT OR UPDATE OF full_name ON profiles
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION set_profile_slug();

-- Backfill existing profiles
UPDATE profiles SET slug = generate_slug(full_name) WHERE slug IS NULL;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);
