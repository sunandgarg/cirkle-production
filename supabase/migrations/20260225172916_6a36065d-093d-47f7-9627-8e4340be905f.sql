
-- Verifications table: one-to-one mapping between IIT email and user/phone
CREATE TABLE IF NOT EXISTS public.verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  iit_email text NOT NULL,
  iit_email_normalized text NOT NULL UNIQUE,
  iit_domain text,
  email_verified_at timestamptz,
  verified_status text NOT NULL DEFAULT 'UNVERIFIED',
  locked_to_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log for phone changes
CREATE TABLE IF NOT EXISTS public.verification_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  iit_email text NOT NULL,
  old_phone text,
  new_phone text,
  actor uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for verifications
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own verification"
  ON public.verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification"
  ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON public.verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS for audit log (admin only read, system insert)
ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON public.verification_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
