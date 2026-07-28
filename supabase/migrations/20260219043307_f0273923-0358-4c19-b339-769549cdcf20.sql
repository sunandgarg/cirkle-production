
-- Fix verification_codes overly permissive INSERT and UPDATE policies
DROP POLICY IF EXISTS "Anyone can insert verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON public.verification_codes;

CREATE POLICY "Authenticated can insert verification codes" ON public.verification_codes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update verification codes" ON public.verification_codes FOR UPDATE USING (auth.uid() IS NOT NULL);
