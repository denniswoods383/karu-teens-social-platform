import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function ContentControl() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdmin();
    loadPosts();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'denniswood383@gmail.com') {
      router.push('/');
    }
  };

  const loadPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profiles(username, email)
      `)
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const togglePremium = async (postId: string, isPremium: boolean) => {
    const { error } = await supabase
      .from('posts')
      .update({ is_premium: !isPremium })
      .eq('id', postId);
    
    if (!error) {
      loadPosts();
      alert(`Post ${!isPremium ? 'marked as premium' : 'made free'}`);
    }
  };

  const deletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (!error) {
        loadPosts();
        alert('Post deleted successfully');
      }
    }
  };

  const filteredPosts = posts.filter((post: any) =>
    post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">🔒 Content Control</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Total Posts: {posts.length}</p>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4">
            {filteredPosts.map((post: any) => (
              <div key={post.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{post.profiles?.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.is_premium 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.is_premium ? '✨ Premium' : 'Free'}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-800 dark:text-gray-200 mb-4 line-clamp-3">
                  {post.content}
                </p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => togglePremium(post.id, post.is_premium)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      post.is_premium
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {post.is_premium ? 'Make Free' : 'Make Premium'}
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}