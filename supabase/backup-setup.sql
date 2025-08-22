-- Create error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  stack text,
  url text,
  user_id uuid REFERENCES auth.users(id),
  context jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  properties jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create backup function (requires superuser privileges)
CREATE OR REPLACE FUNCTION create_backup()
RETURNS void AS $$
BEGIN
  -- This would typically be handled by Supabase's built-in backup system
  -- or external backup tools like pg_dump
  RAISE NOTICE 'Backup should be configured in Supabase dashboard';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events(event_name);