-- Create study groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  creator_id uuid REFERENCES auth.users(id),
  max_members integer DEFAULT 15,
  is_private boolean DEFAULT false,
  difficulty text DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  next_session timestamptz,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create study group members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Insert sample study groups
INSERT INTO study_groups (name, subject, description, creator_id, max_members, difficulty, next_session, tags) VALUES
('Advanced Calculus Study Circle', 'Mathematics', 'Tackling derivatives, integrals, and real-world applications together.', (SELECT id FROM auth.users LIMIT 1), 12, 'Advanced', now() + interval '2 days', ARRAY['calculus', 'derivatives', 'integrals']),
('Computer Science Algorithms', 'Computer Science', 'Breaking down complex algorithms and data structures step by step.', (SELECT id FROM auth.users LIMIT 1), 20, 'Intermediate', now() + interval '1 day', ARRAY['algorithms', 'data-structures', 'programming']),
('Physics Problem Solving', 'Physics', 'Collaborative approach to tackling challenging physics problems.', (SELECT id FROM auth.users LIMIT 1), 15, 'Intermediate', now() + interval '3 days', ARRAY['mechanics', 'thermodynamics', 'electromagnetism']);

-- Create indexes
CREATE INDEX IF NOT EXISTS study_groups_subject_idx ON study_groups(subject);
CREATE INDEX IF NOT EXISTS study_groups_difficulty_idx ON study_groups(difficulty);
CREATE INDEX IF NOT EXISTS study_group_members_group_id_idx ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS study_group_members_user_id_idx ON study_group_members(user_id);