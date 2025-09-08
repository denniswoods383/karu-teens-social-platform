import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PostFeed from '../../components/posts/PostFeed';
import CreatePost from '../../components/posts/CreatePost';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import GlobalSearch from '../../components/search/GlobalSearch';
import PointsDisplay from '../../components/gamification/PointsDisplay';
import ProfileCompletion from '../../components/profile/ProfileCompletion';
import FeedStories from '../../components/stories/FeedStories';
import RecommendedGroups from '../../components/groups/RecommendedGroups';
import PastPapersHero from '../../components/pastpapers/PastPapersHero';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGamificationStore } from '../../store/gamificationStore';
import PostModal from '../../components/posts/PostModal';

export default function FeedPage() {
  const [refreshPosts, setRefreshPosts] = useState(false);
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const { addPoints } = useGamificationStore();
  const router = useRouter();
  
  const handlePostCreated = () => {
    setRefreshPosts(prev => !prev);
    addPoints(5, 'Posted content');
  };
  
  useEffect(() => {
    // Check for post parameter in URL
    if (router.query.post) {
      setModalPostId(router.query.post as string);
    }
    
    // Listen for post modal events from search
    const handleOpenPostModal = (event: CustomEvent) => {
      setModalPostId(event.detail.postId);
    };
    
    window.addEventListener('openPostModal', handleOpenPostModal as EventListener);
    
    return () => {
      window.removeEventListener('openPostModal', handleOpenPostModal as EventListener);
    };
  }, [router.query]);
  
  const closeModal = () => {
    setModalPostId(null);
    // Remove post parameter from URL without page reload
    if (router.query.post) {
      router.replace('/feed', undefined, { shallow: true });
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        {/* Global Search in Navbar */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-40">
          <GlobalSearch />
        </div>

        <div className="pt-20 pb-24 max-w-3xl mx-auto px-4">
          <div className="space-y-6">
            <PointsDisplay />
            <ProfileCompletion />
            <FeedStories />
            <PastPapersHero />
            <RecommendedGroups />
            <CreatePost onPostCreated={handlePostCreated} />
            <PostFeed key={refreshPosts.toString()} />
          </div>
        </div>
        
        {/* Post Modal */}
        {modalPostId && (
          <PostModal
            postId={modalPostId}
            isOpen={!!modalPostId}
            onClose={closeModal}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}