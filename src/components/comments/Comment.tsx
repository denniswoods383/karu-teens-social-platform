import { useState } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import CommentLikeButton from './CommentLikeButton';
import Image from 'next/image';

// We'll expand this later
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

interface CommentProps {
  comment: CommentType;
  onReply: (postId: string, commentId: string, content: string) => void;
  onEdit: (commentId: string, newContent: string) => void;
}

export default function Comment({ comment, onReply, onEdit }: CommentProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.post_id, comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEditSubmit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex space-x-3 py-2">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0">
        {comment.author?.avatar_url ? (
          <Image src={comment.author.avatar_url} alt={comment.author.username} width={32} height={32} className="rounded-full" />
        ) : (
          <span className="text-white font-bold flex items-center justify-center h-full">
            {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{comment.author?.username || 'User'}</p>
          {!isEditing ? (
            <p className="text-gray-900 dark:text-gray-100">{comment.content}</p>
          ) : (
            <div className="flex space-x-2 mt-1">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-800"
              />
              <button onClick={handleEditSubmit} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <CommentLikeButton commentId={comment.id} />
          <button onClick={() => setIsReplying(!isReplying)} className="hover:underline">Reply</button>
          {user?.id === comment.user_id && (
            <button onClick={() => setIsEditing(!isEditing)} className="hover:underline">Edit</button>
          )}
          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
        </div>

        {isReplying && (
          <div className="flex space-x-2 mt-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-800"
            />
            <button onClick={handleReplySubmit} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Reply</button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
            {comment.replies.map(reply => (
              <Comment key={reply.id} comment={reply} onReply={onReply} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
