import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

interface StreamContent {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  stream_url: string;
  type: 'movie' | 'series';
  genre: string;
  rating: number;
  duration: string;
  is_live: boolean;
  viewers_count: number;
}

export default function StreamingPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<StreamContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<StreamContent | null>(null);
  const [activeTab, setActiveTab] = useState<'movies' | 'series' | 'live'>('movies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    try {
      // Mock data - replace with actual Supabase query
      const mockContent: StreamContent[] = [
        {
          id: '1',
          title: 'The Matrix',
          description: 'A computer programmer discovers reality is a simulation.',
          thumbnail_url: 'https://via.placeholder.com/300x400?text=Matrix',
          stream_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          type: 'movie',
          genre: 'Sci-Fi',
          rating: 8.7,
          duration: '2h 16m',
          is_live: false,
          viewers_count: 1250
        },
        {
          id: '2',
          title: 'Breaking Bad',
          description: 'A chemistry teacher turns to cooking meth.',
          thumbnail_url: 'https://via.placeholder.com/300x400?text=Breaking+Bad',
          stream_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          type: 'series',
          genre: 'Drama',
          rating: 9.5,
          duration: '45m per episode',
          is_live: false,
          viewers_count: 2100
        },
        {
          id: '3',
          title: 'Live Study Session',
          description: 'Mathematics tutorial - Calculus basics',
          thumbnail_url: 'https://via.placeholder.com/300x400?text=Live+Math',
          stream_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          type: 'movie',
          genre: 'Education',
          rating: 0,
          duration: 'Live',
          is_live: true,
          viewers_count: 45
        }
      ];

      const filtered = mockContent.filter(item => {
        if (activeTab === 'live') return item.is_live;
        return item.type === activeTab;
      });

      setContent(filtered);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const playContent = (item: StreamContent) => {
    setSelectedContent(item);
  };

  const closePlayer = () => {
    setSelectedContent(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <EnhancedNavbar />
        
        <div className="pt-20 pb-8 max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎬 Karu Streaming
            </h1>
            <p className="text-gray-300 text-lg">
              Watch movies, series, and live educational content together
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/30 rounded-lg p-1 flex space-x-1">
              {[
                { key: 'movies', label: '🎬 Movies', count: content.filter(c => c.type === 'movie' && !c.is_live).length },
                { key: 'series', label: '📺 Series', count: content.filter(c => c.type === 'series').length },
                { key: 'live', label: '🔴 Live', count: content.filter(c => c.is_live).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg animate-pulse h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {content.map(item => (
                <div
                  key={item.id}
                  className="bg-black/40 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => playContent(item)}
                >
                  <div className="relative">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-64 object-cover"
                    />
                    {item.is_live && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        🔴 LIVE
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      👥 {item.viewers_count}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/20 rounded-full p-4">
                        <span className="text-white text-3xl">▶️</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-400 font-medium">{item.genre}</span>
                      <span className="text-gray-400">{item.duration}</span>
                    </div>
                    {item.rating > 0 && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-white ml-1">{item.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {content.length === 0 && !loading && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎬</span>
              <p className="text-gray-300 text-lg">No content available in this category</p>
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedContent.title}</h2>
                <p className="text-gray-300">{selectedContent.description}</p>
              </div>
              <button
                onClick={closePlayer}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="flex-1 bg-black flex items-center justify-center">
              <video
                src={selectedContent.stream_url}
                controls
                autoPlay
                className="w-full h-full max-w-6xl max-h-full"
              />
            </div>
            
            <div className="bg-gray-900 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-purple-400">{selectedContent.genre}</span>
                  <span className="text-gray-400">{selectedContent.duration}</span>
                  {selectedContent.rating > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1">{selectedContent.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">👥 {selectedContent.viewers_count} watching</span>
                  {selectedContent.is_live && (
                    <span className="bg-red-500 px-2 py-1 rounded text-sm">🔴 LIVE</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}