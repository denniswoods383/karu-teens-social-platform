import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface GamificationState {
  points: number;
  level: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastLoginDate: string | null;
  streakFreezeUsed: boolean;
  lastStreakFreezeDate: string | null;
  achievements: Achievement[];
  addPoints: (points: number, action?: string) => void;
  updateStreak: () => void;
  useStreakFreeze: () => boolean;
  unlockAchievement: (achievementId: string) => void;
  getLevel: () => number;
  getPointsToNextLevel: () => number;
  getNextLevelActions: () => string[];
  resetWeeklyGoal: () => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'first_post', title: 'First Post', description: 'Create your first post', icon: '📝', points: 10, unlocked: false },
  { id: 'social_butterfly', title: 'Social Butterfly', description: 'Follow 10 users', icon: '🦋', points: 25, unlocked: false },
  { id: 'week_streak', title: 'Week Warrior', description: '7-day login streak', icon: '🔥', points: 50, unlocked: false },
  { id: 'helpful_student', title: 'Helpful Student', description: 'Get 50 likes on posts', icon: '⭐', points: 75, unlocked: false },
  { id: 'study_master', title: 'Study Master', description: 'Join 5 study groups', icon: '📚', points: 100, unlocked: false },
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      points: 0,
      level: 1,
      streak: 0,
      weeklyGoal: 50,
      weeklyProgress: 0,
      lastLoginDate: null,
      streakFreezeUsed: false,
      lastStreakFreezeDate: null,
      achievements: defaultAchievements,
      
      addPoints: (points: number, action?: string) => {
        set((state) => {
          const newPoints = state.points + points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          const newWeeklyProgress = Math.min(state.weeklyProgress + points, state.weeklyGoal);
          
          // Show subtle point notification
          if (typeof window !== 'undefined' && action) {
            const event = new CustomEvent('showPointsNotification', {
              detail: { points, action }
            });
            window.dispatchEvent(event);
          }
          
          return { 
            points: newPoints, 
            level: newLevel,
            weeklyProgress: newWeeklyProgress
          };
        });
      },
      
      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastLoginDate, streak, streakFreezeUsed } = get();
        
        if (lastLoginDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isConsecutive = lastLoginDate === yesterday.toDateString();
        
        set({
          lastLoginDate: today,
          streak: isConsecutive ? streak + 1 : (streakFreezeUsed ? streak : 1)
        });
        
        // Award streak achievements
        const newStreak = isConsecutive ? streak + 1 : (streakFreezeUsed ? streak : 1);
        if (newStreak === 7) {
          get().unlockAchievement('week_streak');
        }
      },
      
      unlockAchievement: (achievementId: string) => {
        set((state) => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === achievementId && !achievement.unlocked
              ? { ...achievement, unlocked: true, unlockedAt: new Date() }
              : achievement
          )
        }));
        
        const achievement = get().achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
          get().addPoints(achievement.points, `Achievement: ${achievement.title}`);
        }
      },
      
      useStreakFreeze: () => {
        const { streakFreezeUsed, lastStreakFreezeDate } = get();
        const now = new Date();
        const lastFreeze = lastStreakFreezeDate ? new Date(lastStreakFreezeDate) : null;
        
        // Reset freeze availability monthly
        const canUseFreeze = !streakFreezeUsed || 
          (lastFreeze && now.getMonth() !== lastFreeze.getMonth());
        
        if (canUseFreeze) {
          set({
            streakFreezeUsed: true,
            lastStreakFreezeDate: now.toISOString()
          });
          return true;
        }
        return false;
      },
      
      getLevel: () => Math.floor(get().points / 100) + 1,
      
      getPointsToNextLevel: () => {
        const { points } = get();
        const currentLevelPoints = Math.floor(points / 100) * 100;
        return (currentLevelPoints + 100) - points;
      },
      
      getNextLevelActions: () => {
        const pointsNeeded = get().getPointsToNextLevel();
        const actions = [];
        
        if (pointsNeeded >= 10) actions.push('Answer a question (+10)');
        if (pointsNeeded >= 5) actions.push('Ask a question (+5)');
        if (pointsNeeded >= 3) actions.push('Like helpful posts (+1-3)');
        if (pointsNeeded >= 15) actions.push('Get your answer accepted (+15)');
        
        return actions.slice(0, 2); // Show max 2 suggestions
      },
      
      resetWeeklyGoal: () => {
        set({ weeklyProgress: 0 });
      },
    }),
    {
      name: 'gamification-storage',
    }
  )
);