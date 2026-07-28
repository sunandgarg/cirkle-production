
-- Create storage bucket for story images
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stories bucket
CREATE POLICY "Anyone can view story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

CREATE POLICY "Authenticated users can upload story images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stories' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own story images"
ON storage.objects FOR DELETE
USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for nav icons (admin only)
INSERT INTO storage.buckets (id, name, public) VALUES ('nav-icons', 'nav-icons', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view nav icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'nav-icons');

CREATE POLICY "Admins can upload nav icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'nav-icons' AND auth.uid() IS NOT NULL);

-- Create nav_config table for admin-configurable nav icons
CREATE TABLE IF NOT EXISTS public.nav_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tab_key text NOT NULL UNIQUE,
  label text NOT NULL,
  icon_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.nav_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nav config"
ON public.nav_config FOR SELECT
USING (true);

CREATE POLICY "Admins can update nav config"
ON public.nav_config FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert nav config"
ON public.nav_config FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Seed default nav config
INSERT INTO public.nav_config (tab_key, label) VALUES
  ('forum', 'CIRKLE'),
  ('home', 'HOME'),
  ('network', 'MY NETWORK'),
  ('consult', 'CONSULT'),
  ('jobs', 'JOBS')
ON CONFLICT (tab_key) DO NOTHING;

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Add typing_at column to chat_members for typing indicators
ALTER TABLE public.chat_members ADD COLUMN IF NOT EXISTS typing_at timestamptz;

-- Enable realtime for chat_members (typing indicators)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;
