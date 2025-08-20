import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';

interface Story {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  content: {
    type: 'image' | 'video' | 'text';
    media?: string;
    text?: string;
    backgroundColor?: string;
  };
  timestamp: string;
  views: number;
  isViewed: boolean;
  category: 'study' | 'campus' | 'achievement' | 'social';
  tags: string[];
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const { addPoints } = useGamificationStore();
  const { isPremium } = usePremiumStore();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    const sampleStories: Story[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Kim',
          avatar: '/api/placeholder/40/40',
          isVerified: true
        },
        content: {
          type: 'text',
          text: 'Just aced my Calculus exam! 🎉 The study group sessions really helped. Thanks everyone!',
          backgroundColor: 'bg-gradient-to-br from-green-400 to-blue-500'
        },
        timestamp: '2025-01-20T10:30:00',
        views: 234,
        isViewed: false,
        category: 'achievement',
        tags: ['calculus', 'exam', 'success']
      },
      {
        id: '2',
        author: {
          name: 'Alex Chen',
          avatar: '/api/placeholder/40/40',
          isVerified: false
        },
        content: {
          type: 'image',
          media: '/api/placeholder/400/600',
          text: 'Late night coding session in the library 💻 Building my final project!'
        },
        timestamp: '2025-01-20T02:15:00',
        views: 89,
        isViewed: true,
        category: 'study',
        tags: ['coding', 'library', 'project']
      },
      {
        id: '3',
        author: {
          name: 'Maria Rodriguez',
          avatar: '/api/placeholder/40/40',
          isVerified: true
        },
        content: {
          type: 'text',
          text: 'Chemistry lab explosion today! 🧪💥 Everyone is safe, just a colorful surprise 😅',
          backgroundColor: 'bg-gradient-to-br from-purple-400 to-pink-500'
        },
        timestamp: '2025-01-19T14:45:00',
        views: 456,
        isViewed: false,
        category: 'campus',
        tags: ['chemistry', 'lab', 'science']
      },
      {
        id: '4',
        author: {
          name: 'David Liu',
          avatar: '/api/placeholder/40/40',
          isVerified: true
        },
        content: {
          type: 'image',
          media: '/api/placeholder/400/600',
          text: 'Study group meetup at the campus café ☕ Physics problems made easier with friends!'
        },
        timestamp: '2025-01-19T16:20:00',
        views: 167,
        isViewed: true,
        category: 'social',
        tags: ['study-group', 'physics', 'friends']
      },
      {
        id: '5',
        author: {
          name: 'Jessica Park',
          avatar: '/api/placeholder/40/40',
          isVerified: false
        },
        content: {
          type: 'text',
          text: 'Reached Level 15 on KaruTeens! 🏆 The gamification system really motivates me to stay active.',
          backgroundColor: 'bg-gradient-to-br from-yellow-400 to-orange-500'
        },
        timestamp: '2025-01-19T12:00:00',
        views: 203,
        isViewed: false,
        category: 'achievement',
        tags: ['level-up', 'gamification', 'milestone']
      }
    ];
    
    setStories(sampleStories);
  };

  const categories = [
    { id: 'all', name: 'All Stories', icon: '📱' },
    { id: 'study', name: 'Study Life', icon: '📚' },
    { id: 'campus', name: 'Campus Life', icon: '🏫' },
    { id: 'achievement', name: 'Achievements', icon: '🏆' },
    { id: 'social', name: 'Social', icon: '👥' }
  ];

  const filteredStories = stories.filter(story => 
    filterCategory === 'all' || story.category === filterCategory
  );

  const handleViewStory = (story: Story) => {
    setSelectedStory(story);
    if (!story.isViewed) {
      addPoints(1, 'viewing a story');
      // Mark as viewed
      setStories(prev => prev.map(s => 
        s.id === story.id ? { ...s, isViewed: true, views: s.views + 1 } : s
      ));
    }
  };

  const handleCreateStory = () => {
    addPoints(8, 'creating a story');
    alert('📱 Story created! +8 XP for sharing your campus life!');
    setShowCreateModal(false);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const storyTime = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - storyTime.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study': return 'bg-blue-500';
      case 'campus': return 'bg-green-500';
      case 'achievement': return 'bg-yellow-500';
      case 'social': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  📱 Campus Stories
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Share your daily campus moments and academic journey
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>⏰ Stories disappear after 24 hours</span>
                  <span>👁️ See who viewed your story</span>
                  <span>🎯 Earn XP for engagement</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <span>📱</span>
                <span>Create Story</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setFilterCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filterCategory === category.id
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 ring-2 ring-purple-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleViewStory(story)}
                className={`relative cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
                  !story.isViewed ? 'ring-3 ring-purple-500 ring-opacity-50' : ''
                }`}
              >
                {/* Story Preview */}
                <div className="aspect-[9/16] relative">
                  {story.content.type === 'image' ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <span className="text-4xl">📷</span>
                    </div>
                  ) : (
                    <div className={`w-full h-full ${story.content.backgroundColor || 'bg-gradient-to-br from-blue-400 to-purple-500'} flex items-center justify-center p-4`}>
                      <p className="text-white font-medium text-center text-sm leading-relaxed">
                        {story.content.text}
                      </p>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />

                  {/* Category Badge */}
                  <div className={`absolute top-3 right-3 w-6 h-6 ${getCategoryColor(story.category)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs">
                      {categories.find(c => c.id === story.category)?.icon}
                    </span>
                  </div>

                  {/* New Indicator */}
                  {!story.isViewed && (
                    <div className="absolute top-3 left-3 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  )}

                  {/* Author Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {story.author.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <p className="text-white font-medium text-sm truncate">
                            {story.author.name}
                          </p>
                          {story.author.isVerified && (
                            <span className="text-blue-400 text-xs">✓</span>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs">
                          {getTimeAgo(story.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Stats */}
                <div className="p-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>👁️ {story.views} views</span>
                    <div className="flex items-center space-x-2">
                      {story.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No stories found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to share your campus story!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200"
              >
                Create Your First Story
              </button>
            </div>
          )}

          {/* Story Creation Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      📱 Create Story
                    </h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <span className="text-xl">✕</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Story Type
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="text-2xl mb-1">📝</div>
                          <div className="text-xs">Text</div>
                        </button>
                        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="text-2xl mb-1">📷</div>
                          <div className="text-xs">Photo</div>
                        </button>
                        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="text-2xl mb-1">🎥</div>
                          <div className="text-xs">Video</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="study">📚 Study Life</option>
                        <option value="campus">🏫 Campus Life</option>
                        <option value="achievement">🏆 Achievement</option>
                        <option value="social">👥 Social</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Caption
                      </label>
                      <textarea
                        placeholder="Share what's happening in your academic journey..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateStory}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200"
                      >
                        📱 Share Story (+8 XP)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Story Viewer Modal */}
          {selectedStory && (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-6 right-6 text-white text-2xl hover:text-gray-300 z-10"
              >
                ✕
              </button>
              
              <div className="max-w-md w-full mx-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[9/16] relative">
                    {selectedStory.content.type === 'image' ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                        <span className="text-6xl">📷</span>
                      </div>
                    ) : (
                      <div className={`w-full h-full ${selectedStory.content.backgroundColor} flex items-center justify-center p-6`}>
                        <p className="text-white font-medium text-center text-lg leading-relaxed">
                          {selectedStory.content.text}
                        </p>
                      </div>
                    )}
                    
                    {/* Story Header */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {selectedStory.author.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">
                              {selectedStory.author.name}
                            </p>
                            {selectedStory.author.isVerified && (
                              <span className="text-blue-400">✓</span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">
                            {getTimeAgo(selectedStory.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Story Actions */}
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                          <span>❤️</span>
                          <span>Like</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                          <span>💬</span>
                          <span>Reply</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        👁️ {selectedStory.views} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}