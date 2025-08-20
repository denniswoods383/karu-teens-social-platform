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
  lastLoginDate: string | null;
  achievements: Achievement[];
  addPoints: (points: number) => void;
  updateStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  getLevel: () => number;
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
      lastLoginDate: null,
      achievements: defaultAchievements,
      
      addPoints: (points: number) => {
        set((state) => {
          const newPoints = state.points + points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          return { points: newPoints, level: newLevel };
        });
      },
      
      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastLoginDate, streak } = get();
        
        if (lastLoginDate === today) return;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        set({
          lastLoginDate: today,
          streak: lastLoginDate === yesterday.toDateString() ? streak + 1 : 1
        });
        
        // Award streak achievements
        const newStreak = lastLoginDate === yesterday.toDateString() ? streak + 1 : 1;
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
          get().addPoints(achievement.points);
        }
      },
      
      getLevel: () => Math.floor(get().points / 100) + 1,
    }),
    {
      name: 'gamification-storage',
    }
  )
);