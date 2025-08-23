-- Study groups messaging and sessions tables

-- Group messages table
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Group messages policies
CREATE POLICY "group_messages_select" ON group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);

CREATE POLICY "group_messages_insert" ON group_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);

-- Study sessions policies
CREATE POLICY "study_sessions_select" ON study_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_sessions.group_id AND user_id = auth.uid())
);

CREATE POLICY "study_sessions_insert" ON study_sessions FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_sessions.group_id AND user_id = auth.uid())
);