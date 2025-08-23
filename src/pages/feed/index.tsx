import ProtectedRoute from '../../components/auth/ProtectedRoute';
import PostFeed from '../../components/posts/PostFeed';
import CreatePost from '../../components/posts/CreatePost';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import GlobalSearch from '../../components/search/GlobalSearch';
import PointsDisplay from '../../components/gamification/PointsDisplay';
import FeedStories from '../../components/stories/FeedStories';
import { useState } from 'react';
import { useGamificationStore } from '../../store/gamificationStore';

export default function FeedPage() {
  const [refreshPosts, setRefreshPosts] = useState(false);
  const { addPoints } = useGamificationStore();
  
  const handlePostCreated = () => {
    setRefreshPosts(prev => !prev);
    addPoints(5);
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
            <FeedStories />
            <CreatePost onPostCreated={handlePostCreated} />
            <PostFeed key={refreshPosts.toString()} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}