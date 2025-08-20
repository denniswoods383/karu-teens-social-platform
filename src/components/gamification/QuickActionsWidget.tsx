import React, { useState } from 'react';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';
import { useTheme } from '../../contexts/ThemeContext';

export default function QuickActionsWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { points, level, addPoints } = useGamificationStore();
  const { isPremium, setUpgradeModal } = usePremiumStore();
  const { isDark } = useTheme();

  const quickActions = [
    { 
      id: 'study-group', 
      name: 'Join Study Group', 
      icon: '📚', 
      points: 15, 
      href: '/study-groups',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'ai-tools', 
      name: 'Use AI Tool', 
      icon: '🤖', 
      points: 5, 
      href: '/ai',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'create-post', 
      name: 'Share Knowledge', 
      icon: '✍️', 
      points: 5, 
      href: '/feed',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'help-friend', 
      name: 'Help a Comrade', 
      icon: '🤝', 
      points: 10, 
      href: '/comrades',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleAction = (action: any) => {
    if (action.id === 'ai-tools' && !isPremium) {
      setUpgradeModal(true);
      return;
    }
    
    addPoints(action.points, action.name.toLowerCase());
    window.location.href = action.href;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <span className="text-2xl">⚡</span>
      </button>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-slideUp">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center space-x-3 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Action Label */}
              <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.name}
                  </span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                    +{action.points} XP
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleAction(action)}
                className={`w-12 h-12 bg-gradient-to-r ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center`}
              >
                <span className="text-xl">{action.icon}</span>
              </button>
            </div>
          ))}

          {/* Stats Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 min-w-[200px]">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                Level {level}
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">XP</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {points % 100}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(points % 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-yellow-600 dark:text-yellow-400">
                  🔥 0
                </span>
                <span className="text-green-600 dark:text-green-400">
                  ⚡ {points}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}