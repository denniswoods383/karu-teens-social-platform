import React, { useState, useEffect } from 'react';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

// Welcome Checklist Component
export function WelcomeChecklist() {
  const [checklist, setChecklist] = useState([
    { id: 'join_group', title: 'Join a study group', completed: true, points: 25 },
    { id: 'first_question', title: 'Ask your first question', completed: false, points: 50 },
    { id: 'past_paper', title: 'Try a timed past paper', completed: false, points: 100 }
  ]);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { addPoints } = useGamificationStore();
  const router = useRouter();

  useEffect(() => {
    const checkFirstSession = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_completed_onboarding, created_at')
        .eq('id', user.id)
        .single();
      
      if (profile?.has_completed_onboarding) {
        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceCreation < 24) {
          setIsVisible(true);
        }
      }
    };
    
    checkFirstSession();
  }, [user]);

  const handleChecklistAction = (item: any) => {
    if (item.completed) return;
    
    const actions = {
      'first_question': () => router.push('/study-groups'),
      'past_paper': () => router.push('/past-papers')
    };
    
    actions[item.id]?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            🎯 Welcome Checklist
          </h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          {checklist.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                item.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              onClick={() => handleChecklistAction(item)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                item.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {item.completed ? '✓' : index + 1}
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${
                  item.completed 
                    ? 'text-green-800 dark:text-green-300 line-through' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{item.points} XP
                </div>
              </div>
              
              {!item.completed && (
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Start →
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Complete all tasks to earn <span className="font-bold text-purple-600 dark:text-purple-400">175 XP</span> and unlock your first achievement! 🏆
          </div>
        </div>
      </div>
    </div>
  );
}

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
    
    addPoints(action.points);
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