import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';

const PostsManagement = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'denniswood383@gmail.com') {
        router.push('/');
        return;
      }
      fetchPosts();
    };
    checkAdmin();
  }, [router]);

  const fetchPosts = async () => {
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      const userIds = Array.from(new Set(postsData?.map(post => post.user_id) || []));
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
      
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        profile: profilesData?.find(profile => profile.id === post.user_id) || null
      })) || [];
      
      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    
    try {
      const response = await fetch('/api/admin-delete-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      
      if (response.ok) {
        alert('Post deleted successfully');
        fetchPosts();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Posts Management</h1>
            <button
              onClick={() => router.push('/mhesh')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Admin
            </button>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.profile?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold">{post.profile?.full_name || post.profile?.username || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                
                {post.content && <p className="mb-4">{post.content}</p>}
                {post.image_url && (
                  <div className="mb-4">
                    {post.image_url.includes('video') ? (
                      <video src={post.image_url} controls className="w-full max-w-md rounded-lg" />
                    ) : (
                      <Image src={post.image_url} alt="Post" width={400} height={300} className="w-full max-w-md rounded-lg" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsManagement;