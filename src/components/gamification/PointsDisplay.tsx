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
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg animate-bounce-in">
          <span className="text-sm font-medium">+{notificationData.points} 🎉</span>
        </div>
      )}
      
      <div className="card-hero" style={{ background: 'var(--gradient-secondary)', color: 'white' }}>
        {/* Metrics Display */}
        <div className="metric-group mb-6">
          <div className="metric">
            <div className="metric-value text-white">Lv.{level}</div>
            <div className="metric-label text-white/70">Level</div>
          </div>
          <div className="metric">
            <div className="metric-value text-white">{streak}🔥</div>
            <div className="metric-label text-white/70">Day Streak</div>
          </div>
          <div className="metric">
            <div className="metric-value text-white">{weeklyProgress}/{weeklyGoal}</div>
            <div className="metric-label text-white/70">Weekly Goal</div>
          </div>
          
          {/* Streak Freeze Button */}
          {!streakFreezeUsed && (
            <button
              onClick={handleStreakFreeze}
              className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none ml-auto"
              title="Use monthly streak freeze"
            >
              🧊 Freeze
            </button>
          )}
        </div>
        
        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Next level in {pointsToNext} points</span>
            <button 
              onClick={() => setShowActions(!showActions)}
              className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none"
            >
              {showActions ? '▼' : '▶'} How to earn
            </button>
          </div>
          
          {/* Level Progress */}
          <div className="progress">
            <div 
              className="progress-bar bg-white"
              style={{ width: `${(points % 100)}%` }}
            />
          </div>
          
          {/* Weekly Progress */}
          <div className="progress progress-sm">
            <div 
              className="progress-bar" 
              style={{ 
                background: 'var(--gradient-warning)',
                width: `${Math.min(weeklyPercentage, 100)}%` 
              }}
            />
          </div>
          
          {/* Action Suggestions */}
          {showActions && (
            <div className="bg-white/10 rounded-lg p-4 space-y-2 animate-fade-in">
              {nextActions.map((action, index) => (
                <div key={index} className="flex items-center text-sm text-white/90">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full mr-3 flex-shrink-0"></span>
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