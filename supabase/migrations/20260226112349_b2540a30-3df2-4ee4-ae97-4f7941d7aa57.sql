
-- Add file attachment columns to posts table
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS voice_url TEXT,
  ADD COLUMN IF NOT EXISTS voice_duration INTEGER;

-- Create forum-files storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('forum-files', 'forum-files', true, 26214400)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for forum-files
CREATE POLICY "Authenticated users can upload forum files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'forum-files');

CREATE POLICY "Anyone can read forum files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'forum-files');

CREATE POLICY "Users can delete own forum files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'forum-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create voice-notes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('voice-notes', 'voice-notes', true, 10485760)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload voice notes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'voice-notes');

CREATE POLICY "Anyone can read voice notes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'voice-notes');
