-- User activity tracking for streak calculation
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Function to track daily activity
CREATE OR REPLACE FUNCTION track_user_activity(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity (user_id, activity_date, activity_count)
  VALUES (user_uuid, CURRENT_DATE, 1)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET activity_count = user_activity.activity_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user streak
CREATE OR REPLACE FUNCTION get_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
BEGIN
  LOOP
    IF EXISTS (SELECT 1 FROM user_activity WHERE user_id = user_uuid AND activity_date = check_date) THEN
      streak_count := streak_count + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_activity_select" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_activity_insert" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);