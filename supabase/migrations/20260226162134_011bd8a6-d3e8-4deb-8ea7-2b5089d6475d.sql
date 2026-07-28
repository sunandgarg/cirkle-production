
-- Add delete tracking columns to posts
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS is_deleted_for_everyone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_by_user_id uuid;

-- Create message_deleted_for_user table for per-user deletes
CREATE TABLE public.message_deleted_for_user (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create index for fast lookups
CREATE INDEX idx_message_deleted_for_user_user ON public.message_deleted_for_user(user_id);
CREATE INDEX idx_message_deleted_for_user_message ON public.message_deleted_for_user(message_id);

-- Enable RLS
ALTER TABLE public.message_deleted_for_user ENABLE ROW LEVEL SECURITY;

-- Users can insert their own delete records
CREATE POLICY "Users can delete messages for themselves"
  ON public.message_deleted_for_user FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own delete records
CREATE POLICY "Users can read own deleted messages"
  ON public.message_deleted_for_user FOR SELECT
  USING (auth.uid() = user_id);

-- Users can undo their own deletes
CREATE POLICY "Users can remove own deletes"
  ON public.message_deleted_for_user FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for posts updates (delete broadcast)
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_deleted_for_user;

-- Server-side validation function for delete-for-everyone (3 minute rule)
CREATE OR REPLACE FUNCTION public.validate_delete_for_everyone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_created_at timestamptz;
  v_author_id uuid;
BEGIN
  -- Only validate when is_deleted_for_everyone is being set to true
  IF NEW.is_deleted_for_everyone = true AND (OLD.is_deleted_for_everyone IS NULL OR OLD.is_deleted_for_everyone = false) THEN
    -- Get original post data
    v_created_at := OLD.created_at;
    v_author_id := OLD.author_id;
    
    -- Must be the original author
    IF auth.uid() != v_author_id THEN
      RAISE EXCEPTION 'Only the message sender can delete for everyone';
    END IF;
    
    -- Must be within 3 minutes
    IF (now() - v_created_at) > interval '3 minutes' THEN
      RAISE EXCEPTION 'Cannot delete for everyone after 3 minutes';
    END IF;
    
    -- Set metadata
    NEW.deleted_by_user_id := auth.uid();
    NEW.deleted_at := now();
    NEW.content := '🚫 This message was deleted';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for validation
CREATE TRIGGER validate_delete_for_everyone_trigger
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_delete_for_everyone();
