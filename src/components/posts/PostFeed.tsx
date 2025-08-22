import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PostCard from './PostCard';
import { useInView } from 'react-intersection-observer';

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { ref, inView } = useInView({ threshold: 0 });
  
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    loadPosts(0, false);
  }, []);
  
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  }, [inView, hasMore, loading, page]);

  const loadPosts = async (pageNum = 0, append = false) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1);
      
      if (!error) {
        if (data && data.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
        setPosts(prev => append ? [...prev, ...(data || [])] : (data || []));
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        </div>
      )}
      
      {/* Infinite scroll trigger */}
      {hasMore && posts.length > 0 && (
        <div ref={ref} className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>🎉 You've seen all posts!</p>
        </div>
      )}
    </div>
  );
}