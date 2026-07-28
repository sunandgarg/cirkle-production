
-- Create polls table for forum
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls are readable by all authenticated users
CREATE POLICY "Polls are viewable by authenticated users" ON public.polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create polls" ON public.polls FOR INSERT TO authenticated WITH CHECK (true);

-- Poll votes
CREATE POLICY "Poll votes are viewable by authenticated users" ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote on polls" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON public.poll_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote" ON public.poll_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for polls
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
