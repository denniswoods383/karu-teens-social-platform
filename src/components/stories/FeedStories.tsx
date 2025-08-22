import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import { Plus, Play } from 'lucide-react';

interface Story {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
  story_views: { id: string }[];
}

export default function FeedStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser();
    fetchStories();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          story_views (id)
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get profiles separately
      const userIds = [...new Set(data?.map(story => story.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      // Merge profiles with stories
      const storiesWithProfiles = data?.map(story => ({
        ...story,
        profiles: profiles?.find(p => p.id === story.user_id) || { username: 'Unknown', avatar_url: null }
      })) || [];
      
      setStories(storiesWithProfiles);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (storyId: string) => {
    router.push(`/stories?story=${storyId}`);
  };

  const handleCreateStory = () => {
    router.push('/stories');
  };

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-300 rounded mt-2 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  const uniqueUserStories = stories.reduce((acc: Story[], story) => {
    if (!acc.find(s => s.user_id === story.user_id)) {
      acc.push(story);
    }
    return acc;
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {/* Create Story Button */}
        <div className="flex-shrink-0 text-center cursor-pointer" onClick={handleCreateStory}>
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs mt-2 text-gray-600 dark:text-gray-300 font-medium">Your Story</p>
        </div>

        {/* User Stories */}
        {uniqueUserStories.map((story) => {
          const hasViewed = story.story_views.some(view => view.id === currentUser?.id);
          
          return (
            <div 
              key={story.id} 
              className="flex-shrink-0 text-center cursor-pointer"
              onClick={() => handleStoryClick(story.id)}
            >
              <div className={`w-16 h-16 rounded-full p-0.5 ${
                hasViewed 
                  ? 'bg-gray-300 dark:bg-gray-600' 
                  : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
              }`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 p-0.5">
                  {story.media_url ? (
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      {story.media_type === 'video' ? (
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <img 
                          src={story.media_url} 
                          alt="Story" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {story.profiles.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs mt-2 text-gray-600 dark:text-gray-300 font-medium truncate w-16">
                {story.profiles.username}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}