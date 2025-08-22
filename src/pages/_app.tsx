import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useAutoLogout } from '../hooks/useAutoLogout'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'
import FloatingFeedbackButton from '../components/feedback/FloatingFeedbackButton'
import ToastNotification from '../components/notifications/ToastNotification'
import { useNotifications } from '../hooks/useNotifications'
import { ThemeProvider } from '../contexts/ThemeContext'
import { useGamificationStore } from '../store/gamificationStore'
import { usePremiumStore } from '../store/premiumStore'
import { useEffect } from 'react'
import UpgradeModal from '../components/premium/UpgradeModal'
import QuickActionsWidget from '../components/gamification/QuickActionsWidget'
import { initializeNotifications } from '../lib/notifications'

export default function App({ Component, pageProps }: AppProps) {
  useAutoLogout();
  useRealtimeNotifications();
  const { notifications, removeNotification } = useNotifications();
  const { updateStreak } = useGamificationStore();
  const { checkPremiumStatus } = usePremiumStore();
  
  useEffect(() => {
    // Initialize gamification and premium features
    updateStreak();
    checkPremiumStatus();
    
    // Initialize push notifications
    initializeNotifications();
  }, []);
  
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <FloatingFeedbackButton />
      <QuickActionsWidget />
      <UpgradeModal />
      
      {/* Global Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <ToastNotification
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </ThemeProvider>
  )
}