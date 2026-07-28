
-- Create messages table for 1-to-1 and group chats
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  is_group boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  avatar_url text
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chat_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_by uuid[] DEFAULT '{}'
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- RLS policies for chat_rooms
CREATE POLICY "Users can read rooms they belong to" ON public.chat_rooms
  FOR SELECT USING (
    id IN (SELECT room_id FROM public.chat_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for chat_members
CREATE POLICY "Users can read members of their rooms" ON public.chat_members
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.chat_members cm WHERE cm.user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can add members" ON public.chat_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for messages
CREATE POLICY "Users can read messages in their rooms" ON public.messages
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.chat_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages to their rooms" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    room_id IN (SELECT room_id FROM public.chat_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Seed test data

-- Insert test profiles (using deterministic UUIDs for cross-referencing)
INSERT INTO public.profiles (user_id, name, headline, bio, location, skills, avatar_url, iit_name, student_status, is_verified, onboarding_completed, role) VALUES
('00000000-0000-0000-0000-000000000001', 'Anuja Sardesai', 'Senior Cyber Security Expert at Deloitte', 'Passionate about cybersecurity and helping startups secure their infrastructure. IIT Bombay alumna with 8+ years experience.', 'Mumbai, India', ARRAY['Cybersecurity','Penetration Testing','Cloud Security','Risk Assessment'], 'https://i.pravatar.cc/150?img=1', 'IIT Bombay', 'alumni', true, true, 'admin'),
('00000000-0000-0000-0000-000000000002', 'Rajesh Kumar', 'Software Engineer at Google', 'Building scalable systems at Google. IIT Delhi 2018 batch. Love open-source.', 'Bangalore, India', ARRAY['Go','Distributed Systems','Kubernetes','React'], 'https://i.pravatar.cc/150?img=3', 'IIT Delhi', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000003', 'Priya Sharma', 'Product Manager at Flipkart', 'Ex-McKinsey, now building e-commerce products. IIT Madras alumna.', 'Bangalore, India', ARRAY['Product Strategy','Data Analytics','Growth Hacking'], 'https://i.pravatar.cc/150?img=5', 'IIT Madras', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000004', 'Arjun Patel', 'Founder & CEO at TechVentures', 'Serial entrepreneur. Built 3 startups. IIT Kanpur alumnus.', 'Delhi, India', ARRAY['Entrepreneurship','Fundraising','Product Development','Leadership'], 'https://i.pravatar.cc/150?img=7', 'IIT Kanpur', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000005', 'Sneha Reddy', 'AI/ML Researcher at Microsoft', 'PhD in Machine Learning. Working on responsible AI at Microsoft Research.', 'Hyderabad, India', ARRAY['Machine Learning','Deep Learning','NLP','Computer Vision'], 'https://i.pravatar.cc/150?img=9', 'IIT Hyderabad', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000006', 'Vikram Singh', 'Investment Banker at Goldman Sachs', 'Managing tech sector investments. IIT Kharagpur + ISB alumnus.', 'Mumbai, India', ARRAY['Investment Banking','Financial Modeling','M&A','Valuation'], 'https://i.pravatar.cc/150?img=11', 'IIT Kharagpur', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000007', 'Kavya Nair', 'Data Scientist at Razorpay', 'Building fraud detection systems. IIT Guwahati 2020 batch.', 'Bangalore, India', ARRAY['Python','Data Science','Fraud Detection','SQL'], 'https://i.pravatar.cc/150?img=20', 'IIT Guwahati', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000008', 'Rohit Mehta', 'DevOps Lead at Zerodha', 'Infrastructure nerd. Love building reliable systems.', 'Bangalore, India', ARRAY['AWS','Docker','Terraform','CI/CD'], 'https://i.pravatar.cc/150?img=12', 'IIT Roorkee', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000009', 'Aisha Khan', 'UX Designer at Swiggy', 'Designing delightful food ordering experiences. IIT Bombay Design dept.', 'Bangalore, India', ARRAY['UX Design','Figma','User Research','Prototyping'], 'https://i.pravatar.cc/150?img=25', 'IIT Bombay', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000010', 'Siddharth Joshi', 'B.Tech Final Year at IIT BHU', 'Competitive programmer. Building side projects in Rust and Web3.', 'Varanasi, India', ARRAY['Rust','Web3','Competitive Programming','Solidity'], 'https://i.pravatar.cc/150?img=14', 'IIT BHU', 'current_student', true, true, 'user'),
('00000000-0000-0000-0000-000000000011', 'Meera Iyer', 'ISRO Scientist', 'Working on satellite communication systems. IIT Madras PhD.', 'Trivandrum, India', ARRAY['Satellite Communication','Signal Processing','MATLAB'], 'https://i.pravatar.cc/150?img=32', 'IIT Madras', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000012', 'Abhishek Gupta', 'Frontend Engineer at PhonePe', 'React enthusiast. Building India''s payment future.', 'Pune, India', ARRAY['React','TypeScript','Next.js','GraphQL'], 'https://i.pravatar.cc/150?img=15', 'IIT Indore', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000013', 'Tanvi Deshmukh', 'Management Consultant at BCG', 'Helping Fortune 500 companies with digital transformation.', 'Mumbai, India', ARRAY['Strategy','Digital Transformation','Analytics'], 'https://i.pravatar.cc/150?img=44', 'IIT Delhi', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000014', 'Karthik Rajan', 'ML Engineer at Paytm', 'Building recommendation systems at scale.', 'Noida, India', ARRAY['Machine Learning','Recommendation Systems','Python','Spark'], 'https://i.pravatar.cc/150?img=17', 'IIT Ropar', 'alumni', true, true, 'user'),
('00000000-0000-0000-0000-000000000015', 'Nandini Verma', 'B.Tech 3rd Year at IIT Delhi', 'Aspiring data scientist. Love hackathons and open source.', 'Delhi, India', ARRAY['Python','Data Analysis','Hackathons'], 'https://i.pravatar.cc/150?img=45', 'IIT Delhi', 'current_student', true, true, 'user');

-- Insert test posts
INSERT INTO public.posts (author_id, content, is_anonymous, community_id) VALUES
('00000000-0000-0000-0000-000000000002', 'Just shipped a major feature at Google! The feeling of pushing code that serves millions of users is unmatched. #engineering #google #scaleup', false, 'default'),
('00000000-0000-0000-0000-000000000003', 'Hot take: Most product managers spend too much time on roadmaps and not enough talking to users. The best products are built from the ground up with customer empathy. #productmanagement #ux', false, 'default'),
('00000000-0000-0000-0000-000000000004', 'Raised our Series B! 🎉 $12M to transform how India does B2B commerce. IIT network was instrumental in connecting us with the right investors. #startup #fundraising', false, 'default'),
('00000000-0000-0000-0000-000000000001', 'PSA: If you''re running a startup, please invest in security from day one. The cost of a breach is 10x more than prevention. Happy to do free security audits for fellow IITians'' startups! #cybersecurity #startups', false, 'default'),
('00000000-0000-0000-0000-000000000005', 'Published our paper on responsible AI at NeurIPS! It''s incredible how far the field has come. Proud of the team at Microsoft Research India. #AI #research #neurips', false, 'default'),
('00000000-0000-0000-0000-000000000010', 'Any tips for competitive programming? I''m stuck at 1800 on Codeforces and want to break into 2000+. #cp #algorithms', false, 'default'),
('00000000-0000-0000-0000-000000000001', 'Sometimes I feel like the corporate race is not worth it. Anyone else feeling burned out? Would love to hear how you deal with it.', true, 'default'),
('00000000-0000-0000-0000-000000000006', 'Market analysis: Indian tech sector is poised for a 15% growth this year. If you''re in fintech, the opportunity is massive. #finance #fintech #india', false, 'default'),
('00000000-0000-0000-0000-000000000009', 'Just redesigned Swiggy''s checkout flow and reduced drop-off by 23%! Design really does impact the bottom line. #uxdesign #metrics', false, 'default'),
('00000000-0000-0000-0000-000000000007', 'Built a fraud detection model that catches 99.2% of fraudulent transactions in real-time. The power of ML in fintech is amazing! #datascience #fintech', false, 'default'),
('00000000-0000-0000-0000-000000000012', 'React Server Components are game-changing. If you haven''t tried them yet, you''re missing out. Here''s a thread on how we use them at PhonePe... #react #frontend', false, 'default'),
('00000000-0000-0000-0000-000000000011', 'Successful satellite launch today! Chandrayaan-4 payload integration complete. Proud to be part of India''s space journey. #ISRO #space', false, 'default'),
('00000000-0000-0000-0000-000000000013', 'Networking tip: Don''t just connect with people when you need something. Build genuine relationships over time. The IIT alumni network is powerful — use it wisely. #networking #career', false, 'default'),
('00000000-0000-0000-0000-000000000015', 'Won our college hackathon! Built a mental health chatbot using GPT-4. Looking for mentors to take this forward as a startup. #hackathon #mentalhealth #startup', false, 'default'),
('00000000-0000-0000-0000-000000000008', 'Deployed our entire infrastructure to Kubernetes. Zero downtime. The DevOps life is the good life. #devops #kubernetes #zerodha', false, 'default'),
('00000000-0000-0000-0000-000000000014', 'The recommendation algorithm we built processes 500M events daily. Scale is addictive. #machinelearning #scale', false, 'default');

-- Insert test jobs
INSERT INTO public.jobs (created_by, title, company, location, job_type, experience, description) VALUES
('00000000-0000-0000-0000-000000000002', 'Senior Software Engineer', 'Google', 'Bangalore, India', 'Full-time', '3-5 years', 'Build large-scale distributed systems for Search infrastructure.'),
('00000000-0000-0000-0000-000000000005', 'ML Research Intern', 'Microsoft Research', 'Hyderabad, India', 'Internship', '0-1 years', 'Work on cutting-edge AI research in NLP and computer vision.'),
('00000000-0000-0000-0000-000000000003', 'Product Manager', 'Flipkart', 'Bangalore, India', 'Full-time', '2-4 years', 'Own the grocery vertical product strategy and roadmap.'),
('00000000-0000-0000-0000-000000000007', 'Data Scientist', 'Razorpay', 'Bangalore, India', 'Full-time', '1-3 years', 'Build fraud detection and risk scoring models.'),
('00000000-0000-0000-0000-000000000008', 'DevOps Engineer', 'Zerodha', 'Bangalore, India (Remote)', 'Full-time', '2-4 years', 'Manage Kubernetes clusters and CI/CD pipelines.'),
('00000000-0000-0000-0000-000000000011', 'Scientist/Engineer', 'ISRO', 'Trivandrum, India', 'Government', '0-2 years', 'Satellite communication systems development.'),
('00000000-0000-0000-0000-000000000006', 'Investment Banking Analyst', 'Goldman Sachs', 'Mumbai, India', 'Full-time', '0-2 years', 'Tech sector coverage and financial modeling.'),
('00000000-0000-0000-0000-000000000004', 'Full-Stack Developer', 'TechVentures', 'Delhi, India (Remote)', 'Full-time', '1-3 years', 'Build B2B commerce platform from scratch.'),
('00000000-0000-0000-0000-000000000012', 'Frontend Engineer', 'PhonePe', 'Pune, India', 'Full-time', '1-3 years', 'Build payment interfaces with React and TypeScript.'),
('00000000-0000-0000-0000-000000000014', 'ML Engineer', 'Paytm', 'Noida, India', 'Full-time', '2-4 years', 'Build recommendation systems at scale.'),
('00000000-0000-0000-0000-000000000013', 'Strategy Consultant', 'BCG', 'Mumbai, India', 'Full-time', '1-3 years', 'Digital transformation consulting for top companies.'),
('00000000-0000-0000-0000-000000000004', 'Summer Intern - Engineering', 'TechVentures', 'Remote', 'Internship', '0 years', 'Build features for our B2B commerce platform. Stipend: ₹50k/month.');

-- Insert test events
INSERT INTO public.events (created_by, title, description, start_time, end_time, location) VALUES
('00000000-0000-0000-0000-000000000001', 'IIT Alumni Meetup - Mumbai', 'Monthly networking dinner for IIT alumni in Mumbai. Bring your stories!', '2026-02-22 19:00:00+05:30', '2026-02-22 22:00:00+05:30', 'Taj Colaba, Mumbai'),
('00000000-0000-0000-0000-000000000004', 'Startup Pitch Night', 'Present your startup to VCs and angel investors from the IIT network.', '2026-02-28 18:00:00+05:30', '2026-02-28 21:00:00+05:30', 'WeWork BKC, Mumbai'),
('00000000-0000-0000-0000-000000000005', 'AI/ML Workshop', 'Hands-on workshop on building production ML pipelines. Limited seats.', '2026-03-05 10:00:00+05:30', '2026-03-05 17:00:00+05:30', 'Microsoft Campus, Hyderabad'),
('00000000-0000-0000-0000-000000000001', 'Cybersecurity Webinar', 'Free webinar on securing your startup infrastructure. Open to all IITians.', '2026-03-10 15:00:00+05:30', '2026-03-10 16:30:00+05:30', 'Online - Zoom'),
('00000000-0000-0000-0000-000000000010', 'Competitive Programming Contest', 'IIT-exclusive CP contest. Prizes worth ₹50k!', '2026-03-15 14:00:00+05:30', '2026-03-15 17:00:00+05:30', 'Online - Codeforces'),
('00000000-0000-0000-0000-000000000009', 'Design Thinking Workshop', 'Learn UX design fundamentals from industry professionals.', '2026-03-20 10:00:00+05:30', '2026-03-20 16:00:00+05:30', 'IIT Bombay Campus'),
('00000000-0000-0000-0000-000000000006', 'Finance & Investment Seminar', 'Understanding market trends and personal finance for tech professionals.', '2026-02-25 17:00:00+05:30', '2026-02-25 19:00:00+05:30', 'Online - Google Meet'),
('00000000-0000-0000-0000-000000000015', 'Hackathon: Build for Bharat', '48-hour hackathon focused on India-specific problems. Teams of 3-4.', '2026-03-22 09:00:00+05:30', '2026-03-24 09:00:00+05:30', 'IIT Delhi Campus');

-- Insert test stories
INSERT INTO public.stories (user_id, image_url, content, expires_at) VALUES
('00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=600&fit=crop', 'Security conference day! 🔐', now() + interval '20 hours'),
('00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop', 'Late night coding at Google 💻', now() + interval '18 hours'),
('00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=600&fit=crop', 'Series B celebration! 🎉', now() + interval '15 hours'),
('00000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=600&fit=crop', 'New design in progress ✨', now() + interval '22 hours'),
('00000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop', 'Satellite launch prep! 🚀', now() + interval '12 hours'),
('00000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=600&fit=crop', 'Hackathon winners! 🏆', now() + interval '10 hours');

-- Insert test connections
INSERT INTO public.connections (requester_id, receiver_id, status) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'accepted'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'accepted'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'accepted'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'accepted'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'accepted'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'accepted'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'pending'),
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000015', 'accepted'),
('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000012', 'accepted'),
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000014', 'pending');

-- Insert test reactions
INSERT INTO public.reactions (entity_type, entity_id, user_id) 
SELECT 'post', p.id, '00000000-0000-0000-0000-000000000002'
FROM posts p LIMIT 5;

INSERT INTO public.reactions (entity_type, entity_id, user_id) 
SELECT 'post', p.id, '00000000-0000-0000-0000-000000000003'
FROM posts p LIMIT 8;

INSERT INTO public.reactions (entity_type, entity_id, user_id) 
SELECT 'post', p.id, '00000000-0000-0000-0000-000000000005'
FROM posts p LIMIT 6;
