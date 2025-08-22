-- Rate limiting functions and policies

-- Post rate limit (10 posts/hour)
CREATE OR REPLACE FUNCTION check_post_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM posts WHERE author_id = user_id AND created_at > NOW() - INTERVAL '1 hour') < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Message rate limit (100 messages/hour)
CREATE OR REPLACE FUNCTION check_message_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM messages WHERE sender_id = user_id AND created_at > NOW() - INTERVAL '1 hour') < 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Follow rate limit (50 follows/day)
CREATE OR REPLACE FUNCTION check_follow_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE follower_id = user_id AND created_at > NOW() - INTERVAL '1 day') < 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply rate limiting policies
DROP POLICY IF EXISTS "posts_rate_limit" ON posts;
CREATE POLICY "posts_rate_limit" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id AND check_post_rate_limit(auth.uid()));

DROP POLICY IF EXISTS "messages_rate_limit" ON messages;
CREATE POLICY "messages_rate_limit" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND check_message_rate_limit(auth.uid()));

DROP POLICY IF EXISTS "follows_rate_limit" ON follows;
CREATE POLICY "follows_rate_limit" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id AND check_follow_rate_limit(auth.uid()));