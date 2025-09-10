import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useAuth } from '../../hooks/useSupabase';
import { useGamificationStore } from '../../store/gamificationStore';
import { supabase } from '../../lib/supabase';
import PointsDisplay from '../../components/gamification/PointsDisplay';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';


export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    comments: 0,
    followers: 0,
    following: 0,
    messages: 0,
    stories: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('week');
  const { user } = useAuth();
  const { points, level } = useGamificationStore();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);
  
  useEffect(() => {
    if (user && stats.posts !== undefined) {
      loadAchievements();
      loadStreak();
      loadWeeklyData();
      loadEngagementData();
      trackActivity();
    }
  }, [user, stats]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      // Get likes received - simplified approach
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user?.id);
      
      const postIds = userPosts?.map(p => p.id) || [];
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds);
      
      // Get comments made
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      // Get followers
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user?.id);
      
      // Get following
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user?.id);
      
      // Get messages sent
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user?.id);
      
      // Get stories created
      const { count: storiesCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      setStats({
        posts: postsCount || 0,
        likes: likesCount || 0,
        comments: commentsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
        messages: messagesCount || 0,
        stories: storiesCount || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const trackActivity = async () => {
    if (!user) return;
    try {
      await supabase.rpc('track_user_activity', { user_uuid: user.id });
    } catch (error) {
      console.log('Activity tracking not available yet');
    }
  };

  const loadStreak = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.rpc('get_user_streak', { user_uuid: user.id });
      setStreak(data || 0);
    } catch (error) {
      console.log('Streak tracking not available yet');
      setStreak(0);
    }
  };

  const loadWeeklyData = async () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('created_at', date.toISOString().split('T')[0])
        .lt('created_at', new Date(date.getTime() + 24*60*60*1000).toISOString().split('T')[0]);
      
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user?.id)
        .gte('created_at', date.toISOString().split('T')[0])
        .lt('created_at', new Date(date.getTime() + 24*60*60*1000).toISOString().split('T')[0]);
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        posts: postsCount || 0,
        messages: messagesCount || 0,
        activity: (postsCount || 0) + (messagesCount || 0)
      });
    }
    setWeeklyData(days);
  };

  const loadEngagementData = async () => {
    const engagement = [
      { name: 'Posts', value: stats.posts, color: '#3B82F6' },
      { name: 'Likes', value: stats.likes, color: '#EF4444' },
      { name: 'Comments', value: stats.comments, color: '#10B981' },
      { name: 'Messages', value: stats.messages, color: '#8B5CF6' }
    ];
    setEngagementData(engagement);
  };

  const loadAchievements = async () => {
    const userAchievements = [
      { id: 1, name: 'First Post', description: 'Created your first post', earned: stats.posts > 0, icon: '📝' },
      { id: 2, name: 'Social Butterfly', description: 'Made 10 friends', earned: stats.followers >= 10, icon: '🦋' },
      { id: 3, name: 'Conversation Starter', description: 'Sent 50 messages', earned: stats.messages >= 50, icon: '💬' },
      { id: 4, name: 'Story Teller', description: 'Created 5 stories', earned: stats.stories >= 5, icon: '📱' },
      { id: 5, name: 'Popular Creator', description: 'Received 100 likes', earned: stats.likes >= 100, icon: '❤️' },
      { id: 6, name: 'Streak Master', description: 'Maintained 7-day streak', earned: streak >= 7, icon: '🔥' }
    ];
    setAchievements(userAchievements);
  };

  const statCards = [
    { label: 'Posts', value: stats.posts, icon: '📝', color: 'bg-blue-500' },
    { label: 'Likes Received', value: stats.likes, icon: '❤️', color: 'bg-red-500' },
    { label: 'Comments', value: stats.comments, icon: '💬', color: 'bg-green-500' },
    { label: 'Followers', value: stats.followers, icon: '👥', color: 'bg-purple-500' },
    { label: 'Following', value: stats.following, icon: '👤', color: 'bg-orange-500' },
    { label: 'Messages', value: stats.messages, icon: '✉️', color: 'bg-cyan-500' },
    { label: 'Stories', value: stats.stories, icon: '📱', color: 'bg-pink-500' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        <div className="max-w-6xl mx-auto px-2 sm:px-4 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <PointsDisplay />
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">📊 Analytics Hub</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-lg">Track your academic and social journey</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Left Column - Stats */}
            <div className="space-y-8">
              {/* Weekly Activity Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📅 Weekly Activity</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill="#3B82F6" name="Posts" />
                    <Bar dataKey="messages" fill="#10B981" name="Messages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Traditional Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📈 Social Statistics</h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-8 bg-gray-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {statCards.map((stat) => (
                      <div key={stat.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                          </div>
                          <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                            {stat.icon}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">⚡ Activity Insights</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Engagement Rate</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {stats.posts > 0 ? Math.round(((stats.likes + stats.comments) / stats.posts) * 100) / 100 : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Current Streak</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      🔥 {streak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Total XP Earned</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                      ⚡ {points} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Charts and Achievements */}
            <div className="space-y-8">
              {/* Time Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">📈 Activity Trends</h2>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="activity" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎯 Engagement Breakdown</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Achievements */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">🏆 Achievements</h2>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`p-4 rounded-lg border-2 ${
                      achievement.earned 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`text-2xl ${
                          achievement.earned ? 'grayscale-0' : 'grayscale'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${
                            achievement.earned 
                              ? 'text-green-800 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {achievement.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <div className="text-green-600 dark:text-green-400">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}