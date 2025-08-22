-- Enable full-text search for posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index for full-text search on posts
CREATE INDEX IF NOT EXISTS posts_search_idx ON posts USING gin(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS posts_search_vector_update ON posts;
CREATE TRIGGER posts_search_vector_update
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_search_vector();

-- Update existing posts
UPDATE posts SET search_vector = to_tsvector('english', content) WHERE content IS NOT NULL;

-- Create search function for better performance
CREATE OR REPLACE FUNCTION search_posts(search_query text)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.created_at,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM posts p
  WHERE p.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;