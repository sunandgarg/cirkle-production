
-- Create test users in auth.users using raw insert (service role level)
-- We'll use the handle_new_user trigger to auto-create profiles, then update them

-- First, temporarily disable the trigger so we can control profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create test users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, aud, role)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'vishnu@cirkle.world', crypt('pass1234567890', gen_salt('bf')), now(), now(), now(), '{"name":"Vishnu Sharma"}'::jsonb, 'authenticated', 'authenticated'),
  ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'kavya@cirkle.world', crypt('pass1234567890', gen_salt('bf')), now(), now(), now(), '{"name":"Kavya Nair"}'::jsonb, 'authenticated', 'authenticated'),
  ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'abhishek@cirkle.world', crypt('pass1234567890', gen_salt('bf')), now(), now(), now(), '{"name":"Abhishek Jain"}'::jsonb, 'authenticated', 'authenticated'),
  ('d4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'priya@cirkle.world', crypt('pass1234567890', gen_salt('bf')), now(), now(), now(), '{"name":"Priya Mehta"}'::jsonb, 'authenticated', 'authenticated'),
  ('e5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'rahul@cirkle.world', crypt('pass1234567890', gen_salt('bf')), now(), now(), now(), '{"name":"Rahul Deshmukh"}'::jsonb, 'authenticated', 'authenticated'),
  ('f6666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'sneha@cirkle.world', crypt('pass1234567890', gen_salt('bf')), now(), now(), now(), '{"name":"Sneha Kulkarni"}'::jsonb, 'authenticated', 'authenticated'),
  ('a7777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'mangesh@cirkle.world', crypt('pass1234567890', gen_salt('bf')), now(), now(), now(), '{"name":"Mangesh Patil"}'::jsonb, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create identities for each user
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'vishnu@cirkle.world', 'email', '{"sub":"a1111111-1111-1111-1111-111111111111","email":"vishnu@cirkle.world"}'::jsonb, now(), now(), now()),
  ('b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'kavya@cirkle.world', 'email', '{"sub":"b2222222-2222-2222-2222-222222222222","email":"kavya@cirkle.world"}'::jsonb, now(), now(), now()),
  ('c3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'abhishek@cirkle.world', 'email', '{"sub":"c3333333-3333-3333-3333-333333333333","email":"abhishek@cirkle.world"}'::jsonb, now(), now(), now()),
  ('d4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'priya@cirkle.world', 'email', '{"sub":"d4444444-4444-4444-4444-444444444444","email":"priya@cirkle.world"}'::jsonb, now(), now(), now()),
  ('e5555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555555', 'rahul@cirkle.world', 'email', '{"sub":"e5555555-5555-5555-5555-555555555555","email":"rahul@cirkle.world"}'::jsonb, now(), now(), now()),
  ('f6666666-6666-6666-6666-666666666666', 'f6666666-6666-6666-6666-666666666666', 'sneha@cirkle.world', 'email', '{"sub":"f6666666-6666-6666-6666-666666666666","email":"sneha@cirkle.world"}'::jsonb, now(), now(), now()),
  ('a7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', 'mangesh@cirkle.world', 'email', '{"sub":"a7777777-7777-7777-7777-777777777777","email":"mangesh@cirkle.world"}'::jsonb, now(), now(), now())
ON CONFLICT DO NOTHING;

-- Create profiles for test users
INSERT INTO profiles (user_id, name, headline, bio, location, skills, avatar_url, role) VALUES
('a1111111-1111-1111-1111-111111111111', 'Vishnu Sharma', 'Senior Data Scientist at Microsoft', 'ML enthusiast with 8+ years building AI-powered products. Speaker at PyCon India.', 'Bangalore, India', ARRAY['Python', 'Machine Learning', 'TensorFlow', 'Data Analytics'], 'https://i.pravatar.cc/150?img=11', 'user'),
('b2222222-2222-2222-2222-222222222222', 'Kavya Nair', 'UX Designer at Flipkart', 'Creating delightful user experiences. Design thinking advocate & mentor.', 'Pune, India', ARRAY['Figma', 'UI/UX', 'Design Systems', 'User Research'], 'https://i.pravatar.cc/150?img=5', 'user'),
('c3333333-3333-3333-3333-333333333333', 'Abhishek Jain', 'Full Stack Developer at Razorpay', 'Building scalable payment infrastructure. Open source contributor.', 'Bangalore, India', ARRAY['React', 'Node.js', 'TypeScript', 'AWS'], 'https://i.pravatar.cc/150?img=12', 'user'),
('d4444444-4444-4444-4444-444444444444', 'Priya Mehta', 'Marketing Head at Swiggy', 'Growth marketing specialist. Building brands that resonate with millions.', 'Mumbai, India', ARRAY['Digital Marketing', 'Brand Strategy', 'SEO', 'Content Marketing'], 'https://i.pravatar.cc/150?img=9', 'user'),
('e5555555-5555-5555-5555-555555555555', 'Rahul Deshmukh', 'DevOps Engineer at Infosys', 'Cloud infrastructure and automation specialist. AWS certified.', 'Hyderabad, India', ARRAY['Docker', 'Kubernetes', 'CI/CD', 'Terraform'], 'https://i.pravatar.cc/150?img=13', 'user'),
('f6666666-6666-6666-6666-666666666666', 'Sneha Kulkarni', 'Product Manager at Zomato', 'Building products that millions love. Ex-Google. IIM Ahmedabad.', 'Delhi, India', ARRAY['Product Management', 'Agile', 'Analytics', 'Strategy'], 'https://i.pravatar.cc/150?img=25', 'user'),
('a7777777-7777-7777-7777-777777777777', 'Mangesh Patil', 'Blockchain Developer', 'Web3 enthusiast. Building decentralized applications and DeFi protocols.', 'Pune, India', ARRAY['Solidity', 'Web3', 'Smart Contracts', 'DeFi'], 'https://i.pravatar.cc/150?img=14', 'user')
ON CONFLICT (user_id) DO NOTHING;

-- Insert test posts
INSERT INTO posts (author_id, content, is_anonymous, community_id) VALUES
('a1111111-1111-1111-1111-111111111111', 'Just shipped a new ML model that improved our recommendation accuracy by 23%! The key was using a transformer-based architecture with attention mechanisms. Happy to share my learnings with anyone interested. 🚀', false, 'default'),
('b2222222-2222-2222-2222-222222222222', 'Design tip: Always start with user research before jumping into wireframes. I spent 2 weeks interviewing 30+ users before redesigning Flipkart''s checkout flow. Result? 15% increase in conversion rate. 📈', false, 'default'),
('c3333333-3333-3333-3333-333333333333', 'TypeScript 5.4 is a game changer! The new NoInfer utility type and improved narrowing are exactly what we needed. Already migrated our entire codebase. Who else is upgrading?', false, 'default'),
('d4444444-4444-4444-4444-444444444444', 'Excited to announce that our latest campaign reached 50M+ impressions in just 3 days! The power of authentic storytelling combined with data-driven targeting. 🎯', false, 'default'),
('e5555555-5555-5555-5555-555555555555', 'Pro tip for DevOps engineers: Use Karpenter instead of Cluster Autoscaler for EKS. We reduced our cloud costs by 40% with better node provisioning. Here''s how... 💡', false, 'default'),
('f6666666-6666-6666-6666-666666666666', 'Looking for beta testers for our new food discovery feature! If you''re based in Delhi NCR and love trying new restaurants, DM me. 🍕', false, 'default'),
('a7777777-7777-7777-7777-777777777777', 'The future of DeFi is multi-chain. Just deployed our protocol on 5 different L2s. Gas fees are practically zero now. Web3 is finally becoming usable! ⛓️', false, 'default'),
('a1111111-1111-1111-1111-111111111111', 'Sometimes I wonder if we''re building tech for the sake of tech or actually solving real problems. What do you all think?', true, 'default'),
('c3333333-3333-3333-3333-333333333333', 'Unpopular opinion: Most microservices architectures are over-engineered. A well-structured monolith can handle 90% of use cases better.', true, 'default'),
('b2222222-2222-2222-2222-222222222222', 'Just got rejected from my dream company after 6 rounds of interviews. Feeling demotivated but trying to stay positive. Any advice?', true, 'default');

-- Insert test jobs
INSERT INTO jobs (title, company, location, job_type, experience, description, created_by, community_id) VALUES
('Senior Frontend Developer', 'Razorpay', 'Bangalore, India', 'Full Time', '4-6 years', 'We are looking for a Senior Frontend Developer to join our payments team. You will work on building scalable, high-performance web applications using React, TypeScript, and modern frontend tools.', 'c3333333-3333-3333-3333-333333333333', 'default'),
('Data Scientist - NLP', 'Microsoft', 'Hyderabad, India', 'Full Time', '3-5 years', 'Join our AI team to build natural language processing models for Azure Cognitive Services. Experience with transformers and PyTorch required.', 'a1111111-1111-1111-1111-111111111111', 'default'),
('Product Designer', 'Flipkart', 'Bangalore, India', 'Full Time', '2-4 years', 'Design beautiful, intuitive experiences for millions of users. Strong portfolio in mobile-first design required.', 'b2222222-2222-2222-2222-222222222222', 'default'),
('DevOps Engineer', 'Infosys', 'Remote', 'Full Time', '3-5 years', 'Looking for a DevOps engineer to manage our cloud infrastructure on AWS. Experience with Kubernetes, Terraform, and CI/CD pipelines required.', 'e5555555-5555-5555-5555-555555555555', 'default'),
('Growth Marketing Manager', 'Swiggy', 'Mumbai, India', 'Full Time', '4-7 years', 'Lead growth marketing initiatives for Swiggy''s B2C business. Drive user acquisition and retention through data-driven campaigns.', 'd4444444-4444-4444-4444-444444444444', 'default'),
('Blockchain Developer', 'Web3 Startup', 'Remote', 'Contract', '2-4 years', 'Build smart contracts and DeFi protocols on Ethereum and Polygon. Solidity expertise required.', 'a7777777-7777-7777-7777-777777777777', 'default'),
('Junior React Developer', 'TechCorp India', 'Pune, India', 'Full Time', '0-2 years', 'Great opportunity for fresh graduates! Join our team to build modern web applications using React and Next.js.', 'c3333333-3333-3333-3333-333333333333', 'default'),
('Product Manager - Payments', 'PhonePe', 'Bangalore, India', 'Full Time', '5-8 years', 'Own the product roadmap for our payments vertical. Work closely with engineering and design to deliver world-class payment experiences.', 'f6666666-6666-6666-6666-666666666666', 'default');

-- Insert test events
INSERT INTO events (title, description, start_time, end_time, location, created_by, community_id) VALUES
('Tech Meetup: AI & Machine Learning', 'Join us for an evening of talks on the latest trends in AI and ML. Networking opportunities included!', '2026-02-20 18:00:00+05:30', '2026-02-20 21:00:00+05:30', 'WeWork, Bangalore', 'a1111111-1111-1111-1111-111111111111', 'default'),
('Design Workshop: Figma Advanced', 'Hands-on workshop covering advanced Figma techniques including auto-layout, variables, and component architecture.', '2026-02-25 14:00:00+05:30', '2026-02-25 17:00:00+05:30', 'Online - Zoom', 'b2222222-2222-2222-2222-222222222222', 'default'),
('Startup Pitch Night', 'Present your startup idea to a panel of investors and mentors. 5 minutes per pitch, followed by Q&A.', '2026-03-01 19:00:00+05:30', '2026-03-01 22:00:00+05:30', 'T-Hub, Hyderabad', 'f6666666-6666-6666-6666-666666666666', 'default'),
('Web3 Hackathon', '48-hour hackathon focused on building decentralized applications. Prizes worth ₹5 Lakhs!', '2026-03-15 09:00:00+05:30', '2026-03-17 18:00:00+05:30', 'IIT Bombay, Mumbai', 'a7777777-7777-7777-7777-777777777777', 'default'),
('Community Coffee Chat', 'Informal networking session. Come grab a coffee and meet fellow community members!', '2026-02-18 10:00:00+05:30', '2026-02-18 12:00:00+05:30', 'Blue Tokai, Koramangala', 'a1111111-1111-1111-1111-111111111111', 'default');

-- Insert test reactions
INSERT INTO reactions (entity_type, entity_id, user_id) 
SELECT 'post', p.id, u.user_id
FROM (SELECT id FROM posts ORDER BY created_at DESC LIMIT 5) p
CROSS JOIN (SELECT user_id FROM profiles ORDER BY random() LIMIT 3) u
ON CONFLICT DO NOTHING;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
