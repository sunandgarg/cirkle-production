
-- Add unique constraint on app_settings key if not exists
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_key_unique ON app_settings(key);

-- Add show_home_network setting
INSERT INTO app_settings (key, value) VALUES ('show_home_network', 'false')
ON CONFLICT (key) DO NOTHING;

-- Add granular filter columns to posts for dynamic channel filtering
ALTER TABLE posts ADD COLUMN IF NOT EXISTS degree_filter text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS branch_filter text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS batch_filter text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS student_status_filter text;

-- Backfill existing posts from cohort_filter (format: "institution|degree|branch|year")
UPDATE posts SET
  degree_filter = NULLIF(split_part(cohort_filter, '|', 2), ''),
  branch_filter = NULLIF(split_part(cohort_filter, '|', 3), ''),
  batch_filter = NULLIF(split_part(cohort_filter, '|', 4), '')
WHERE cohort_filter IS NOT NULL AND cohort_filter != '';

-- Add indexes for fast channel filtering
CREATE INDEX IF NOT EXISTS idx_posts_channel ON posts(channel);
CREATE INDEX IF NOT EXISTS idx_posts_campus_filter ON posts(campus_filter);
CREATE INDEX IF NOT EXISTS idx_posts_degree_filter ON posts(degree_filter);
CREATE INDEX IF NOT EXISTS idx_posts_branch_filter ON posts(branch_filter);
CREATE INDEX IF NOT EXISTS idx_posts_batch_filter ON posts(batch_filter);
CREATE INDEX IF NOT EXISTS idx_posts_student_status_filter ON posts(student_status_filter);
