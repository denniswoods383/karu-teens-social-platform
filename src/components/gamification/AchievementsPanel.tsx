import React from 'react';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';

export default function AchievementsPanel() {
  const { userStats, achievements, recentAchievements } = useGamificationStore();
  const { isPremium } = usePremiumStore();

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const getProgressColor = (xp: number) => {
    if (xp < 30) return 'bg-red-500';
    if (xp < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🏆 Achievements
        </h2>
        {isPremium && (
          <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full font-medium">
            PRO
          </span>
        )}
      </div>

      {/* User Level & Progress */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold">Level {userStats.level}</h3>
            <p className="text-blue-100">
              {userStats.totalPoints} Total XP • {userStats.currentStreak}🔥 Streak
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{userStats.xp}</div>
            <div className="text-sm text-blue-200">/{userStats.xpToNextLevel} to next level</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-blue-400/30 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(userStats.xp)}`}
            style={{ width: `${(userStats.xp / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🎉 Recently Unlocked
          </h3>
          <div className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 dark:text-green-300">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {achievement.description} • +{achievement.points} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          All Achievements ({unlockedAchievements.length}/{achievements.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unlocked Achievements */}
          {unlockedAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <span className="text-3xl mr-4">{achievement.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    +{achievement.points} XP
                  </span>
                  <span className="text-xs text-green-500 dark:text-green-400">
                    ✅ Unlocked
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Locked Achievements */}
          {lockedAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60">
              <span className="text-3xl mr-4 grayscale">{achievement.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    +{achievement.points} XP
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    🔒 Locked
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}