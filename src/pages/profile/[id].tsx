import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import FollowButton from '../../components/profile/FollowButton';
import Image from 'next/image';

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, likes: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadProfile(id);
      loadPosts(id);
      loadStats(id);
    }
  }, [id]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      router.push('/feed');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      setPosts(data || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const loadStats = async (userId: string) => {
    try {
      // Count posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Count followers
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Count following
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      // Get all user posts to count likes
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', userId);

      let likesCount = 0;
      if (userPosts && userPosts.length > 0) {
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('post_id', userPosts.map(p => p.id));
        likesCount = count || 0;
      }

      setStats({
        posts: postsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
        likes: likesCount
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleFollowChange = (isFollowing: boolean, newFollowerCount: number) => {
    setStats(prev => ({ ...prev, followers: newFollowerCount }));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">😕</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h1>
            <p className="text-gray-600 mb-4">This user doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/feed')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go back to feed
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100">
        <EnhancedNavbar />
        
        <div className="pt-20 pb-8 max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Photo */}
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                ) : (
                  '🎓'
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile.full_name || 'Student'}
                    </h1>
                    <p className="text-xl text-blue-600 mb-4">@{profile.username || profile.id}</p>
                  </div>
                  
                  {/* Follow Button */}
                  <div className="md:ml-4">
                    <FollowButton userId={profile.id} onFollowChange={handleFollowChange} />
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="text-gray-600 mb-4">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
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
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.likes}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>
            
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <p className="text-gray-400">This user hasn't shared anything yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}