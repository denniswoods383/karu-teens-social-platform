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
import { useEffect, useState } from 'react'
import { InAppNotificationContainer } from '../components/notifications/InAppNotification'
import { useAuth } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import Onboarding from '../components/auth/Onboarding'
import UpgradeModal from '../components/premium/UpgradeModal'
import QuickActionsWidget from '../components/gamification/QuickActionsWidget'
import { initializeNotifications } from '../lib/notifications'
import { SWRConfig } from 'swr'
import { fetcher, swrConfig } from '../lib/swr'
import Head from 'next/head'
import Script from 'next/script'
import ImagePerformanceMonitor from '../components/performance/ImagePerformanceMonitor'
import { useRouter } from 'next/router'
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublicPage = ['/privacy', '/terms', '/features', '/pricing', '/help', '/contact', '/feedback', '/security', '/landing', '/'].includes(router.pathname);
  
  useAutoLogout(isPublicPage);
  useRealtimeNotifications(isPublicPage);
  const { notifications, removeNotification } = useNotifications();
  const { updateStreak } = useGamificationStore();
  const { checkPremiumStatus } = usePremiumStore();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const checkOnboarding = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (profile && !profile.has_completed_onboarding) {
          setShowOnboarding(true);
        }
      };
      checkOnboarding();
    }
  }, [user]);
  
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
    
    // Web Vitals monitoring for performance
    function sendToAnalytics(metric: any) {
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('Web Vitals', {
          props: {
            metric_name: metric.name,
            metric_value: Math.round(metric.value),
            metric_rating: metric.rating
          }
        });
      }
    }
    
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
    
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
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
        <Component {...pageProps} />
        {!isPublicPage && (
          <>
            <InAppNotificationContainer />
            <FloatingFeedbackButton />
            <QuickActionsWidget />
            <UpgradeModal />
            <MobileNavbar />
          </>
        )}
      
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
        data-domain="karuteens.site"
        strategy="afterInteractive"
      />
    </>
  )
}