import '../styles/globals.css'
import '../styles/mobile.css'
import type { AppProps } from 'next/app'
import { useAutoLogout } from '../hooks/useAutoLogout'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'
import FloatingFeedbackButton from '../components/feedback/FloatingFeedbackButton'
import ToastNotification from '../components/notifications/ToastNotification'
import { useNotifications } from '../hooks/useNotifications'
import MobileNavbar from '../components/layout/MobileNavbar'
import { ThemeProvider } from '../contexts/ThemeContext'
import { useGamificationStore } from '../store/gamificationStore'
import { usePremiumStore } from '../store/premiumStore'
import { useEffect } from 'react'
import UpgradeModal from '../components/premium/UpgradeModal'
import QuickActionsWidget from '../components/gamification/QuickActionsWidget'
import { initializeNotifications } from '../lib/notifications'
import { SWRConfig } from 'swr'
import { fetcher, swrConfig } from '../lib/swr'
import Head from 'next/head'
import Script from 'next/script'
import ImagePerformanceMonitor from '../components/performance/ImagePerformanceMonitor'

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
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
    
    // Setup error tracking
    import('../lib/errorLogger').then(({ setupErrorTracking }) => {
      setupErrorTracking();
    });
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/ui/karu_logo.png" />
      </Head>
      <SWRConfig value={{ fetcher, ...swrConfig }}>
        <ThemeProvider>
        <ImagePerformanceMonitor />
        <Component {...pageProps} />
        <FloatingFeedbackButton />
        <QuickActionsWidget />
        <UpgradeModal />
        <MobileNavbar />
      
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
      </SWRConfig>
      <Script
        src="https://plausible.io/js/script.js"
        data-domain="karuteens.com"
        strategy="afterInteractive"
      />
    </>
  )
}