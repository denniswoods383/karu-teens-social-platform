-- SQL to run in Supabase Dashboard -> SQL Editor

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'text')),
  background_color TEXT DEFAULT 'bg-gradient-to-br from-blue-400 to-purple-500',
  category TEXT CHECK (category IN ('study', 'campus', 'achievement', 'social')) DEFAULT 'social',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create story_views table for tracking who viewed what
CREATE TABLE IF NOT EXISTS story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Create story_likes table
CREATE TABLE IF NOT EXISTS story_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Anyone can view non-expired stories" ON stories
  FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Users can create their own stories" ON stories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stories" ON stories
  FOR UPDATE USING (user_id = auth.uid());

-- Story views policies
CREATE POLICY "Users can view story views" ON story_views
  FOR SELECT USING (true);

CREATE POLICY "Users can create story views" ON story_views
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- Story likes policies
CREATE POLICY "Users can view story likes" ON story_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create story likes" ON story_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their story likes" ON story_likes
  FOR DELETE USING (user_id = auth.uid());

-- Function to auto-delete expired stories
CREATE OR REPLACE FUNCTION delete_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);