-- Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- RLS policies
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_likes_select" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);