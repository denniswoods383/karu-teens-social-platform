import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';
import CreatePost from './CreatePost';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../../hooks/useSupabase';
import { X } from 'lucide-react';
import useSWR from 'swr';

type FeedFilter = 'all' | 'my_school' | 'my_subjects' | 'unanswered' | 'resources';

interface FeedFilters {
  [key: string]: {
    label: string;
    icon: string;
    color: string;
  };
}

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showComposer, setShowComposer] = useState(false);
  const { user } = useAuth();
  const { ref, inView } = useInView({ threshold: 0 });
  const { data: cachedPosts, mutate } = useSWR(`posts-${activeFilter}`);
  
  const filters: FeedFilters = {
    all: { label: 'All', icon: '🌟', color: 'bg-blue-500' },
    my_school: { label: 'My School', icon: '🏫', color: 'bg-green-500' },
    my_subjects: { label: 'My Subjects', icon: '📚', color: 'bg-purple-500' },
    unanswered: { label: 'Unanswered', icon: '❓', color: 'bg-orange-500' },
    resources: { label: 'Resources', icon: '📄', color: 'bg-indigo-500' }
  };
  
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('university, subjects')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
    };
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (cachedPosts) {
      setPosts(cachedPosts);
      setLoading(false);
    } else {
      loadPosts(0, false);
    }
  }, [cachedPosts, activeFilter]);

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    loadPosts(0, false);
  }, [activeFilter]);

  const handlePostCreated = (post: any) => {
    if (post.isError) {
      setPosts(prev => prev.filter(p => p.id !== post.tempId));
      return;
    }
    
    if (post.isUpdate) {
      setPosts(prev => prev.map(p => p.id === post.tempId ? post : p));
      return;
    }
    
    setPosts(prev => [post, ...prev]);
  };
  
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  }, [inView, hasMore, loading, page]);

  const buildQuery = () => {
    let query = supabase
      .from('posts')
      .select('*');

    // Remove filters for now to show all posts
    // switch (activeFilter) {
    //   case 'my_school':
    //     if (userProfile?.university) {
    //       query = query.eq('profiles.university', userProfile.university);
    //     }
    //     break;
    // }

    return query;
  };

  const calculatePostScore = (post: any) => {
    let score = 0;
    
    // Subject relevance (highest priority)
    if (userProfile?.subjects?.some((subject: string) => 
      post.tags?.includes(subject) || post.content?.toLowerCase().includes(subject.toLowerCase())
    )) {
      score += 100;
    }
    
    // School relevance
    if (userProfile?.university && post.profiles?.university === userProfile.university) {
      score += 50;
    }
    
    // Needs help (questions without accepted answers)
    if (post.type === 'question' && !post.has_accepted_answer) {
      score += 30;
    }
    
    // Has accepted solution (valuable content)
    if (post.has_accepted_answer) {
      score += 20;
    }
    
    // Engagement score
    const likes = post.likes_count || 0;
    const comments = post.comments_count || 0;
    score += (likes * 2) + (comments * 3);
    
    // Recency bonus (decay over time)
    const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    const recencyBonus = Math.max(0, 24 - hoursOld) * 2;
    score += recencyBonus;
    
    return score;
  };

  const loadPosts = async (pageNum = 0, append = false) => {
    try {
      setLoading(true);
      const query = buildQuery()
        .order('created_at', { ascending: false })
        .range(pageNum * POSTS_PER_PAGE, (pageNum + 1) * POSTS_PER_PAGE - 1);
      
      const { data, error } = await query;
      
      if (!error && data) {
        // Sort by calculated score for personalized ranking
        const scoredPosts = data
          .map(post => ({ ...post, score: calculatePostScore(post) }))
          .sort((a, b) => b.score - a.score);
        
        if (scoredPosts.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
        
        const newPosts = append ? [...posts, ...scoredPosts] : scoredPosts;
        setPosts(newPosts);
        
        if (!append) {
          mutate(newPosts, false);
        }
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Sticky Ask Button */}
      <button
        onClick={() => setShowComposer(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 md:hidden"
      >
        <span className="text-xl">❓</span>
      </button>
      
      {/* Mobile Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Post</h3>
              <button
                onClick={() => setShowComposer(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <CreatePost 
                onPostCreated={(post) => {
                  handlePostCreated(post);
                  if (!post.isOptimistic) setShowComposer(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
      {/* Feed Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {Object.entries(filters).map(([key, filter]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as FeedFilter)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === key
                  ? `${filter.color} text-white shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
        
        {activeFilter !== 'all' && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {activeFilter === 'my_school' && userProfile?.university && (
              <span>📍 Showing posts from {userProfile.university}</span>
            )}
            {activeFilter === 'my_subjects' && userProfile?.subjects?.length > 0 && (
              <span>🎯 Filtered by: {userProfile.subjects.join(', ')}</span>
            )}
            {activeFilter === 'unanswered' && (
              <span>❓ Questions that need your help</span>
            )}
            {activeFilter === 'resources' && (
              <span>📚 Study materials and resources</span>
            )}
          </div>
        )}
      </div>
      {posts.length > 0 ? (
        posts.map((post: any, index: number) => (
          <div key={post.id} className={`relative ${post.isOptimistic ? 'opacity-70' : ''}`}>
            <PostCard post={post} />
            {index < 3 && post.score > 50 && !post.isOptimistic && (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                🎯 Relevant
              </div>
            )}
            {post.isOptimistic && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                🚀 Posting...
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {activeFilter === 'my_subjects' ? '📚' : 
             activeFilter === 'my_school' ? '🏫' :
             activeFilter === 'unanswered' ? '❓' :
             activeFilter === 'resources' ? '📄' : '🌟'}
          </div>
          <p className="text-gray-500 text-lg mb-2">
            {activeFilter === 'all' ? 'No posts yet. Be the first to post!' :
             activeFilter === 'my_subjects' ? 'No posts in your subjects yet.' :
             activeFilter === 'my_school' ? 'No posts from your school yet.' :
             activeFilter === 'unanswered' ? 'All questions have been answered! 🎉' :
             'No resources shared yet.'}
          </p>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all posts →
            </button>
          )}
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
    </>
  );
}