-- Remove the legacy client-callable privilege escalation function.
DROP FUNCTION IF EXISTS public.ensure_super_admin(uuid);

-- Verification codes are server-only and stored as one-way hashes.
DROP POLICY IF EXISTS "Anyone can insert verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Anyone can read verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Authenticated can insert verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Authenticated can update verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "System only reads verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can read own verification codes" ON public.verification_codes;
ALTER TABLE public.verification_codes ALTER COLUMN code DROP NOT NULL;
ALTER TABLE public.verification_codes ADD COLUMN IF NOT EXISTS code_hash text;
ALTER TABLE public.verification_codes ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.verification_codes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE public.verification_codes SET code = NULL, used = true WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS verification_codes_user_email_created_idx
  ON public.verification_codes (user_id, email, created_at DESC);
REVOKE ALL ON public.verification_codes FROM anon, authenticated;

-- Verification state can only be written by trusted server code.
DROP POLICY IF EXISTS "Users can insert own verification" ON public.verifications;
DROP POLICY IF EXISTS "Users can update own verification" ON public.verifications;
REVOKE INSERT, UPDATE, DELETE ON public.verifications FROM anon, authenticated;

-- App settings are not a secret store. Only a narrow public allowlist is readable.
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Users can read public settings"
  ON public.app_settings FOR SELECT TO authenticated
  USING (key = 'show_home_network' OR key LIKE 'slow_mode_%');
DELETE FROM public.app_settings
  WHERE key IN ('test_mode', 'verification_test_mode', 'sms_provider', 'sms_api_key');

-- Prevent users from promoting or verifying themselves through profile updates.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    NEW.user_id := OLD.user_id;
    NEW.role := OLD.role;
    NEW.is_verified := OLD.is_verified;
    NEW.community_id := OLD.community_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER protect_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_fields();

CREATE OR REPLACE FUNCTION public.protect_new_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    NEW.role := 'user'::public.app_role;
    NEW.is_verified := false;
    NEW.community_id := 'default';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_new_profile_privileged_fields ON public.profiles;
CREATE TRIGGER protect_new_profile_privileged_fields
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_new_profile_privileged_fields();

-- Anonymous posts are readable through a masking view. Direct table reads expose
-- anonymous rows only to their author and moderators/admins.
DROP POLICY IF EXISTS "Anyone authenticated can read posts" ON public.posts;
CREATE POLICY "Authenticated users can read non-anonymous or privileged posts"
  ON public.posts FOR SELECT TO authenticated
  USING (
    NOT is_anonymous
    OR author_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  );

CREATE OR REPLACE VIEW public.visible_posts
WITH (security_invoker = false)
AS
SELECT
  id,
  community_id,
  CASE WHEN is_anonymous THEN NULL ELSE author_id END AS author_id,
  is_anonymous,
  content,
  created_at,
  image_url,
  channel,
  campus_filter,
  cohort_filter,
  edited_at,
  tags,
  seen_by,
  scope_type,
  scope_key,
  degree_filter,
  branch_filter,
  batch_filter,
  student_status_filter,
  reply_to_id,
  pinned_at,
  deleted_at,
  file_url,
  file_name,
  file_type,
  file_size,
  voice_url,
  voice_duration,
  reshared_post_id,
  is_deleted_for_everyone,
  deleted_for_users,
  deleted_by_user_id
FROM public.posts
WHERE deleted_at IS NULL;

REVOKE ALL ON public.visible_posts FROM anon, public;
GRANT SELECT ON public.visible_posts TO authenticated;

-- Ensure profile-role checks cannot be bypassed in navigation policies.
DROP POLICY IF EXISTS "Admins can update nav config" ON public.nav_config;
DROP POLICY IF EXISTS "Admins can insert nav config" ON public.nav_config;
DROP POLICY IF EXISTS "Admins can delete nav config" ON public.nav_config;
CREATE POLICY "Admins can update nav config" ON public.nav_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert nav config" ON public.nav_config FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete nav config" ON public.nav_config FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
