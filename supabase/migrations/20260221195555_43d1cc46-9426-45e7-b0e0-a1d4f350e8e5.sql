
-- Fix critical: verification_codes should NOT be publicly readable
DROP POLICY IF EXISTS "Anyone can read verification codes" ON public.verification_codes;
CREATE POLICY "System only reads verification codes"
ON public.verification_codes FOR SELECT
USING (false);

-- Fix: Allow job creators to see applications
CREATE POLICY "Job creators can read applications"
ON public.applications FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.created_by = auth.uid()
));

-- Fix: Users can delete own messages
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- Fix: Users can update own posts
CREATE POLICY "Authors can update own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = author_id);

-- Fix: Users can update own comments
CREATE POLICY "Authors can update own comments"
ON public.comments FOR UPDATE
USING (auth.uid() = author_id);

-- Fix: Users can leave chat rooms
CREATE POLICY "Users can leave chat rooms"
ON public.chat_members FOR DELETE
USING (auth.uid() = user_id);

-- Fix: Room creator can update room
CREATE POLICY "Creator can update chat room"
ON public.chat_rooms FOR UPDATE
USING (created_by = auth.uid());

-- Fix: Users can cancel pending consultations
CREATE POLICY "Clients can cancel pending consultations"
ON public.consultations FOR DELETE
USING (auth.uid() = client_id AND status = 'pending');

-- Fix: Event creators can manage events
CREATE POLICY "Creators can update events"
ON public.events FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete events"
ON public.events FOR DELETE
USING (auth.uid() = created_by);

-- Fix: Users can delete notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Fix: Admins can delete nav config
CREATE POLICY "Admins can delete nav config"
ON public.nav_config FOR DELETE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'::app_role));
