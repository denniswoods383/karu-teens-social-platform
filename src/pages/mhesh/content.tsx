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

          <div className="space-y-6">
            {filteredPosts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-blue-100 overflow-hidden">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        '🎓'
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {post.profiles?.full_name || post.profiles?.username || 'Student'}
                      </h3>
                      {post.profiles?.username && (
                        <p className="text-sm text-blue-500 font-medium">@{post.profiles.username}</p>
                      )}
                      <div className="flex items-center text-sm text-blue-500 font-medium">
                        <span>⏰ {new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.is_premium 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.is_premium ? '✨ Premium' : '🆓 Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="px-6 pb-4">
                  <p className="text-gray-800 text-lg leading-relaxed font-medium">{post.content}</p>
                </div>
                
                {/* Media */}
                {post.image_url && (
                  <div className="px-6 pb-4">
                    {post.image_url.includes('.mp4') || post.image_url.includes('.webm') || post.image_url.includes('video') ? (
                      <video 
                        src={post.image_url}
                        controls 
                        className="w-full max-h-96 rounded-2xl shadow-lg border-2 border-blue-100"
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={post.image_url}
                        alt="Post media"
                        className="w-full max-h-96 object-cover rounded-2xl shadow-lg border-2 border-blue-100"
                      />
                    )}
                  </div>
                )}
                
                {/* Stats */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <span>👍</span>
                        <span>{post.likes_count || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{post.comments_count || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Admin Actions */}
                <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-t-2 border-red-200">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => togglePremium(post.id, post.is_premium, post.user_id)}
                      className={`flex items-center px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                        post.is_premium
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
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
                      onClick={() => messageUser(post.user_id, post.profiles?.email)}
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