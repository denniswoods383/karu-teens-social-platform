-- Study Groups and Meetings tables for video conferencing integration

-- Study Groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 50,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Group Members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  room_id TEXT UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  max_participants INTEGER DEFAULT 500,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting Participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  is_present BOOLEAN DEFAULT false,
  UNIQUE(meeting_id, user_id)
);

-- Meeting Shares table (for sharing meetings with other students)
CREATE TABLE IF NOT EXISTS meeting_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, shared_with)
);

-- Enable RLS
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Study groups viewable by members" ON study_groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_groups.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create study groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update their groups" ON study_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Public groups viewable by all" ON study_groups FOR SELECT USING (is_public = true);

CREATE POLICY "Group members can view membership" ON study_group_members FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_group_members.group_id AND user_id = auth.uid())
);
CREATE POLICY "Users can join groups" ON study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group members can view meetings" ON meetings FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = meetings.group_id AND user_id = auth.uid())
);
CREATE POLICY "Group admins can create meetings" ON meetings FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = meetings.group_id AND user_id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view their meeting participation" ON meeting_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join meetings" ON meeting_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participation" ON meeting_participants FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared meetings" ON meeting_shares FOR SELECT USING (auth.uid() = shared_with OR auth.uid() = shared_by);
CREATE POLICY "Users can share meetings" ON meeting_shares FOR INSERT WITH CHECK (auth.uid() = shared_by);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_group_id ON meetings(group_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_shares_shared_with ON meeting_shares(shared_with);