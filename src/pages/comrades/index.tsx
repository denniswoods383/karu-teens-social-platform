import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { checkRateLimit, rateLimitErrors } from '../../lib/rateLimiting';
import FollowButton from '../../components/profile/FollowButton';
import Image from 'next/image';

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
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .limit(6);
      
      if (error) {
        console.error('Database error:', error);
        setSuggestions([]);
      } else {
        setSuggestions(users || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
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
        <div key={user.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
          <button
            onClick={() => window.location.href = `/profile/${user.id}`}
            className="flex items-center space-x-4 flex-1 text-left"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt={user.username} width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                '🎓'
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user.full_name || user.username}</p>
              <p className="text-sm text-blue-600 font-medium">@{user.username}</p>
              <p className="text-xs text-gray-500 mt-1">Click to view profile</p>
            </div>
          </button>
          <div className="flex flex-col space-y-2">
            <FollowButton userId={user.id} />
            <button
              onClick={() => handleMessage(user.id)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              💬 Message
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100">
        <EnhancedNavbar />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50">
            {/* Header */}
            <div className="p-8 border-b border-blue-100">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">👥</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Comrades</h1>
              </div>
              <p className="text-gray-600 text-lg">Connect with your fellow students and build your network</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-blue-100">
              <button className="flex-1 py-4 px-6 text-sm font-bold text-blue-600 border-b-2 border-blue-600 bg-blue-50">
                ✨ Suggested Comrades ({suggestions.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-2">🎓</span>
                  Students you might know
                </h3>
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