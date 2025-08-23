import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

interface CommentLikeButtonProps {
  commentId: string;
}

export default function CommentLikeButton({ commentId }: CommentLikeButtonProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      loadLikesCount();
    }
  }, [commentId, user]);

  const checkLikeStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();
    
    setIsLiked(!!data);
  };

  const loadLikesCount = async () => {
    const { count } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);
    
    setLikesCount(count || 0);
  };

  const handleLike = async () => {
    if (!user) return;

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      if (wasLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Failed to toggle comment like:', error);
    }
  };

  return (
    <button 
      onClick={handleLike}
      className={`flex items-center space-x-1 hover:underline ${
        isLiked ? 'text-red-500' : 'text-gray-500'
      }`}
    >
      <span>{isLiked ? '❤️' : '🤍'}</span>
      <span>{likesCount > 0 ? likesCount : 'Like'}</span>
    </button>
  );
}