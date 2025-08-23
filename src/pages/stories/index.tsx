import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';

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
  const { data: cachedStories, mutate } = useSWR('stories');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { ref, inView } = useInView({ threshold: 0 });
  
  const STORIES_PER_PAGE = 20;
  const { addPoints } = useGamificationStore();
  const { isPremium } = usePremiumStore();
  const { user } = useAuth();

  useEffect(() => {
    if (cachedStories) {
      const formattedStories = cachedStories.map((story: any) => ({
        id: story.id,
        author: { name: 'Student', avatar: '', isVerified: false },
        content: { type: story.media_type || 'text', text: story.content, media: story.media_url },
        timestamp: story.created_at,
        views: story.views_count || 0,
        isViewed: false,
        category: story.category,
        tags: []
      }));
      setStories(formattedStories);
    } else {
      loadStories(0, false);
    }
  }, [cachedStories]);
  
  useEffect(() => {
    if (inView && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadStories(nextPage, true);
    }
  }, [inView, hasMore, page]);

  const loadStories = async (pageNum = 0, append = false) => {
    try {
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .range(pageNum * STORIES_PER_PAGE, (pageNum + 1) * STORIES_PER_PAGE - 1);
      
      if (error) {
        console.error('Error loading stories:', error);
        return;
      }
      
      if (storiesData && storiesData.length < STORIES_PER_PAGE) {
        setHasMore(false);
      }
      
      // Get unique user IDs
      const userIds = Array.from(new Set(storiesData?.map(story => story.user_id) || []));
      
      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);
      
      // Get story views for current user
      const { data: userViews } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', user?.id || '');
      
      const viewedStoryIds = new Set(userViews?.map(v => v.story_id) || []);
      
      const formattedStories = storiesData?.map(story => {
        const profile = profiles?.find(p => p.id === story.user_id);
        return {
          id: story.id,
          author: {
            name: profile?.full_name || profile?.username || 'Student',
            avatar: profile?.avatar_url || '',
            isVerified: false
          },
          content: {
            type: story.media_type || 'text',
            text: story.content,
            media: story.media_url,
            backgroundColor: story.background_color
          },
          timestamp: story.created_at,
          views: story.views_count || 0,
          isViewed: viewedStoryIds.has(story.id),
          category: story.category,
          tags: []
        };
      }) || [];
      
      const newStories = append ? [...stories, ...formattedStories] : formattedStories;
      setStories(newStories);
      if (!append) {
        mutate(storiesData, false);
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
    }
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

  const handleViewStory = async (story: Story) => {
    setSelectedStory(story);
    
    if (!story.isViewed && user) {
      try {
        // Record view
        await supabase
          .from('story_views')
          .insert({
            story_id: story.id,
            viewer_id: user.id
          });
        
        // Update views count
        await supabase
          .from('stories')
          .update({ views_count: story.views + 1 })
          .eq('id', story.id);
        
        addPoints(1);
        
        // Update local state
        setStories(prev => prev.map(s => 
          s.id === story.id ? { ...s, isViewed: true, views: s.views + 1 } : s
        ));
      } catch (error) {
        console.error('Failed to record story view:', error);
      }
    }
  };

  const handleCreateStory = async () => {
    const content = (document.getElementById('story-content') as HTMLTextAreaElement)?.value;
    const category = (document.getElementById('story-category') as HTMLSelectElement)?.value;
    const fileInput = document.getElementById('story-media') as HTMLInputElement;
    const selectedFile = fileInput?.files?.[0];
    
    if (!content?.trim() && !selectedFile) {
      alert('Please enter some content or select a photo/video for your story');
      return;
    }
    
    try {
      let mediaUrl = '';
      let mediaType = 'text';
      
      // Upload media to Cloudinary if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', 'karu_uploads');
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dybwvr0tn';
        const uploadUrl = selectedFile.type.startsWith('video/') 
          ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
          : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Cloudinary upload failed:', errorText);
          throw new Error('Upload failed');
        }
        
        if (response.ok) {
          const data = await response.json();
          mediaUrl = data.secure_url;
          mediaType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
        } else {
          const errorText = await response.text();
          console.error('Cloudinary error:', errorText);
          alert('Failed to upload media. Please try again.');
          return;
        }
      }
      
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user?.id,
          content: content?.trim() || '',
          media_url: mediaUrl,
          media_type: mediaType,
          category: category || 'social',
          background_color: mediaType === 'text' ? 'bg-gradient-to-br from-blue-400 to-purple-500' : ''
        });
      
      if (error) {
        console.error('Error creating story:', error);
        alert('Failed to create story');
        return;
      }
      
      addPoints(8);
      alert('📱 Story created! +8 XP for sharing your campus life!');
      setShowCreateModal(false);
      setPage(0);
      setHasMore(true);
      loadStories(0, false); // Reload stories
      
      // Track analytics
      import('../../lib/analytics').then(({ trackEvent, events }) => {
        trackEvent(events.STORY_CREATED, { category, hasMedia: !!mediaUrl });
      });
    } catch (error) {
      console.error('Failed to create story:', error);
      alert('Failed to create story');
    }
  };
  
  const handleLikeStory = async (storyId: string) => {
    if (!user) return;
    
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .single();
      
      if (existingLike) {
        // Unlike
        await supabase
          .from('story_likes')
          .delete()
          .eq('id', existingLike.id);
        
        await supabase
          .from('stories')
          .update({ likes_count: Math.max(0, (selectedStory?.views || 1) - 1) })
          .eq('id', storyId);
        
        alert('Story unliked!');
      } else {
        // Like
        await supabase
          .from('story_likes')
          .insert({
            story_id: storyId,
            user_id: user.id
          });
        
        await supabase
          .from('stories')
          .update({ likes_count: (selectedStory?.views || 0) + 1 })
          .eq('id', storyId);
        
        addPoints(2);
        alert('Story liked! +2 XP');
      }
    } catch (error) {
      console.error('Failed to like story:', error);
    }
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
                  {story.content.type === 'image' && story.content.media ? (
                    <img 
                      src={story.content.media} 
                      alt="Story" 
                      className="w-full h-full object-cover"
                    />
                  ) : story.content.type === 'video' && story.content.media ? (
                    <video 
                      src={story.content.media} 
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                    />
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
            
            {/* Infinite scroll trigger */}
            {hasMore && stories.length > 0 && (
              <div ref={ref} className="col-span-full flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
            
            {!hasMore && stories.length > 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>🎉 You've seen all stories!</p>
              </div>
            )}
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
                        Add Photo or Video (Optional)
                      </label>
                      <input
                        id="story-media"
                        type="file"
                        accept="image/*,video/*"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Supports images and videos up to 10MB</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select id="story-category" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
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
                        id="story-content"
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
                    {selectedStory.content.type === 'image' && selectedStory.content.media ? (
                      <img 
                        src={selectedStory.content.media} 
                        alt="Story" 
                        className="w-full h-full object-cover"
                      />
                    ) : selectedStory.content.type === 'video' && selectedStory.content.media ? (
                      <video 
                        src={selectedStory.content.media} 
                        controls 
                        className="w-full h-full object-cover"
                      />
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
                        <button 
                          onClick={() => handleLikeStory(selectedStory.id)}
                          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
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