-- Meeting recordings table
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration INTEGER,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view recordings of meetings they attended" ON meeting_recordings 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM meeting_participants 
    WHERE meeting_id = meeting_recordings.meeting_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create recordings" ON meeting_recordings 
FOR INSERT WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);