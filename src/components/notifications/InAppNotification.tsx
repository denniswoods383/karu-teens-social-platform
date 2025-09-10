import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'message' | 'follow' | 'like';
  title: string;
  message: string;
  duration?: number;
  action?: () => void;
  avatar?: string;
  userId?: string;
}

interface NotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem = ({ notification, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, notification.duration || 5000);
    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onClose]);

  const handleClick = () => {
    if (notification.action) {
      notification.action();
    }
    onClose(notification.id);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'message': return '💬';
      case 'follow': return '👤';
      case 'like': return '❤️';
      default: return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'message': return 'bg-purple-50 border-purple-200';
      case 'follow': return 'bg-indigo-50 border-indigo-200';
      case 'like': return 'bg-pink-50 border-pink-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div 
      className={`${getBgColor()} border rounded-lg p-4 shadow-lg animate-slideIn mb-3 cursor-pointer hover:shadow-xl transition-all duration-200 ${notification.action ? 'hover:scale-105' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {notification.avatar ? (
          <img src={notification.avatar} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <span className="text-xl">{getIcon()}</span>
        )}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          {notification.action && (
            <p className="text-xs text-gray-500 mt-1">Click to {notification.type === 'message' ? 'open chat' : 'view'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

let notificationId = 0;
const notifications: Notification[] = [];
const listeners: ((notifications: Notification[]) => void)[] = [];

export const showInAppNotification = (
  type: 'success' | 'error' | 'warning' | 'info' | 'message' | 'follow' | 'like',
  title: string,
  message: string,
  options?: {
    duration?: number;
    action?: () => void;
    avatar?: string;
    userId?: string;
  }
) => {
  const notification: Notification = {
    id: `notification-${++notificationId}`,
    type,
    title,
    message,
    duration: options?.duration || 5000,
    action: options?.action,
    avatar: options?.avatar,
    userId: options?.userId
  };

  notifications.push(notification);
  listeners.forEach(listener => listener([...notifications]));
};

// Helper functions for common notification types
export const showMessageNotification = (senderName: string, message: string, chatId: string, avatar?: string) => {
  showInAppNotification('message', `New message from ${senderName}`, message, {
    duration: 8000,
    avatar,
    action: () => {
      window.location.href = `/messages?chat=${chatId}`;
    }
  });
};

export const showFollowNotification = (followerName: string, userId: string, avatar?: string) => {
  showInAppNotification('follow', `${followerName} started following you`, 'Check out their profile', {
    duration: 6000,
    avatar,
    action: () => {
      window.location.href = `/profile/${userId}`;
    }
  });
};

export const showLikeNotification = (likerName: string, postId: string, avatar?: string) => {
  showInAppNotification('like', `${likerName} liked your post`, 'See what they liked', {
    duration: 5000,
    avatar,
    action: () => {
      window.location.href = `/feed?post=${postId}`;
    }
  });
};

export const showSuccessNotification = (title: string, message: string) => {
  showInAppNotification('success', title, message, { duration: 4000 });
};

export const showErrorNotification = (title: string, message: string) => {
  showInAppNotification('error', title, message, { duration: 6000 });
};

export const showInfoNotification = (title: string, message: string) => {
  showInAppNotification('info', title, message, { duration: 5000 });
};

// Notification Preferences Component
export const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    inApp: true,
    dailyDigest: true,
    quietHours: { start: '22:00', end: '07:00' },
    examMode: false,
    examModeUntil: '',
    types: {
      answers: true,
      mentions: true,
      studySessions: true,
      streaks: true,
      follows: true,
      likes: false
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const loadPreferences = async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();
      
      if (data?.preferences) {
        setPreferences(data.preferences);
      }
    };
    
    loadPreferences();
  }, [user]);

  const updatePreferences = async (updates: any) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    if (user) {
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences: newPreferences
        });
    }
  };

  const enableExamMode = (hours: number) => {
    const until = new Date();
    until.setHours(until.getHours() + hours);
    
    updatePreferences({
      examMode: true,
      examModeUntil: until.toISOString()
    });
    
    showSuccessNotification('Exam Mode Enabled', `Notifications paused for ${hours} hours. Focus on your studies!`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        title="Notification Settings"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🔔 Notification Settings
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Exam Mode */}
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">
              🎯 Exam Mode - Focus Time
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
              Pause all notifications to focus on studying
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => enableExamMode(2)}
                className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
              >
                2 hours
              </button>
              <button
                onClick={() => enableExamMode(4)}
                className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
              >
                4 hours
              </button>
              <button
                onClick={() => enableExamMode(8)}
                className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
              >
                8 hours
              </button>
              {preferences.examMode && (
                <button
                  onClick={() => updatePreferences({ examMode: false, examModeUntil: '' })}
                  className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 transition-colors"
                >
                  Disable
                </button>
              )}
            </div>
            {preferences.examMode && preferences.examModeUntil && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                Active until {new Date(preferences.examModeUntil).toLocaleString()}
              </p>
            )}
          </div>

          {/* Quiet Hours */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              🌙 Quiet Hours
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Start</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => updatePreferences({
                    quietHours: { ...preferences.quietHours, start: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">End</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => updatePreferences({
                    quietHours: { ...preferences.quietHours, end: e.target.value }
                  })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              📨 What to notify me about
            </h3>
            <div className="space-y-3">
              {[
                { key: 'answers', label: 'Answers to my questions', icon: '❓' },
                { key: 'mentions', label: 'When someone mentions me', icon: '@' },
                { key: 'studySessions', label: 'Study session reminders', icon: '📅' },
                { key: 'streaks', label: 'Study streak milestones', icon: '🔥' },
                { key: 'follows', label: 'New followers', icon: '👥' },
                { key: 'likes', label: 'Likes on my posts', icon: '❤️' }
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.types[key]}
                    onChange={(e) => updatePreferences({
                      types: { ...preferences.types, [key]: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg">{icon}</span>
                  <span className="text-gray-900 dark:text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Email Digest */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.dailyDigest}
                onChange={(e) => updatePreferences({ dailyDigest: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-lg">📧</span>
              <div>
                <span className="text-gray-900 dark:text-white font-medium">Daily email digest</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get a summary of your activity via email</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Inbox Component
export const NotificationInbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inboxNotifications, setInboxNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const loadInboxNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setInboxNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    };
    
    loadInboxNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    setInboxNotifications(prev => 
      prev.map((n: any) => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    setInboxNotifications(prev => prev.map((n: any) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Notification Bell with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Inbox Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {inboxNotifications.length > 0 ? (
              inboxNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                    !(notification as any).read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => {
                    if (!(notification as any).read) markAsRead(notification.id);
                    if (notification.action) notification.action();
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{(notification as any).icon || '📢'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                        {new Date((notification as any).created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!(notification as any).read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-2">📭</span>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const InAppNotificationContainer = () => {
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setCurrentNotifications(newNotifications);
    };
    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const removeNotification = (id: string) => {
    const index = notifications.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.splice(index, 1);
      listeners.forEach(listener => listener([...notifications]));
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-w-sm">
      {currentNotifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};