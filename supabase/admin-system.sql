-- Create admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  role text DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator')),
  permissions text[] DEFAULT ARRAY['view_reports', 'moderate_content'],
  created_at timestamptz DEFAULT now()
);

-- Create user bans table
CREATE TABLE IF NOT EXISTS user_bans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  banned_by uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  ban_type text DEFAULT 'temporary' CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create content reports table
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES auth.users(id),
  reported_post_id uuid REFERENCES posts(id),
  reported_user_id uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create admin actions log
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert sample admin (replace with actual admin user ID)
INSERT INTO admin_roles (user_id, role, permissions) VALUES
((SELECT id FROM auth.users LIMIT 1), 'admin', ARRAY['view_reports', 'moderate_content', 'ban_users', 'manage_admins']);

-- Create indexes
CREATE INDEX IF NOT EXISTS admin_roles_user_id_idx ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS user_bans_user_id_idx ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status);
CREATE INDEX IF NOT EXISTS admin_actions_admin_id_idx ON admin_actions(admin_id);