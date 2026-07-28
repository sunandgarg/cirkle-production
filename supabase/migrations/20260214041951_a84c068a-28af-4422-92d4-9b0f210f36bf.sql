
-- Drop all FK constraints referencing auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_created_by_fkey;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_requester_id_fkey;
ALTER TABLE public.connections DROP CONSTRAINT IF EXISTS connections_receiver_id_fkey;
ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_applicant_id_fkey;
ALTER TABLE public.rsvps DROP CONSTRAINT IF EXISTS rsvps_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Seed profiles
INSERT INTO public.profiles (user_id, name, headline, bio, location, skills, avatar_url, iit_name, student_status, is_verified, onboarding_completed, community_id, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Anuja Sardesai', 'Senior Cyber Security Expert at Deloitte', 'Passionate about cybersecurity and mentoring IITians.', 'Mumbai, India', ARRAY['Cybersecurity','Penetration Testing','Cloud Security','VAPT'], 'https://i.pravatar.cc/150?img=1', 'IIT Bombay', 'alumni', true, true, 'default', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Vishnu Krishnan', 'ML Engineer at Google', 'Building large-scale ML systems.', 'Bangalore, India', ARRAY['Machine Learning','Python','TensorFlow','NLP'], 'https://i.pravatar.cc/150?img=11', 'IIT Madras', 'alumni', true, true, 'default', 'user'),
('33333333-3333-3333-3333-333333333333', 'Kavya Sharma', 'Product Manager at Razorpay', 'Ex-Goldman Sachs. Love fintech.', 'Bangalore, India', ARRAY['Product Management','Fintech','Strategy'], 'https://i.pravatar.cc/150?img=5', 'IIT Delhi', 'alumni', true, true, 'default', 'user'),
('44444444-4444-4444-4444-444444444444', 'Abhishek Gupta', 'Founding Engineer at Zerodha', 'Building trading platforms at scale.', 'Bangalore, India', ARRAY['Go','Distributed Systems','Trading'], 'https://i.pravatar.cc/150?img=12', 'IIT Kanpur', 'alumni', true, true, 'default', 'user'),
('55555555-5555-5555-5555-555555555555', 'Priya Mehta', 'Data Scientist at Microsoft', 'Azure AI. IIT Kharagpur 2020.', 'Hyderabad, India', ARRAY['Data Science','Azure','Deep Learning'], 'https://i.pravatar.cc/150?img=9', 'IIT Kharagpur', 'alumni', true, true, 'default', 'user'),
('66666666-6666-6666-6666-666666666666', 'Rohan Deshmukh', 'Startup Founder - EcoTech', 'Climate tech. Y Combinator W24.', 'Pune, India', ARRAY['Entrepreneurship','Climate Tech','IoT'], 'https://i.pravatar.cc/150?img=13', 'IIT Bombay', 'alumni', true, true, 'default', 'user'),
('77777777-7777-7777-7777-777777777777', 'Sneha Iyer', 'UX Designer at Flipkart', 'Designing commerce experiences.', 'Bangalore, India', ARRAY['UX Design','Figma','Design Systems'], 'https://i.pravatar.cc/150?img=25', 'IIT Guwahati', 'alumni', true, true, 'default', 'user'),
('88888888-8888-8888-8888-888888888888', 'Arjun Nair', 'Research Scientist at ISRO', 'Satellite communication.', 'Thiruvananthapuram, India', ARRAY['Signal Processing','MATLAB','Research'], 'https://i.pravatar.cc/150?img=14', 'IIT Madras', 'alumni', true, true, 'default', 'user'),
('99999999-9999-9999-9999-999999999999', 'Meera Joshi', 'SDE-3 at Amazon', 'Distributed systems enthusiast.', 'Gurgaon, India', ARRAY['Java','AWS','System Design'], 'https://i.pravatar.cc/150?img=44', 'IIT Roorkee', 'alumni', true, true, 'default', 'user'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Karthik Reddy', 'B.Tech CSE Student', 'Final year at IIT Hyderabad.', 'Hyderabad, India', ARRAY['React','Node.js','Open Source'], 'https://i.pravatar.cc/150?img=15', 'IIT Hyderabad', 'current_student', true, true, 'default', 'user'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Divya Singh', 'Consultant at McKinsey', 'Strategy and operations.', 'Delhi, India', ARRAY['Strategy','Consulting','Analytics'], 'https://i.pravatar.cc/150?img=45', 'IIT BHU', 'alumni', true, true, 'default', 'user'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rahul Verma', 'Backend Lead at PhonePe', 'Building UPI infrastructure.', 'Bangalore, India', ARRAY['Java','Kafka','PostgreSQL'], 'https://i.pravatar.cc/150?img=52', 'IIT Indore', 'alumni', true, true, 'default', 'user'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ananya Pillai', 'AI Researcher at DeepMind', 'Reinforcement learning and robotics.', 'London, UK', ARRAY['RL','PyTorch','Robotics'], 'https://i.pravatar.cc/150?img=47', 'IIT Delhi', 'alumni', true, true, 'default', 'user'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mangesh Patil', 'M.Tech Student', '2nd year AI at IIT Jodhpur.', 'Jodhpur, India', ARRAY['Computer Vision','GANs','Python'], 'https://i.pravatar.cc/150?img=57', 'IIT Jodhpur', 'current_student', true, true, 'default', 'user'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Tanya Kapoor', 'VP Engineering at Paytm', 'Leading mobile payments eng.', 'Noida, India', ARRAY['Eng Management','Mobile','Payments'], 'https://i.pravatar.cc/150?img=48', 'IIT Kanpur', 'alumni', true, true, 'default', 'user')
ON CONFLICT (user_id) DO NOTHING;

-- Posts
INSERT INTO public.posts (author_id, content, is_anonymous, community_id) VALUES
('22222222-2222-2222-2222-222222222222', 'Just published my research paper on transformer architectures! 🎉 #MachineLearning #NLP', false, 'default'),
('33333333-3333-3333-3333-333333333333', 'Hot take: Most startups fail due to poor product-market fit. #Startups', false, 'default'),
('44444444-4444-4444-4444-444444444444', 'We crossed 10M daily active traders! AMA #Engineering #Trading', false, 'default'),
('11111111-1111-1111-1111-111111111111', 'Hiring alert! 🚨 Deloitte Cyber needs security analysts. #Jobs', false, 'default'),
('66666666-6666-6666-6666-666666666666', 'Y Combinator was transformative. Happy to review apps! #YCombinator', false, 'default'),
('55555555-5555-5555-5555-555555555555', 'New Azure OpenAI features are amazing for enterprise AI 🧵 #AI', false, 'default'),
('77777777-7777-7777-7777-777777777777', 'Design tip: Test with real users, not just stakeholders. #UXDesign', false, 'default'),
('88888888-8888-8888-8888-888888888888', 'Chandrayaan-4 prep in full swing! Proud ISRO member 🚀', false, 'default'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'All-nighters for end-sem. Send coffee ☕ #IITLife', false, 'default'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MBA after IIT is not selling out. Tech + business is powerful.', false, 'default'),
('11111111-1111-1111-1111-111111111111', 'Imposter syndrome never goes away no matter how senior you get.', true, 'default'),
('33333333-3333-3333-3333-333333333333', 'Work-life balance in Indian startups is terrible.', true, 'default'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'UPI: 14B transactions last month. Building the infra! #Payments', false, 'default'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Paper on multi-agent RL accepted at NeurIPS! 🎉 #AI', false, 'default'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Best engineers delete the most code. Simplicity wins. #Leadership', false, 'default'),
('99999999-9999-9999-9999-999999999999', 'Ensure your monolith has scaling issues before going microservices.', false, 'default');

-- Jobs
INSERT INTO public.jobs (created_by, title, company, location, job_type, experience, description, community_id) VALUES
('22222222-2222-2222-2222-222222222222', 'Senior ML Engineer', 'Google', 'Bangalore', 'Full-time', '3-5 years', 'Large-scale ML systems for Search.', 'default'),
('33333333-3333-3333-3333-333333333333', 'Product Manager', 'Razorpay', 'Bangalore', 'Full-time', '2-4 years', 'Own the payments product roadmap.', 'default'),
('44444444-4444-4444-4444-444444444444', 'Backend Developer', 'Zerodha', 'Remote', 'Full-time', '1-3 years', 'High-performance trading systems in Go.', 'default'),
('55555555-5555-5555-5555-555555555555', 'Data Scientist Intern', 'Microsoft', 'Hyderabad', 'Internship', '0-1 years', 'Azure AI team internship.', 'default'),
('77777777-7777-7777-7777-777777777777', 'Senior UX Designer', 'Flipkart', 'Bangalore', 'Full-time', '4-6 years', 'Lead commerce design.', 'default'),
('88888888-8888-8888-8888-888888888888', 'Scientist/Engineer', 'ISRO', 'Thiruvananthapuram', 'Government', '0-2 years', 'Satellite communication.', 'default'),
('11111111-1111-1111-1111-111111111111', 'Security Analyst', 'Deloitte', 'Mumbai', 'Full-time', '0-2 years', 'Cyber security practice.', 'default'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'SDE-2 Backend', 'PhonePe', 'Bangalore', 'Full-time', '2-4 years', 'Payment infrastructure.', 'default'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Engineering Manager', 'Paytm', 'Noida', 'Full-time', '6-10 years', 'Lead mobile payments team.', 'default'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Business Analyst', 'McKinsey', 'Delhi', 'Full-time', '0-2 years', 'Strategy consulting.', 'default'),
('66666666-6666-6666-6666-666666666666', 'Full Stack Developer', 'EcoTech', 'Remote', 'Full-time', '1-3 years', 'YC-backed climate tech.', 'default'),
('99999999-9999-9999-9999-999999999999', 'SDE Intern', 'Amazon', 'Gurgaon', 'Internship', '0 years', '6-month SDE internship.', 'default');

-- Events
INSERT INTO public.events (created_by, title, description, location, start_time, end_time, community_id) VALUES
('11111111-1111-1111-1111-111111111111', 'IIT Alumni Meetup Mumbai', 'Monthly networking meetup.', 'Taj Lands End, Mumbai', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 3 hours', 'default'),
('22222222-2222-2222-2222-222222222222', 'AI/ML Workshop', 'Production ML systems workshop.', 'Online', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'default'),
('66666666-6666-6666-6666-666666666666', 'Startup Pitch Night', 'IIT founders pitch to investors.', 'WeWork Bangalore', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days 4 hours', 'default'),
('44444444-4444-4444-4444-444444444444', 'FinTech Hackathon', '48hr hackathon. 5L prizes.', 'IIT Kanpur', NOW() + INTERVAL '21 days', NOW() + INTERVAL '23 days', 'default'),
('88888888-8888-8888-8888-888888888888', 'Space Tech Webinar', 'ISRO Chandrayaan-4 insights.', 'YouTube Live', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 2 hours', 'default'),
('33333333-3333-3333-3333-333333333333', 'Women in Tech Panel', 'Panel on women in tech.', 'Google Bangalore', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 2 hours', 'default'),
('55555555-5555-5555-5555-555555555555', 'Resume Workshop', 'Craft the perfect resume.', 'Google Meet', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'default'),
('99999999-9999-9999-9999-999999999999', 'System Design Class', 'Scalable systems deep dive.', 'IIT Delhi', NOW() + INTERVAL '18 days', NOW() + INTERVAL '18 days 3 hours', 'default');

-- Stories
INSERT INTO public.stories (user_id, image_url, content, created_at, expires_at) VALUES
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=600&fit=crop', 'Coding all night! 🔥', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '22 hours'),
('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=600&fit=crop', 'Team offsite 🎉', NOW() - INTERVAL '5 hours', NOW() + INTERVAL '19 hours'),
('66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=600&fit=crop', 'YC Demo Day prep!', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours'),
('77777777-7777-7777-7777-777777777777', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=600&fit=crop', 'New design shipped ✨', NOW() - INTERVAL '8 hours', NOW() + INTERVAL '16 hours'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=600&fit=crop', 'Campus vibes 🏫', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '21 hours');
