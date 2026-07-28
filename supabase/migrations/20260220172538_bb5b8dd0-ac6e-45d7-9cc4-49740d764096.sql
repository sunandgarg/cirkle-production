
-- Enable realtime for messages and chat_members for real-time chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;

-- Add jobs tab to admin - allow admins to manage jobs
CREATE POLICY "Admins can update jobs"
ON public.jobs FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all jobs"
ON public.jobs FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));
