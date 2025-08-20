import { create } from 'zustand';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface GamificationState {
  userStats: UserStats;
  achievements: Achievement[];
  recentAchievements: Achievement[];
  updateStats: (newStats: Partial<UserStats>) => void;
  addPoints: (points: number, action: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  calculateLevel: (points: number) => { level: number; xp: number; xpToNextLevel: number };
  loadUserStats: () => Promise<void>;
}

const defaultAchievements: Achievement[] = [
  { id: 'first_post', title: 'First Post', description: 'Created your first post', icon: '✍️', points: 10, unlocked: false },
  { id: 'social_butterfly', title: 'Social Butterfly', description: 'Made 10 new connections', icon: '🦋', points: 50, unlocked: false },
  { id: 'week_streak', title: 'Week Warrior', description: '7-day login streak', icon: '🔥', points: 100, unlocked: false },
  { id: 'helpful_student', title: 'Helpful Student', description: 'Received 25 likes on posts', icon: '🌟', points: 75, unlocked: false },
  { id: 'study_master', title: 'Study Master', description: 'Joined 5 study groups', icon: '📚', points: 150, unlocked: false },
  { id: 'ai_explorer', title: 'AI Explorer', description: 'Used 3 different AI tools', icon: '🤖', points: 80, unlocked: false },
  { id: 'monthly_champion', title: 'Monthly Champion', description: '30-day login streak', icon: '👑', points: 500, unlocked: false }
];

export const useGamificationStore = create<GamificationState>((set, get) => ({
  userStats: {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: '',
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100
  },
  
  achievements: defaultAchievements,
  recentAchievements: [],

  updateStats: (newStats) => {
    set((state) => ({
      userStats: { ...state.userStats, ...newStats }
    }));
  },

  addPoints: (points, action) => {
    set((state) => {
      const newTotalPoints = state.userStats.totalPoints + points;
      const levelInfo = get().calculateLevel(newTotalPoints);
      
      // Show achievement notification
      const notification = {
        id: Date.now().toString(),
        message: `+${points} XP for ${action}!`,
        type: 'success' as const
      };

      return {
        userStats: {
          ...state.userStats,
          totalPoints: newTotalPoints,
          ...levelInfo
        }
      };
    });
    
    // Save to localStorage
    const stats = get().userStats;
    localStorage.setItem('gamification_stats', JSON.stringify(stats));
  },

  calculateLevel: (points) => {
    const level = Math.floor(points / 100) + 1;
    const xp = points % 100;
    const xpToNextLevel = 100 - xp;
    return { level, xp, xpToNextLevel };
  },

  unlockAchievement: (achievementId) => {
    set((state) => {
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (!achievement || achievement.unlocked) return state;

      const updatedAchievements = state.achievements.map(a => 
        a.id === achievementId 
          ? { ...a, unlocked: true, unlockedAt: new Date() }
          : a
      );

      const unlockedAchievement = { ...achievement, unlocked: true, unlockedAt: new Date() };
      
      // Add points for achievement
      get().addPoints(achievement.points, `Achievement: ${achievement.title}`);

      return {
        achievements: updatedAchievements,
        recentAchievements: [unlockedAchievement, ...state.recentAchievements.slice(0, 4)]
      };
    });
  },

  updateStreak: () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    set((state) => {
      const lastLogin = state.userStats.lastLoginDate;
      let newStreak = 1;
      
      if (lastLogin === yesterday) {
        newStreak = state.userStats.currentStreak + 1;
      } else if (lastLogin === today) {
        return state; // Already logged in today
      }

      // Check for streak achievements
      if (newStreak === 7) {
        get().unlockAchievement('week_streak');
      } else if (newStreak === 30) {
        get().unlockAchievement('monthly_champion');
      }

      const updatedStats = {
        ...state.userStats,
        currentStreak: newStreak,
        longestStreak: Math.max(state.userStats.longestStreak, newStreak),
        lastLoginDate: today
      };

      localStorage.setItem('gamification_stats', JSON.stringify(updatedStats));
      
      return { userStats: updatedStats };
    });
  },

  loadUserStats: async () => {
    try {
      const savedStats = localStorage.getItem('gamification_stats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        set({ userStats: stats });
      }
      
      const savedAchievements = localStorage.getItem('gamification_achievements');
      if (savedAchievements) {
        const achievements = JSON.parse(savedAchievements);
        set({ achievements });
      }
    } catch (error) {
      console.error('Failed to load gamification stats:', error);
    }
  }
}));