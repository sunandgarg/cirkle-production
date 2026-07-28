
-- Priority 2: Add channel columns to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'global';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS campus_filter TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS cohort_filter TEXT;

-- Priority 5: Create verification_codes table
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (edge function uses service role, but allow anon for flexibility)
CREATE POLICY "Anyone can insert verification codes"
  ON public.verification_codes FOR INSERT
  WITH CHECK (true);

-- Anyone can read (to verify codes)
CREATE POLICY "Anyone can read verification codes"
  ON public.verification_codes FOR SELECT
  USING (true);

-- Anyone can update (mark as used)
CREATE POLICY "Anyone can update verification codes"
  ON public.verification_codes FOR UPDATE
  USING (true);
