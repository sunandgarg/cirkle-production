
-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID NOT NULL,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Everyone can read published blogs
CREATE POLICY "Anyone can read published blogs" ON public.blogs FOR SELECT USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage blogs" ON public.blogs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ensure super admin role for 8700602524 (Sunand Garg)
-- We'll handle this in app code since we need the auth user id

-- Add realtime for blogs
ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;
