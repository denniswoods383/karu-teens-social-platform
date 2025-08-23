-- Search history and analytics
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Popular searches tracking
CREATE TABLE IF NOT EXISTS popular_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT UNIQUE NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to track search
CREATE OR REPLACE FUNCTION track_search(search_query TEXT, results_count INTEGER DEFAULT 0)
RETURNS VOID AS $$
BEGIN
  -- Add to user's search history
  INSERT INTO search_history (user_id, query, result_count)
  VALUES (auth.uid(), search_query, results_count);
  
  -- Update popular searches
  INSERT INTO popular_searches (query, search_count, last_searched)
  VALUES (search_query, 1, NOW())
  ON CONFLICT (query) 
  DO UPDATE SET 
    search_count = popular_searches.search_count + 1,
    last_searched = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_history_select" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "popular_searches_select" ON popular_searches FOR SELECT USING (true);

GRANT EXECUTE ON FUNCTION track_search(TEXT, INTEGER) TO authenticated;