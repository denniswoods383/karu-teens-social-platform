import { useState, useEffect } from 'react';

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