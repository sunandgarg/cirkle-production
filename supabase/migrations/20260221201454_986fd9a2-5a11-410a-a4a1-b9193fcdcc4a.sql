
-- Fix reactions entity_type constraint to allow forum_msg
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_entity_type_check;
ALTER TABLE public.reactions ADD CONSTRAINT reactions_entity_type_check CHECK (entity_type = ANY (ARRAY['post', 'comment', 'forum_msg']));
