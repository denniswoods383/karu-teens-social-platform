import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useSupabase';

export const useOnlineStatus = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const updateLastSeen = async () => {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
    };

    // Update immediately
    updateLastSeen();

    // Update every 2 minutes while user is active
    const interval = setInterval(updateLastSeen, 120000);

    // Update on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateLastSeen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);
};