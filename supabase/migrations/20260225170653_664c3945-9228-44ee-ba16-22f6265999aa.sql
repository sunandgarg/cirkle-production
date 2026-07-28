
-- Create saved_views table for user-saved forum scopes
CREATE TABLE public.saved_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  scope_type TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  filters_json JSONB DEFAULT '{}'::jsonb,
  sort TEXT DEFAULT 'newest',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved views"
  ON public.saved_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved views"
  ON public.saved_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved views"
  ON public.saved_views FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved views"
  ON public.saved_views FOR DELETE
  USING (auth.uid() = user_id);

-- Add pinned_at to posts for scope-aware pinning
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add scope_type and scope_key to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scope_type TEXT DEFAULT NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scope_key TEXT DEFAULT NULL;

-- Add tags array to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- Index for fast scope queries
CREATE INDEX IF NOT EXISTS idx_posts_scope ON public.posts (scope_type, scope_key);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON public.posts (pinned_at) WHERE pinned_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_saved_views_user ON public.saved_views (user_id);
