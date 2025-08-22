-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create FAQ table
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  search_vector tsvector,
  created_at timestamptz DEFAULT now()
);

-- Insert default FAQ items
INSERT INTO faq_items (question, answer, category) VALUES
('How do I create a post?', 'Click the "What''s on your mind?" box on your feed, type your message, and click "Share".', 'posts'),
('How do I follow comrades?', 'Go to the Comrades page and click "Follow" next to users you want to follow.', 'social'),
('How do I send messages?', 'Click on Messages in the navigation bar or click the message icon to start a conversation.', 'messages'),
('How do I edit my profile?', 'Click on your profile picture in the top right, then select "My Profile" and click edit.', 'profile'),
('How do I report inappropriate content?', 'Click the three dots (⋯) on any post and select "Report Post" to flag inappropriate content.', 'moderation');

-- Create search function for FAQ
CREATE OR REPLACE FUNCTION search_faq(search_query text)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  category text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.question,
    f.answer,
    f.category,
    ts_rank(f.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM faq_items f
  WHERE f.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Update search vector for FAQ
UPDATE faq_items SET search_vector = to_tsvector('english', question || ' ' || answer);

-- Create indexes
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS faq_search_idx ON faq_items USING gin(search_vector);