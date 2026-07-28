-- Allow users to update their own typing_at in chat_members
CREATE POLICY "Users can update own typing status"
ON public.chat_members
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for chat_members to support typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;
