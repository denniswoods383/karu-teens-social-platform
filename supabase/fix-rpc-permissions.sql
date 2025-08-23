-- Fix RPC function permissions
GRANT EXECUTE ON FUNCTION track_user_activity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_streak(UUID) TO authenticated;