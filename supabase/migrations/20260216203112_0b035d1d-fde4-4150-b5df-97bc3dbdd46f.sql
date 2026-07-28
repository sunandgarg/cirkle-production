
-- Add mentor fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentor_price_chat INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentor_price_audio INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentor_price_video INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentor_category TEXT;

-- Add experience_level and category to jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS category TEXT;
