
-- Add read_at to messages for seen status
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at timestamptz DEFAULT NULL;

-- Add reply_to_message_id for WhatsApp-style inline replies in messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_message_id uuid DEFAULT NULL REFERENCES public.messages(id);

-- Create pinned_messages table for admin-pinned messages in forum
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  pinned_by uuid NOT NULL,
  pinned_at timestamptz NOT NULL DEFAULT now(),
  scope_type text,
  scope_key text
);
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read pinned messages" ON public.pinned_messages FOR SELECT USING (true);
CREATE POLICY "Admins can manage pinned messages" ON public.pinned_messages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create ad_messages table for admin ad placements in chat
CREATE TABLE IF NOT EXISTS public.ad_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  image_url text,
  link_url text,
  scope_type text DEFAULT 'GLOBAL',
  scope_key text DEFAULT 'IIT_ALL',
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE public.ad_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read active ads" ON public.ad_messages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage ads" ON public.ad_messages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for messages  
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
