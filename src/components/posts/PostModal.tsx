import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { X, Heart, MessageCircle, Share2 } from 'lucide-react';
import { getRelativeTime } from '../../utils/timeUtils';

interface PostModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ postId, isOpen, onClose }: PostModalProps) {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && postId) {
      loadPost();
      loadComments();
    }
  }, [isOpen, postId]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(username, full_name, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);

      // Check if liked
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();
        
        setIsLiked(!!likeData);
      }

      // Get likes count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      setLikesCount(count || 0);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey(username, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (!error) {
        setNewComment('');
        loadComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/feed?post=${postId}`;
    navigator.clipboard.writeText(url);
    alert('Post link copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading post...</p>
          </div>
        ) : post ? (
          <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
            {/* Post Content */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    post.profiles?.full_name?.charAt(0) || '🎓'
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {post.profiles?.full_name || post.profiles?.username || 'Student'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {getRelativeTime(post.created_at)}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-800 dark:text-gray-200 mb-4">{post.content}</p>
              
              {post.image_url && (
                <img 
                  src={post.image_url} 
                  alt="Post media" 
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              )}

              {/* Actions */}
              <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
                    isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-6">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Comments</h5>
              
              {/* Add Comment */}
              {user && (
                <form onSubmit={handleComment} className="mb-6">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase() || '🎓'}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        comment.profiles?.full_name?.charAt(0) || '🎓'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.profiles?.full_name || comment.profiles?.username || 'Student'}
                        </p>
                        <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(comment.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Post not found</p>
          </div>
        )}
      </div>
    </div>
  );
}