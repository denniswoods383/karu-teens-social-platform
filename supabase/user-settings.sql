-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  notifications_likes boolean DEFAULT true,
  notifications_comments boolean DEFAULT true,
  notifications_followers boolean DEFAULT true,
  notifications_messages boolean DEFAULT true,
  notifications_email_digest boolean DEFAULT false,
  notifications_email_security boolean DEFAULT true,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  font_size text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);