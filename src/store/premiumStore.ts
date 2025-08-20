import { create } from 'zustand';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  savings?: string;
}

interface PremiumState {
  isPremium: boolean;
  subscription: SubscriptionPlan | null;
  subscriptionEndDate: Date | null;
  plans: SubscriptionPlan[];
  premiumFeatures: PremiumFeature[];
  upgradeModal: boolean;
  selectedPlan: SubscriptionPlan | null;
  
  // Actions
  checkPremiumStatus: () => void;
  upgradeToPremium: (planId: string) => Promise<boolean>;
  setUpgradeModal: (open: boolean) => void;
  setSelectedPlan: (plan: SubscriptionPlan | null) => void;
  hasFeatureAccess: (featureId: string) => boolean;
}

const premiumPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    interval: 'monthly',
    features: [
      'Basic social features',
      '5 AI tool uses per day',
      'Standard analytics',
      'Basic study groups'
    ]
  },
  {
    id: 'student_pro',
    name: 'Student Pro',
    price: 4.99,
    interval: 'monthly',
    popular: true,
    features: [
      'Unlimited AI tools',
      'Advanced analytics',
      'Priority study groups',
      'Dark mode & themes',
      'Unlimited file uploads',
      'Priority support',
      'Study streak rewards',
      'Academic calendar sync'
    ]
  },
  {
    id: 'student_pro_yearly',
    name: 'Student Pro (Yearly)',
    price: 39.99,
    interval: 'yearly',
    savings: 'Save 33%',
    features: [
      'All Student Pro features',
      'Exclusive badges & achievements',
      'Early access to new features',
      'Campus marketplace priority',
      'Advanced networking tools'
    ]
  }
];

const premiumFeaturesList: PremiumFeature[] = [
  { id: 'unlimited_ai', name: 'Unlimited AI Tools', description: 'Use all AI features without limits', icon: '🤖' },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed insights into your academic progress', icon: '📊' },
  { id: 'custom_themes', name: 'Custom Themes', description: 'Personalize your experience with themes', icon: '🎨' },
  { id: 'priority_support', name: 'Priority Support', description: '24/7 premium support', icon: '🎯' },
  { id: 'unlimited_storage', name: 'Unlimited Storage', description: 'Store unlimited files and media', icon: '💾' },
  { id: 'study_groups_pro', name: 'Advanced Study Groups', description: 'Create unlimited private study groups', icon: '👥' }
];

export const usePremiumStore = create<PremiumState>((set, get) => ({
  isPremium: false,
  subscription: null,
  subscriptionEndDate: null,
  plans: premiumPlans,
  premiumFeatures: premiumFeaturesList,
  upgradeModal: false,
  selectedPlan: null,

  checkPremiumStatus: () => {
    // Check localStorage or API for premium status
    const premiumData = localStorage.getItem('premium_subscription');
    if (premiumData) {
      try {
        const data = JSON.parse(premiumData);
        const endDate = new Date(data.endDate);
        const now = new Date();
        
        if (endDate > now) {
          set({
            isPremium: true,
            subscription: data.plan,
            subscriptionEndDate: endDate
          });
        } else {
          // Subscription expired
          localStorage.removeItem('premium_subscription');
          set({
            isPremium: false,
            subscription: null,
            subscriptionEndDate: null
          });
        }
      } catch (error) {
        console.error('Failed to parse premium data:', error);
      }
    }
  },

  upgradeToPremium: async (planId: string) => {
    try {
      const plan = get().plans.find(p => p.id === planId);
      if (!plan) return false;

      // In a real app, this would integrate with Stripe or similar
      // For demo purposes, we'll simulate a successful purchase
      
      const endDate = new Date();
      if (plan.interval === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscriptionData = {
        plan,
        endDate: endDate.toISOString(),
        purchaseDate: new Date().toISOString()
      };

      localStorage.setItem('premium_subscription', JSON.stringify(subscriptionData));
      
      set({
        isPremium: true,
        subscription: plan,
        subscriptionEndDate: endDate,
        upgradeModal: false
      });

      return true;
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
      return false;
    }
  },

  setUpgradeModal: (open: boolean) => {
    set({ upgradeModal: open });
  },

  setSelectedPlan: (plan: SubscriptionPlan | null) => {
    set({ selectedPlan: plan });
  },

  hasFeatureAccess: (featureId: string) => {
    const { isPremium } = get();
    
    // Free features available to everyone
    const freeFeatures = ['basic_social', 'limited_ai', 'basic_analytics'];
    
    if (freeFeatures.includes(featureId)) return true;
    
    // Premium features require subscription
    return isPremium;
  }
}));