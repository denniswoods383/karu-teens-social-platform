import { useGamificationStore } from '../../store/gamificationStore';

const PointsDisplay = () => {
  const { points, level, streak } = useGamificationStore();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{points}</div>
            <div className="text-xs opacity-80">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">Lv.{level}</div>
            <div className="text-xs opacity-80">Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{streak}🔥</div>
            <div className="text-xs opacity-80">Streak</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-80">Next Level</div>
          <div className="w-20 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(points % 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsDisplay;