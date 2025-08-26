import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { checkRateLimit, rateLimitErrors } from '../../lib/rateLimiting';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
}

export default function FollowButton({ userId, onFollowChange }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (user?.id && userId && user.id !== userId) {
      checkFollowStatus();
      loadFollowerCount();
    }
  }, [user?.id, userId]);

  const checkFollowStatus = async () => {
    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user?.id)
        .eq('following_id', userId)
        .single();
      
      setIsFollowing(!!data);
    } catch (error) {
      setIsFollowing(false);
    }
  };

  const loadFollowerCount = async () => {
    try {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      
      setFollowerCount(count || 0);
    } catch (error) {
      console.error('Failed to load follower count:', error);
    }
  };

  const handleFollow = async () => {
    if (!user?.id || user.id === userId || loading) return;

    // Check rate limit
    const canFollow = await checkRateLimit('follows');
    if (!canFollow) {
      alert(rateLimitErrors.follows);
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (!error) {
          setIsFollowing(false);
          setFollowerCount(prev => prev - 1);
          onFollowChange?.(false, followerCount - 1);
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (!error) {
          setIsFollowing(true);
          setFollowerCount(prev => prev + 1);
          onFollowChange?.(true, followerCount + 1);
        }
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own profile
  if (!user?.id || user.id === userId) {
    return null;
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? '⏳' : isFollowing ? '✓ Following' : '+ Follow'}
    </button>
  );
}