
-- Add edit/delete columns to posts for WhatsApp-style message management
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS edited_at timestamptz DEFAULT NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_for_users uuid[] DEFAULT '{}';

-- Add indexes for high-performance queries
CREATE INDEX IF NOT EXISTS idx_posts_scope_created ON public.posts (scope_type, scope_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_reply_to ON public.posts (reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reactions_entity ON public.reactions (entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_user_pins_user_scope ON public.user_pinned_messages (user_id, forum_scope_type, forum_scope_key);

-- Enable realtime for reactions (posts already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
  END IF;
END $$;
