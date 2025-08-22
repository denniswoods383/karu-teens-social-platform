-- SQL to run in Supabase Dashboard -> SQL Editor

-- Create marketplace_items table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT CHECK (category IN ('textbooks', 'electronics', 'furniture', 'clothing', 'other')) NOT NULL,
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')) NOT NULL,
  images TEXT[] DEFAULT '{}',
  location TEXT,
  is_available BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_items table for bookmarks
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES marketplace_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Marketplace items policies
CREATE POLICY "Anyone can view available items" ON marketplace_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Users can create their own items" ON marketplace_items
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update their own items" ON marketplace_items
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Users can delete their own items" ON marketplace_items
  FOR DELETE USING (seller_id = auth.uid());

-- Saved items policies
CREATE POLICY "Users can view their saved items" ON saved_items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can save items" ON saved_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove saved items" ON saved_items
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON marketplace_items(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_item_id ON saved_items(item_id);