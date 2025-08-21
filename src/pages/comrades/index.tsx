import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  is_following?: boolean;
  followers_count?: number;
  posts_count?: number;
}

export default function ComradesPage() {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Just get users quickly - no complex filtering
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .limit(6);
      
      setSuggestions(users || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });
      
      if (!error) {
        // Remove user from suggestions
        setSuggestions(prev => prev.filter(u => u.id !== userId));
        alert('User followed successfully!');
      } else {
        console.error('Follow error:', error);
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleMessage = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      // Create or get existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .single();
      
      let conversationId;
      
      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: targetUserId
          })
          .select('id')
          .single();
        
        if (error) {
          console.error('Error creating conversation:', error);
          return;
        }
        
        conversationId = newConv.id;
      }
      
      // Redirect to messages with conversation
      window.location.href = `/messages?conversation=${conversationId}`;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start conversation');
    }
  };

  const renderUserList = (users: User[]) => (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username?.[0]?.toUpperCase() || '👤'
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.full_name || user.username}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleMessage(user.id)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700"
            >
              💬 Message
            </button>
            <button
              onClick={() => handleFollow(user.id)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              👥 Follow
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <EnhancedNavbar />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900">Comrades</h1>
              <p className="text-gray-600 mt-1">Connect with your comrades</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button className="flex-1 py-4 px-6 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                Suggestions ({suggestions.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">People you may know</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 bg-gray-300 rounded w-20"></div>
                          <div className="h-8 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  renderUserList(suggestions)
                ) : (
                  <p className="text-gray-500 text-center py-8">No suggestions available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}