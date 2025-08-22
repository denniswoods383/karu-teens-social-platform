import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function MenuPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const menuItems = [
    { icon: '👤', label: 'Profile', action: () => router.push('/profile') },
    { icon: '💬', label: 'Messages', action: () => router.push('/messages') },
    { icon: '👥', label: 'Comrades', action: () => router.push('/comrades') },
    { icon: '🔔', label: 'Notifications', action: () => router.push('/notifications') },
    { icon: '🛍️', label: 'Marketplace', action: () => router.push('/marketplace') },
    { icon: '📱', label: 'Stories', action: () => router.push('/stories') },
    { icon: '⚙️', label: 'Settings', action: () => router.push('/settings') },
    { icon: '❓', label: 'Help & Support', action: () => router.push('/help') },
    { icon: '📝', label: 'Feedback', action: () => router.push('/feedback') },
    { icon: '🚪', label: 'Logout', action: handleLogout, danger: true }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <EnhancedNavbar />
        
        <div className="max-w-2xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user?.username[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user?.email?.split('@')[0] || 'Student'}</h1>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center space-x-4 p-4 hover:bg-gray-50 text-left ${
                    item.danger ? 'text-red-600' : 'text-gray-900'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-auto text-gray-400">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}