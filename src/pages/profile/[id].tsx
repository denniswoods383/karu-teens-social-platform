import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import Image from 'next/image';

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function UserProfilePage({ initialProfile, initialPosts, initialStats }) {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(initialProfile);
  const [posts, setPosts] = useState(initialPosts);
  const [stats, setStats] = useState(initialStats);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      checkFollowStatus();
    }
  }, [id, user]);

  const checkFollowStatus = async () => {
    if (!user || user.id === id) return;
    
    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .single();
      
      setIsFollowing(!!data);
    } catch (error) {
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!user || user.id === id) return;

    const originalIsFollowing = isFollowing;
    setIsFollowing(!originalIsFollowing);
    setStats(prev => ({
      ...prev,
      followers: originalIsFollowing ? prev.followers - 1 : prev.followers + 1
    }));

    try {
      if (originalIsFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: id as string,
          });
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Revert optimistic update
      setIsFollowing(originalIsFollowing);
      setStats(prev => ({
        ...prev,
        followers: originalIsFollowing ? prev.followers + 1 : prev.followers - 1
      }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100">
        <EnhancedNavbar />
        
        <div className="pt-16 sm:pt-20 pb-20 sm:pb-8 max-w-4xl mx-auto px-2 sm:px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
              {/* Profile Photo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl sm:text-4xl font-bold shadow-2xl">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                ) : (
                  '🎓'
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {profile.full_name || 'Student'}
                </h1>
                <p className="text-lg sm:text-xl text-blue-600 mb-4">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-gray-600 mb-4">{profile.bio}</p>
                )}

                {profile.location && (
                  <p className="text-gray-500 mb-4">📍 {profile.location}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.posts}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.following}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>

                {/* Follow Button (only if not own profile) */}
                {user?.id !== id && (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                    }`}
                  >
                    {isFollowing ? '✅ Following' : '➕ Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Posts</h2>
            
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {posts.map((post: any) => (
                  <div key={post.id} className="bg-gray-50 rounded-2xl p-4">
                    {post.image_url && (
                      <div className="mb-3">
                        {post.image_url.includes('.mp4') || post.image_url.includes('.webm') ? (
                          <video src={post.image_url} className="w-full h-40 object-cover rounded-lg" />
                        ) : (
                          <Image src={post.image_url} alt="Post" width={400} height={160} className="w-full h-40 object-cover rounded-lg" />
                        )}
                      </div>
                    )}
                    
                    <p className="text-gray-800 text-sm mb-2 line-clamp-3">{post.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📝</span>
                <p className="text-gray-500 text-lg">No posts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export const getServerSideProps = async (ctx) => {
  const { id } = ctx.params;
  const supabase = createServerSupabaseClient(ctx);

  const [profileRes, postsRes, followersRes, followingRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('posts').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id)
  ]);

  if (profileRes.error) {
    console.error('SSR Error fetching profile:', profileRes.error.message);
    return { notFound: true };
  }

  const initialProfile = profileRes.data;
  const initialPosts = postsRes.data || [];
  const initialStats = {
    posts: initialPosts.length,
    followers: followersRes.count || 0,
    following: followingRes.count || 0,
    likes: 0
  };

  return {
    props: {
      initialProfile,
      initialPosts,
      initialStats,
    },
  };
};