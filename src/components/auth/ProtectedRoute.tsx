import { useAuth } from '../../hooks/useSupabase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [banned, setBanned] = useState(false);
  const [banLoading, setBanLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const checkBanStatus = async () => {
      if (!user) {
        setBanLoading(false);
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_banned, banned_until')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        const now = new Date();
        const bannedUntil = profile.banned_until ? new Date(profile.banned_until) : null;
        const isBanned = profile.is_banned && (!bannedUntil || bannedUntil > now);
        
        setBanned(isBanned);
        
        // If ban expired, update database
        if (profile.is_banned && bannedUntil && bannedUntil <= now) {
          await supabase
            .from('profiles')
            .update({ is_banned: false, banned_until: null })
            .eq('id', user.id);
        }
      }
      
      setBanLoading(false);
    };
    
    checkBanStatus();
  }, [user]);

  if (loading || banLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  if (banned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h1>
          <p className="text-gray-600 mb-6">
            Your account has been suspended due to policy violations. 
            Please contact support if you believe this is an error.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}