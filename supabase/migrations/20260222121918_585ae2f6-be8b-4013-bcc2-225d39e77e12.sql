
-- Fix reactions unique constraint to allow different emojis per user per entity
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_entity_type_entity_id_user_id_key;
ALTER TABLE public.reactions ADD CONSTRAINT reactions_entity_emoji_user_unique UNIQUE (entity_type, entity_id, user_id, emoji);
