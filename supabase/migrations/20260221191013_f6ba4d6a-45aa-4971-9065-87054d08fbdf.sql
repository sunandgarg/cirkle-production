
-- Add slug columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug_updated_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_education_id uuid REFERENCES public.education(id) ON DELETE SET NULL;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- Function to generate a profile slug
CREATE OR REPLACE FUNCTION public.generate_profile_slug(p_name text, p_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  base_slug text;
  final_slug text;
  random_suffix text;
  counter int := 0;
BEGIN
  -- Convert name to lowercase, remove special chars, replace spaces with hyphens
  base_slug := lower(regexp_replace(trim(COALESCE(p_name, 'user')), '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(base_slug, '-');
  IF base_slug = '' THEN base_slug := 'user'; END IF;

  -- Generate 5-digit random suffix
  random_suffix := lpad(floor(random() * 100000)::text, 5, '0');
  final_slug := base_slug || '-' || random_suffix;

  -- Check uniqueness, regenerate if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug AND user_id != p_user_id) LOOP
    counter := counter + 1;
    random_suffix := lpad(floor(random() * 100000)::text, 5, '0');
    final_slug := base_slug || '-' || random_suffix;
    IF counter > 20 THEN
      final_slug := base_slug || '-' || left(replace(p_user_id::text, '-', ''), 8);
      EXIT;
    END IF;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- Trigger function to auto-set slug on insert or name update (only if slug is NULL)
CREATE OR REPLACE FUNCTION public.set_profile_slug()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.slug IS NULL AND NEW.name IS NOT NULL THEN
    NEW.slug := public.generate_profile_slug(NEW.name, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_set_profile_slug ON public.profiles;
CREATE TRIGGER trg_set_profile_slug
  BEFORE INSERT OR UPDATE OF name ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_slug();

-- Backfill existing profiles with slugs
UPDATE public.profiles
SET slug = public.generate_profile_slug(COALESCE(name, 'user'), user_id)
WHERE slug IS NULL;
