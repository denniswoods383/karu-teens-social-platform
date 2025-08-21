import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import PostCard from '../../components/posts/PostCard';

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
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    setPosts(postsData || []);
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

  const messageUser = async (userId: string, userEmail?: string) => {
    // Get user info if email not provided
    if (!userEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', userId)
        .single();
      userEmail = profile?.username || profile?.email || 'User';
    }
    
    const message = prompt(`Send message to ${userEmail}:`);
    if (!message) return;
    
    // Send as notification instead of message
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: '📢 Admin Message',
        message: `ADMIN: ${message}`,
        type: 'warning'
      });
    
    if (!error) {
      alert('Message sent successfully!');
    } else {
      console.error('Error sending message:', error);
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

          <div className="space-y-6">
            {filteredPosts.map((post: any) => (
              <div key={post.id} className="relative">
                <PostCard post={post} />
                
                {/* Admin Actions Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-sm p-4 rounded-b-2xl">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => togglePremium(post.id, post.is_premium, post.user_id)}
                      className={`flex items-center px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                        post.is_premium
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-yellow-500 text-white hover:bg-yellow-600'
                      }`}
                    >
                      <span className="mr-2">{post.is_premium ? '🔓' : '✨'}</span>
                      {post.is_premium ? 'Make Free' : 'Make Premium'}
                    </button>
                    <button
                      onClick={() => deletePost(post.id, post.user_id)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-all duration-300"
                    >
                      <span className="mr-2">🗑️</span>
                      Delete
                    </button>
                    <button
                      onClick={() => messageUser(post.user_id)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 transition-all duration-300"
                    >
                      <span className="mr-2">📧</span>
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}