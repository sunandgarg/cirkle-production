
-- Add seen_by tracking to posts for read receipts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seen_by uuid[] DEFAULT '{}'::uuid[];

-- Enable realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
