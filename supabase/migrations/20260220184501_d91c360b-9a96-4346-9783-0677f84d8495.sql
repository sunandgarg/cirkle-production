
-- =============================================
-- 1. Fix chat_members infinite recursion in RLS
-- =============================================

-- Create a security definer function to get user's room IDs without recursion
CREATE OR REPLACE FUNCTION public.get_user_room_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT room_id FROM public.chat_members WHERE user_id = p_user_id;
$$;

-- Drop old recursive policies
DROP POLICY IF EXISTS "Users can read members of their rooms" ON public.chat_members;
DROP POLICY IF EXISTS "Users can read rooms they belong to" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can read messages in their rooms" ON public.messages;

-- Recreate non-recursive policies using the function
CREATE POLICY "Users can read members of their rooms"
ON public.chat_members FOR SELECT
USING (room_id IN (SELECT get_user_room_ids(auth.uid())));

CREATE POLICY "Users can read rooms they belong to"
ON public.chat_rooms FOR SELECT
USING (id IN (SELECT get_user_room_ids(auth.uid())));

CREATE POLICY "Users can read messages in their rooms"
ON public.messages FOR SELECT
USING (room_id IN (SELECT get_user_room_ids(auth.uid())));

-- Fix messages INSERT policy too
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.messages;
CREATE POLICY "Users can send messages to their rooms"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  room_id IN (SELECT get_user_room_ids(auth.uid()))
);

-- =============================================
-- 2. Fix user_roles - add insert policy via function
-- =============================================

-- Update ensure_super_admin to also handle email-based phone logins
CREATE OR REPLACE FUNCTION public.ensure_super_admin(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_phone text;
  v_email text;
  v_meta jsonb;
BEGIN
  SELECT phone, email, raw_user_meta_data INTO v_phone, v_email, v_meta
  FROM auth.users WHERE id = p_user_id;

  -- Check phone field OR email pattern OR user_metadata phone
  IF (v_phone IS NOT NULL AND v_phone LIKE '%8700602524%')
     OR (v_email = 'admin@cirkle.world')
     OR (v_meta->>'phone' = '8700602524') THEN

    -- Upsert profile
    INSERT INTO public.profiles (user_id, name, is_verified, onboarding_completed, role)
    VALUES (p_user_id, 'SUNAND GARG', true, true, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET
      is_verified = true,
      onboarding_completed = true,
      role = 'admin',
      name = COALESCE(public.profiles.name, 'SUNAND GARG');

    -- Upsert admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- =============================================
-- 3. Profiles table - ensure user_id has unique constraint for ON CONFLICT
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;
