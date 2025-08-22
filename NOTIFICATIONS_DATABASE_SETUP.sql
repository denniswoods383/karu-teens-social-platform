-- SQL to run in Supabase Dashboard -> SQL Editor

-- Drop and recreate notifications table with correct structure
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'comment', 'follow', 'message', 'post', 'system', 'admin_message', 'info', 'warning')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  related_post_id UUID,
  related_conversation_id UUID,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies (drop existing first)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Allow inserting notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_user_id UUID DEFAULT NULL,
  p_related_post_id UUID DEFAULT NULL,
  p_related_conversation_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, related_user_id, 
    related_post_id, related_conversation_id, data
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_related_user_id,
    p_related_post_id, p_related_conversation_id, p_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for new likes
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  liker_username TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker username
  SELECT username INTO liker_username FROM profiles WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM create_notification(
    post_owner_id,
    'like',
    'New Like',
    COALESCE(liker_username, 'Someone') || ' liked your post',
    NEW.user_id,
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for new follows
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  follower_username TEXT;
BEGIN
  -- Get follower username
  SELECT username INTO follower_username FROM profiles WHERE id = NEW.follower_id;
  
  -- Create notification
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    'New Follower',
    COALESCE(follower_username, 'Someone') || ' started following you',
    NEW.follower_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (only if tables exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes') THEN
    DROP TRIGGER IF EXISTS trigger_notify_on_like ON likes;
    CREATE TRIGGER trigger_notify_on_like
      AFTER INSERT ON likes
      FOR EACH ROW
      EXECUTE FUNCTION notify_on_like();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows') THEN
    DROP TRIGGER IF EXISTS trigger_notify_on_follow ON follows;
    CREATE TRIGGER trigger_notify_on_follow
      AFTER INSERT ON follows
      FOR EACH ROW
      EXECUTE FUNCTION notify_on_follow();
  END IF;
END $$;