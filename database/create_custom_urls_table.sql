-- Create custom_urls table
CREATE TABLE IF NOT EXISTS custom_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  mpesa_transaction_id TEXT,
  price DECIMAL DEFAULT 30.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(claimed_by) -- User can only claim one URL
);

-- Enable RLS
ALTER TABLE custom_urls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all URLs" ON custom_urls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view unclaimed URLs" ON custom_urls
  FOR SELECT USING (claimed_by IS NULL OR claimed_by = auth.uid());

CREATE POLICY "Users can claim URLs" ON custom_urls
  FOR UPDATE USING (
    claimed_by IS NULL 
    AND NOT EXISTS (
      SELECT 1 FROM custom_urls 
      WHERE claimed_by = auth.uid()
    )
  );

-- Add is_admin column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;