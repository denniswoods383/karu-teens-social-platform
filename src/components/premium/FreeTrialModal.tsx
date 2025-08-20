import { usePremiumStore } from '../../store/premiumStore';

const FreeTrialModal = () => {
  const { upgradeModal, setUpgradeModal, startFreeTrial, plans } = usePremiumStore();

  if (!upgradeModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 Try Premium Free!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Get 7 days of premium features absolutely free
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Free Trial Includes:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>✅ Unlimited AI tools</li>
              <li>✅ Advanced analytics</li>
              <li>✅ Priority study groups</li>
              <li>✅ Unlimited file uploads</li>
              <li>✅ Dark mode & themes</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">After Trial:</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Weekly: <span className="font-bold">KES 10/week</span></p>
              <p>Monthly: <span className="font-bold">KES 40/month</span></p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setUpgradeModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Maybe Later
          </button>
          <button
            onClick={startFreeTrial}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-medium"
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialModal;