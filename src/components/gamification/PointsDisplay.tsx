import { useGamificationStore } from '../../store/gamificationStore';
import { useState, useEffect } from 'react';

const PointsDisplay = () => {
  const { 
    points, 
    level, 
    streak, 
    weeklyGoal, 
    weeklyProgress, 
    getPointsToNextLevel, 
    getNextLevelActions,
    useStreakFreeze,
    streakFreezeUsed
  } = useGamificationStore();
  
  const [showActions, setShowActions] = useState(false);
  const [showPointsNotification, setShowPointsNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ points: 0, action: '' });
  
  const pointsToNext = getPointsToNextLevel();
  const nextActions = getNextLevelActions();
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;
  
  useEffect(() => {
    const handlePointsNotification = (event: CustomEvent) => {
      setNotificationData(event.detail);
      setShowPointsNotification(true);
      setTimeout(() => setShowPointsNotification(false), 1000);
    };
    
    window.addEventListener('showPointsNotification', handlePointsNotification as EventListener);
    return () => window.removeEventListener('showPointsNotification', handlePointsNotification as EventListener);
  }, []);
  
  const handleStreakFreeze = () => {
    const success = useStreakFreeze();
    if (success) {
      alert('🧊 Streak freeze activated! Your streak is protected for today.');
    } else {
      alert('❄️ You\'ve already used your monthly streak freeze.');
    }
  };

  return (
    <>
      {/* Subtle Points Notification */}
      {showPointsNotification && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg animate-bounce">
          <span className="text-sm font-medium">+{notificationData.points} 🎉</span>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">Lv.{level}</div>
              <div className="text-xs opacity-80">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{streak}🔥</div>
              <div className="text-xs opacity-80">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{weeklyProgress}/{weeklyGoal}</div>
              <div className="text-xs opacity-80">Weekly Goal</div>
            </div>
          </div>
          
          {/* Streak Freeze Button */}
          {!streakFreezeUsed && (
            <button
              onClick={handleStreakFreeze}
              className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors"
              title="Use monthly streak freeze"
            >
              🧊 Freeze
            </button>
          )}
        </div>
        
        {/* Actionable Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Next level in {pointsToNext} pts</span>
            <button 
              onClick={() => setShowActions(!showActions)}
              className="text-yellow-300 hover:text-yellow-100 transition-colors"
            >
              {showActions ? '▼' : '▶'} How to earn
            </button>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(points % 100)}%` }}
            />
          </div>
          
          {/* Weekly Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-1 mt-2">
            <div 
              className="bg-yellow-300 h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}
            />
          </div>
          
          {/* Actionable Suggestions */}
          {showActions && (
            <div className="mt-2 space-y-1 text-sm bg-white/10 rounded p-2">
              {nextActions.map((action, index) => (
                <div key={index} className="flex items-center text-yellow-200">
                  <span className="mr-2">•</span>
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PointsDisplay;