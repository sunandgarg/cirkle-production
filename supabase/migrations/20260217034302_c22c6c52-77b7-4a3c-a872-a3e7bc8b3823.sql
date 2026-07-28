
-- 1. Add emoji column to reactions for emoji-type reactions (👍❤️😂🔥)
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '👍';

-- 2. Add reply_to_id for forum message threading
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.posts(id);

-- 3. Add reshared_post_id for reshare functionality  
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reshared_post_id UUID REFERENCES public.posts(id);

-- 4. Add parent_comment_id for nested comments
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id);

-- 5. Add profile fields: experience, social links, expertise, DOB
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expertise TEXT[] DEFAULT '{}';
