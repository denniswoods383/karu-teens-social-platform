-- MWAKS study materials system
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_code VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  year_level INTEGER NOT NULL,
  category VARCHAR(50) DEFAULT 'notes',
  uploaded_by UUID REFERENCES profiles(id),
  download_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User bookmarks for study materials
CREATE TABLE IF NOT EXISTS material_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Download tracking
CREATE TABLE IF NOT EXISTS material_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES study_materials(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_downloads ENABLE ROW LEVEL SECURITY;

-- Study materials policies (premium users only)
CREATE POLICY "study_materials_select" ON study_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_premium = true)
);

-- Bookmarks policies
CREATE POLICY "material_bookmarks_select" ON material_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "material_bookmarks_insert" ON material_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "material_bookmarks_delete" ON material_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Downloads policies
CREATE POLICY "material_downloads_select" ON material_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "material_downloads_insert" ON material_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to track downloads
CREATE OR REPLACE FUNCTION track_material_download(material_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert download record
  INSERT INTO material_downloads (user_id, material_id)
  VALUES (auth.uid(), material_uuid);
  
  -- Increment download count
  UPDATE study_materials 
  SET download_count = download_count + 1 
  WHERE id = material_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION track_material_download(UUID) TO authenticated;