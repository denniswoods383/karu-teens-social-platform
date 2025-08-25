import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { getRelativeTime } from '../../utils/timeUtils';
import { Post } from '../../types/post';
import { useRouter } from 'next/router';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { commentSchema, reportSchema, validateData } from '../../lib/validation';
import Comment from '../comments/Comment';
import CommentLikeButton from '../comments/CommentLikeButton';

interface CommentType {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  author: {
    username: string;
    avatar_url: string;
  };
  replies: CommentType[];
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      loadLikesCount();
    }
    loadAuthorProfile();
  }, [post.id, user]);

  const loadAuthorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', post.user_id)
        .single();
      
      console.log('Loading profile for user_id:', post.user_id);
      console.log('Profile data found:', data);
      
      if (data) {
        setAuthorProfile(data);
      } else {
        // Fallback - create basic profile info
        setAuthorProfile({
          username: 'student',
          full_name: 'Student',
          avatar_url: null
        });
      }
    } catch (error) {
      console.error('Failed to load author profile:', error);
      setAuthorProfile({
        username: 'student',
        full_name: 'Student',
        avatar_url: null
      });
    }
  };

  const checkLikeStatus = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.log('Like check error:', error.message);
        setIsLiked(false);
        return;
      }
      
      setIsLiked(!!data);
    } catch (error) {
      console.log('Like check failed:', error);
      setIsLiked(false);
    }
  };

  const loadLikesCount = async () => {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      
      if (error) {
        console.log('Likes count error:', error.message);
        setLikesCount(post.likes_count || 0);
        return;
      }
      
      setLikesCount(count || 0);
    } catch (error) {
      console.log('Likes count failed:', error);
      setLikesCount(post.likes_count || 0);
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:profiles(username, avatar_url)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsById = {};
      const rootComments = [];

      data.forEach(comment => {
        commentsById[comment.id] = { ...comment, replies: [] };
      });

      data.forEach(comment => {
        if (comment.parent_id) {
          commentsById[comment.parent_id]?.replies.push(commentsById[comment.id]);
        } else {
          rootComments.push(commentsById[comment.id]);
        }
      });

      setComments(rootComments);
      setShowComments(true);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async (content: string, parentId: string | null = null) => {
    if (!user) return;

    const validation = validateData(commentSchema, { content, post_id: post.id });
    if (!validation.success) {
      alert('errors' in validation ? validation.errors.join(', ') : 'Validation failed');
      return;
    }

    try {
      const { data: newCommentData, error } = await supabase
        .from('comments')
        .insert({ post_id: post.id, user_id: user.id, content, parent_id: parentId })
        .select('*, author:profiles(username, avatar_url)')
        .single();

      if (error) throw error;

      if (newCommentData) {
        // Refresh comments to show the new one in its thread
        loadCommentsAfterMutation();
      }
      setNewComment(''); // Clear top-level input
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const editComment = async (commentId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: newContent })
        .eq('id', commentId);

      if (error) throw error;

      // Refresh comments to show the change
      loadCommentsAfterMutation();
    } catch(error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const loadCommentsAfterMutation = async () => {
    // This is a simplified refresh. A more advanced implementation might update the state optimistically.
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:profiles(username, avatar_url)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsById = {};
      const rootComments = [];
      data.forEach(comment => {
        commentsById[comment.id] = { ...comment, replies: [] };
      });
      data.forEach(comment => {
        if (comment.parent_id) commentsById[comment.parent_id]?.replies.push(commentsById[comment.id]);
        else rootComments.push(commentsById[comment.id]);
      });
      setComments(rootComments);
    } catch (error) {
      console.error('Failed to refresh comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        if (error) throw error;
        
        // Show push notification for like
        if (post.user_id !== user.id) {
          // showNotification('Post Liked!', {
            // body: `Someone liked your post: "${post.content.substring(0, 50)}..."`,
            // tag: `like-${post.id}`,
            // data: { url: `/feed?post=${post.id}` }
          // });
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle like:', error);
    }
  };

  const handleReport = async () => {
    setShowReportModal(true);
    setShowDropdown(false);
  };

  const submitReport = async (reason: string, details: string) => {
    const validation = validateData(reportSchema, {
      reason,
      details,
      reported_post_id: post.id,
      reported_user_id: post.user_id
    });

    if (!validation.success) {
      alert('errors' in validation ? validation.errors.join(', ') : 'Validation failed');
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user?.id,
          reported_post_id: post.id,
          reported_user_id: post.user_id,
          reason,
          details,
          status: 'pending'
        });
      
      if (!error) {
        alert('Report submitted successfully. Thank you for helping keep our community safe.');
        setShowReportModal(false);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const sharePost = async (method: string) => {
    const postUrl = `${window.location.origin}/feed?post=${post.id}`;
    const shareText = `Check out this post: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;
    
    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        alert('Link copied to clipboard!');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'Karu Teens Post',
            text: shareText,
            url: postUrl
          });
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`);
        break;
    }
    setShowShareModal(false);
  };

  const handleHide = () => {
    setIsHidden(true);
    setShowDropdown(false);
  };

  const handleFollow = async () => {
    setIsFollowing(true);
    setShowDropdown(false);
  };

  const handleMessage = async () => {
    if (!user || user.id === post.user_id) return;
    
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${post.user_id}),and(user1_id.eq.${post.user_id},user2_id.eq.${user.id})`)
        .single();
      
      if (existingConversation) {
        router.push(`/messages?conversation=${existingConversation.id}`);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: post.user_id
          })
          .select('id')
          .single();
        
        if (!error && newConversation) {
          router.push(`/messages?conversation=${newConversation.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-blue-100 mb-6 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center">
          <button
            onClick={() => window.location.href = `/profile/${post.user_id}`}
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-blue-100 overflow-hidden hover:ring-6 hover:ring-blue-200 transition-all duration-300 cursor-pointer"
          >
            {authorProfile?.avatar_url ? (
              <Image src={authorProfile.avatar_url} alt="Profile" width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              '🎓'
            )}
          </button>
          <div className="ml-3 flex-1">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => window.location.href = `/profile/${post.user_id}`}
                className="text-left"
              >
                <h3 className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors text-lg">
                  {authorProfile?.full_name || authorProfile?.username || 'Student'}
                </h3>
                {authorProfile?.username && (
                  <p className="text-sm text-blue-500 font-medium hover:text-blue-700 transition-colors">@{authorProfile.username}</p>
                )}
              </button>
            </div>
            <div className="flex items-center text-sm text-blue-500 font-medium">
              <span>⏰ {getRelativeTime(post.created_at)}</span>
              <span className="mx-2">•</span>
              <span>🌍 Public</span>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-400 hover:bg-gray-100 rounded-full p-2"
            >
              •••
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleReport}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 rounded-t-lg"
                >
                  🚨 Report Post
                </button>
                <button
                  onClick={handleHide}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  🙈 Hide Post
                </button>
                <button
                  onClick={handleFollow}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-blue-600 rounded-b-lg"
                  disabled={isFollowing}
                >
                  {isFollowing ? '✅ Following' : '👤 Follow User'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="px-6 pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => window.dispatchEvent(new CustomEvent('openPostModal', { detail: { postId: post.id } }))}
      >
        <p className="text-gray-800 text-lg leading-relaxed font-medium">{post.content}</p>
      </div>
      
      {/* Media */}
      {((post as any).media_urls || post.image_url) && (
        <div className="px-6 pb-4">
          {(post as any).media_urls && (post as any).media_urls.length > 1 ? (
            <div className="grid grid-cols-2 gap-2">
              {(post as any).media_urls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative">
                  {url.includes('.mp4') || url.includes('.webm') || url.includes('video') ? (
                    <video 
                      src={url}
                      controls 
                      className="w-full h-48 object-cover rounded-xl shadow-lg border border-blue-100"
                      preload="metadata"
                    />
                  ) : url.includes('.pdf') || url.includes('.doc') || url.includes('.txt') || url.includes('.zip') || url.includes('.rar') || url.includes('.ppt') || url.includes('.xls') || url.includes('.csv') || url.includes('.json') || url.includes('.xml') ? (
                    <div 
                      className="w-full h-48 bg-gray-100 rounded-xl shadow-lg border border-blue-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={async () => {
                        try {
                          // Try direct download first
                          const response = await fetch(url, { method: 'HEAD' });
                          if (response.ok) {
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = url.split('/').pop() || 'document';
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            // Fallback: open in new tab if direct download fails
                            window.open(url, '_blank');
                          }
                        } catch (error) {
                          // If fetch fails, try opening in new tab
                          window.open(url, '_blank');
                        }
                      }}
                    >
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">
                          {url.includes('.pdf') ? '📄' : 
                           url.includes('.doc') ? '📄' : 
                           url.includes('.ppt') ? '📊' :
                           url.includes('.xls') ? '📈' :
                           url.includes('.zip') || url.includes('.rar') ? '🗂️' : 
                           url.includes('.txt') ? '📄' :
                           url.includes('.csv') || url.includes('.json') || url.includes('.xml') ? '📋' : '📁'}
                        </span>
                        <p className="text-sm text-gray-600 font-medium">Document</p>
                        <p className="text-xs text-blue-600">Click to download</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-48 object-cover rounded-xl shadow-lg border border-blue-100 cursor-pointer"
                      onClick={() => window.open(url, '_blank')}
                    />
                  )}
                  {(post as any).media_urls.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">+{(post as any).media_urls.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {(post.image_url?.includes('.mp4') || post.image_url?.includes('.webm') || post.image_url?.includes('video')) ? (
                <video 
                  src={post.image_url}
                  controls 
                  className="w-full max-h-96 rounded-2xl shadow-lg border-2 border-blue-100"
                  preload="metadata"
                />
              ) : (post.image_url?.includes('.pdf') || post.image_url?.includes('.doc') || post.image_url?.includes('.txt') || post.image_url?.includes('.zip') || post.image_url?.includes('.rar') || post.image_url?.includes('.ppt') || post.image_url?.includes('.xls') || post.image_url?.includes('.csv') || post.image_url?.includes('.json') || post.image_url?.includes('.xml')) ? (
                <div 
                  className="w-full h-64 bg-gray-100 rounded-2xl shadow-lg border-2 border-blue-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={async () => {
                    try {
                      // Try direct download first
                      const response = await fetch(post.image_url, { method: 'HEAD' });
                      if (response.ok) {
                        const link = document.createElement('a');
                        link.href = post.image_url;
                        link.download = post.image_url.split('/').pop() || 'document';
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } else {
                        // Fallback: open in new tab if direct download fails
                        window.open(post.image_url, '_blank');
                      }
                    } catch (error) {
                      // If fetch fails, try opening in new tab
                      window.open(post.image_url, '_blank');
                    }
                  }}
                >
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">
                      {post.image_url?.includes('.pdf') ? '📄' : 
                       post.image_url?.includes('.doc') ? '📄' : 
                       post.image_url?.includes('.ppt') ? '📊' :
                       post.image_url?.includes('.xls') ? '📈' :
                       post.image_url?.includes('.zip') || post.image_url?.includes('.rar') ? '🗂️' : 
                       post.image_url?.includes('.txt') ? '📄' :
                       post.image_url?.includes('.csv') || post.image_url?.includes('.json') || post.image_url?.includes('.xml') ? '📋' : '📁'}
                    </span>
                    <p className="text-lg text-gray-700 font-medium mb-2">Document Attached</p>
                    <p className="text-sm text-blue-600">Click to download</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={post.image_url}
                  alt="Post media"
                  className="w-full max-h-96 object-cover rounded-2xl shadow-lg border-2 border-blue-100"
                />
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Reactions Summary */}
      {(likesCount > 0 || post.comments_count > 0) && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            {likesCount > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">👍</span>
                  </div>
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">❤️</span>
                  </div>
                </div>
                <span>{likesCount}</span>
              </div>
            )}
            {post.comments_count > 0 && (
              <button 
                onClick={loadComments}
                className="hover:underline"
              >
                {post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={handleLike}
            className={`group flex items-center justify-center px-4 py-3 rounded-full flex-1 transition-all duration-300 transform hover:scale-105 font-semibold border-2 ${
              isLiked 
                ? 'text-red-500 bg-red-50 border-red-200 shadow-lg shadow-red-100' 
                : 'text-gray-600 bg-white border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-md'
            }`}
          >
            <span className={`text-xl mr-2 transition-transform duration-300 ${
              isLiked ? 'animate-pulse' : 'group-hover:scale-125'
            }`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className="text-sm">{likesCount > 0 ? likesCount : 'Like'}</span>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openPostModal', { detail: { postId: post.id } }))}
            className="group flex items-center justify-center px-3 py-3 rounded-full flex-1 text-gray-600 bg-white border-2 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md mx-1"
          >
            <span className="text-xl mr-2 transition-transform duration-300 group-hover:scale-125">💬</span>
            <span className="text-sm">Comment</span>
          </button>
          
          {user && user.id !== post.user_id && (
            <button 
              onClick={handleMessage}
              className="group flex items-center justify-center px-3 py-3 rounded-full flex-1 text-gray-600 bg-white border-2 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md mx-1"
            >
              <MessageCircle className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-125" />
              <span className="text-sm">Message</span>
            </button>
          )}
          
          <button 
            onClick={handleShare}
            className="group flex items-center justify-center px-3 py-3 rounded-full flex-1 text-gray-600 bg-white border-2 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md"
          >
            <span className="text-xl mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">📤</span>
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4">
          {/* New Comment Form */}
          <div className="flex space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex-shrink-0"></div>
            <form onSubmit={(e) => { e.preventDefault(); addComment(newComment); }} className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full">Post</button>
            </form>
          </div>

          {loadingComments ? (
            <p>Loading comments...</p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} onReply={addComment} onEdit={editComment} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Share Post</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => sharePost('copy')}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🔗</span>
                  <span className="font-medium">Copy Link</span>
                </button>
                
                {navigator.share && (
                  <button
                    onClick={() => sharePost('native')}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">📤</span>
                    <span className="font-medium">Share via...</span>
                  </button>
                )}
                
                <button
                  onClick={() => sharePost('twitter')}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🐦</span>
                  <span className="font-medium">Share on Twitter</span>
                </button>
                
                <button
                  onClick={() => sharePost('facebook')}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-2xl">🔵</span>
                  <span className="font-medium">Share on Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Report Post</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const reason = formData.get('reason') as string;
                const details = formData.get('details') as string;
                submitReport(reason, details);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for reporting</label>
                    <select name="reason" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                      <option value="">Select a reason</option>
                      <option value="spam">Spam</option>
                      <option value="harassment">Harassment</option>
                      <option value="inappropriate">Inappropriate content</option>
                      <option value="misinformation">Misinformation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional details (optional)</label>
                    <textarea
                      name="details"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Please provide more details about why you're reporting this post..."
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}