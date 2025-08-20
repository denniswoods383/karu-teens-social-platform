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
    // First try to get posts with user info
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Posts loaded:', postsData);
    console.log('Posts error:', postsError);
    console.log('Posts count:', postsData?.length || 0);
    
    if (postsData) {
      // Get user info separately for each post
      const postsWithProfiles = await Promise.all(
        postsData.map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('id', post.user_id)
            .single();
          
          return {
            ...post,
            profiles: profile
          };
        })
      );
      
      setPosts(postsWithProfiles);
    } else {
      setPosts([]);
    }
  };

  const togglePremium = async (postId: string, isPremium: boolean, authorId: string) => {
    const { error } = await supabase
      .from('posts')
      .update({ is_premium: !isPremium })
      .eq('id', postId);
    
    if (!error) {
      // Send notification to post author
      await supabase
        .from('notifications')
        .insert({
          user_id: authorId,
          title: !isPremium ? '🔒 Post Made Premium' : '🎆 Post Made Free',
          message: !isPremium 
            ? 'One of your posts has been marked as premium content by an administrator.'
            : 'One of your premium posts has been made free by an administrator.',
          type: 'info'
        });
      
      loadPosts();
      alert(`Post ${!isPremium ? 'marked as premium' : 'made free'}`);
    }
  };

  const messageUser = async (userId: string, userEmail: string) => {
    const message = prompt(`Send message to ${userEmail}:`);
    if (!message) return;
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '📧 Message from Admin',
        message: message,
        type: 'info'
      });
    
    if (!error) {
      alert('Message sent successfully!');
    } else {
      alert('Failed to send message');
    }
  };
  
  const deletePost = async (postId: string, authorId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (!error) {
        // Send notification to post author
        await supabase
          .from('notifications')
          .insert({
            user_id: authorId,
            title: '🗑️ Post Deleted',
            message: 'One of your posts has been deleted by an administrator for violating community guidelines.',
            type: 'warning'
          });
        
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
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Posts</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {posts.filter(p => p.is_premium).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Premium Posts</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {posts.filter(p => !p.is_premium).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Free Posts</div>
            </div>
          </div>
          
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
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => togglePremium(post.id, post.is_premium, post.user_id)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      post.is_premium
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {post.is_premium ? 'Make Free' : 'Make Premium'}
                  </button>
                  <button
                    onClick={() => deletePost(post.id, post.user_id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => messageUser(post.user_id, post.profiles?.email)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  >
                    Message User
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