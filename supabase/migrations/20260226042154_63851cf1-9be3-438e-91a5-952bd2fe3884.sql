
-- 1. Add message status enum-like column to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent';

-- 2. Create user_pinned_messages table (per-user pinned messages)
CREATE TABLE IF NOT EXISTS public.user_pinned_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  forum_scope_type text NOT NULL DEFAULT 'GLOBAL',
  forum_scope_key text NOT NULL DEFAULT 'IIT_ALL',
  pinned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE public.user_pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pins" ON public.user_pinned_messages
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_scope ON public.posts(scope_type, scope_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_reply_to ON public.posts(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_reactions_entity ON public.reactions(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(room_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_pinned_scope ON public.user_pinned_messages(user_id, forum_scope_type, forum_scope_key);

-- 4. Enable realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
