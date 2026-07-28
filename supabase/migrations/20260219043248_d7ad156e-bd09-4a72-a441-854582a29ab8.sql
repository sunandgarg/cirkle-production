
-- Education table for multiple education entries per user
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution TEXT NOT NULL,
  degree TEXT,
  branch_area TEXT,
  passing_year TEXT,
  location TEXT,
  is_other_institution BOOLEAN DEFAULT false,
  is_other_branch BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Users can insert own education" ON public.education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON public.education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON public.education FOR DELETE USING (auth.uid() = user_id);

-- Professional experience table for multiple entries per user
CREATE TABLE public.professional_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  job_title TEXT,
  start_date TEXT,
  end_date TEXT,
  location TEXT,
  is_current BOOLEAN DEFAULT false,
  is_other_company BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.professional_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all experience" ON public.professional_experience FOR SELECT USING (true);
CREATE POLICY "Users can insert own experience" ON public.professional_experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experience" ON public.professional_experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experience" ON public.professional_experience FOR DELETE USING (auth.uid() = user_id);

-- Custom skills table for user-created skills
CREATE TABLE public.custom_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom skills" ON public.custom_skills FOR SELECT USING (true);
CREATE POLICY "Users can create custom skills" ON public.custom_skills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Custom options table for user-created degree/branch/city options
CREATE TABLE public.custom_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'degree', 'branch', 'city'
  value TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, value)
);

ALTER TABLE public.custom_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom options" ON public.custom_options FOR SELECT USING (true);
CREATE POLICY "Users can create custom options" ON public.custom_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
