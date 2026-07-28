
-- Create a SECURITY DEFINER function to safely assign admin role for super admin phone
CREATE OR REPLACE FUNCTION public.ensure_super_admin(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
BEGIN
  SELECT phone INTO v_phone FROM auth.users WHERE id = p_user_id;
  IF v_phone IS NOT NULL AND v_phone LIKE '%8700602524%' THEN
    UPDATE public.profiles SET is_verified = true, role = 'admin' WHERE user_id = p_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;
