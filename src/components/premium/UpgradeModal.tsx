import React from 'react';
import { usePremiumStore } from '../../store/premiumStore';

export default function UpgradeModal() {
  const { 
    upgradeModal, 
    plans, 
    selectedPlan, 
    setUpgradeModal, 
    setSelectedPlan, 
    upgradeToPremium 
  } = usePremiumStore();

  if (!upgradeModal) return null;

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    const success = await upgradeToPremium(selectedPlan.id);
    if (success) {
      // Show success notification
      alert('🎉 Upgrade successful! Welcome to Student Pro!');
    } else {
      alert('❌ Upgrade failed. Please try again.');
    }
  };

  const paidPlans = plans.filter(plan => plan.price > 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🚀 Upgrade to Student Pro
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Unlock premium features and boost your academic journey
            </p>
          </div>
          <button
            onClick={() => setUpgradeModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {paidPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                      🌟 Most Popular
                    </span>
                  </div>
                )}
                
                {plan.savings && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                        /{plan.interval === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {plan.interval === 'yearly' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Just $3.33/month billed yearly
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✅</span>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ✨ What You'll Get With Student Pro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🤖</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Unlimited AI Tools</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No daily limits on any AI features</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Advanced Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track your academic progress in detail</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">🎨</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Custom Themes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Personalize your experience</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Priority Study Groups</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create unlimited private groups</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={handleUpgrade}
              disabled={!selectedPlan}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Upgrade Now {selectedPlan && `- $${selectedPlan.price}/${selectedPlan.interval === 'yearly' ? 'year' : 'month'}`}
            </button>
            <button
              onClick={() => setUpgradeModal(false)}
              className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            💰 30-day money-back guarantee • 🔒 Secure payment • ⚡ Instant activation
          </p>
        </div>
      </div>
    </div>
  );
}