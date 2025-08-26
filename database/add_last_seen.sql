-- Add last_seen column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing users to have current timestamp
UPDATE profiles SET last_seen = NOW() WHERE last_seen IS NULL;

-- Create function to update last_seen automatically
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen on profile updates
DROP TRIGGER IF EXISTS update_profiles_last_seen ON profiles;
CREATE TRIGGER update_profiles_last_seen
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();