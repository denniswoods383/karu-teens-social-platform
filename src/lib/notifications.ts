// Push notification utilities
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

export const showNotification = (title: string, options: {
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      data: options.data
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