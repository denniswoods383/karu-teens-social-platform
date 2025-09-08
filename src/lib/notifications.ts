import { supabase } from './supabase';

interface NotificationPreferences {
  inApp: boolean;
  dailyDigest: boolean;
  quietHours: { start: string; end: string };
  examMode: boolean;
  examModeUntil?: string;
  types: {
    answers: boolean;
    mentions: boolean;
    studySessions: boolean;
    streaks: boolean;
    follows: boolean;
    likes: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  inApp: true,
  dailyDigest: true,
  quietHours: { start: '22:00', end: '07:00' },
  examMode: false,
  types: {
    answers: true,
    mentions: true,
    studySessions: true,
    streaks: true,
    follows: true,
    likes: false
  }
};

export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  const { data } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return data?.preferences || defaultPreferences;
};

export const updateNotificationPreferences = async (userId: string, preferences: Partial<NotificationPreferences>) => {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      preferences: { ...defaultPreferences, ...preferences }
    });
  
  return !error;
};

export const isQuietHours = (preferences: NotificationPreferences): boolean => {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const startTime = parseInt(preferences.quietHours.start.replace(':', ''));
  const endTime = parseInt(preferences.quietHours.end.replace(':', ''));
  
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  return currentTime >= startTime && currentTime <= endTime;
};

export const isExamMode = (preferences: NotificationPreferences): boolean => {
  if (!preferences.examMode) return false;
  if (!preferences.examModeUntil) return true;
  
  return new Date() < new Date(preferences.examModeUntil);
};

export const shouldShowNotification = async (userId: string, type: keyof NotificationPreferences['types']): Promise<boolean> => {
  const preferences = await getNotificationPreferences(userId);
  
  if (isExamMode(preferences)) return false;
  if (isQuietHours(preferences)) return false;
  if (!preferences.inApp) return false;
  if (!preferences.types[type]) return false;
  
  return true;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const showNotification = async (userId: string, type: keyof NotificationPreferences['types'], title: string, options: {
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}) => {
  const canShow = await shouldShowNotification(userId, type);
  if (!canShow) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/ui/karu_logo.png',
      tag: options.tag,
      data: options.data
    });
  }
};

export const createNotificationBadge = (count: number): string => {
  if (count === 0) return '';
  if (count > 99) return '99+';
  return count.toString();
};

export const scheduleStudySessionReminder = async (userId: string, sessionId: string, sessionTime: string) => {
  const canShow = await shouldShowNotification(userId, 'studySessions');
  if (!canShow) return;
  
  const sessionDate = new Date(sessionTime);
  const reminderTime = new Date(sessionDate.getTime() - 15 * 60 * 1000); // 15 minutes before
  
  if (reminderTime > new Date()) {
    setTimeout(() => {
      showNotification(userId, 'studySessions', 'Study Session Starting Soon', {
        body: 'Your study session starts in 15 minutes. Get ready!',
        tag: `study-session-${sessionId}`,
        data: { sessionId, type: 'study_session' }
      });
    }, reminderTime.getTime() - Date.now());
  }
};

export const sendStreakNotification = async (userId: string, streakCount: number) => {
  const canShow = await shouldShowNotification(userId, 'streaks');
  if (!canShow) return;
  
  const milestones = [7, 14, 30, 60, 100];
  if (milestones.includes(streakCount)) {
    showNotification(userId, 'streaks', `🔥 ${streakCount}-Day Streak!`, {
      body: `Amazing! You've maintained your study streak for ${streakCount} days. Keep it up!`,
      tag: `streak-${streakCount}`,
      data: { streakCount, type: 'streak' }
    });
  }
};

export const initializeNotifications = async () => {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    await registerServiceWorker();
  }
  return hasPermission;
};

// Daily digest email (would integrate with Brevo)
export const scheduleDailyDigest = async (userId: string) => {
  const preferences = await getNotificationPreferences(userId);
  if (!preferences.dailyDigest) return;
  
  // This would be handled by a backend cron job
  console.log('Daily digest scheduled for user:', userId);
};

// Exam mode helpers
export const enableExamMode = async (userId: string, until?: Date) => {
  await updateNotificationPreferences(userId, {
    examMode: true,
    examModeUntil: until?.toISOString()
  });
};

export const disableExamMode = async (userId: string) => {
  await updateNotificationPreferences(userId, {
    examMode: false,
    examModeUntil: undefined
  });
};