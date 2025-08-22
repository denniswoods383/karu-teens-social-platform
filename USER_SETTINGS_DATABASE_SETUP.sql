-- SQL to run in Supabase Dashboard -> SQL Editor

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Privacy settings
  profile_visibility TEXT CHECK (profile_visibility IN ('public', 'friends', 'private')) DEFAULT 'public',
  
  -- Notification settings
  notifications_likes BOOLEAN DEFAULT true,
  notifications_comments BOOLEAN DEFAULT true,
  notifications_followers BOOLEAN DEFAULT true,
  notifications_messages BOOLEAN DEFAULT true,
  notifications_email_digest BOOLEAN DEFAULT false,
  notifications_email_security BOOLEAN DEFAULT true,
  
  -- Appearance settings
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'light',
  font_size TEXT CHECK (font_size IN ('small', 'medium', 'large')) DEFAULT 'medium',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);