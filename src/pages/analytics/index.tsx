import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import AchievementsPanel from '../../components/gamification/AchievementsPanel';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    comments: 0,
    followers: 0,
    following: 0
  });
  const { user } = useAuthStore();
  const { userStats } = useGamificationStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Simulating stats for demo purposes
      setStats({
        posts: Math.floor(Math.random() * 50) + userStats.totalPosts,
        likes: Math.floor(Math.random() * 200) + userStats.totalLikes,
        comments: Math.floor(Math.random() * 100) + userStats.totalComments,
        followers: Math.floor(Math.random() * 75) + 12,
        following: Math.floor(Math.random() * 50) + 8
      });
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const statCards = [
    { label: 'Posts', value: stats.posts, icon: '📝', color: 'bg-blue-500' },
    { label: 'Likes Received', value: stats.likes, icon: '❤️', color: 'bg-red-500' },
    { label: 'Comments', value: stats.comments, icon: '💬', color: 'bg-green-500' },
    { label: 'Followers', value: stats.followers, icon: '👥', color: 'bg-purple-500' },
    { label: 'Following', value: stats.following, icon: '👤', color: 'bg-orange-500' }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">📊 Analytics Hub</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">Track your academic and social journey</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Stats */}
            <div className="space-y-8">
              {/* Traditional Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📈 Social Statistics</h2>
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
                      🔥 {userStats.currentStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Total XP Earned</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                      ⚡ {userStats.totalPoints} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Achievements */}
            <div>
              <AchievementsPanel />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}