-- Create movies table
CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_url TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('movie', 'series')) DEFAULT 'movie',
  genre VARCHAR(100),
  rating DECIMAL(3,1) DEFAULT 0,
  duration VARCHAR(50),
  is_live BOOLEAN DEFAULT false,
  viewers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Allow all users to read movies
CREATE POLICY "Movies are viewable by everyone" ON movies
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage movies" ON movies
  FOR ALL USING (auth.role() = 'authenticated');