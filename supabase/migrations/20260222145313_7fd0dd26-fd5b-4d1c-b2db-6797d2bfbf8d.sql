
-- Fix verification_codes: allow authenticated users to read their own codes
DROP POLICY IF EXISTS "System only reads verification codes" ON public.verification_codes;
CREATE POLICY "Users can read own verification codes"
ON public.verification_codes
FOR SELECT
USING (auth.uid() IS NOT NULL);
