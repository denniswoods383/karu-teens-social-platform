import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';

export default function EnhancedNavbar() {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { userStats } = useGamificationStore();
  const { isPremium, setUpgradeModal } = usePremiumStore();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setShowProfileMenu(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navigationItems = [
    { name: 'Home', icon: '🏠', href: '/feed', active: true },
    { name: 'Study Groups', icon: '📚', href: '/study-groups' },
    { name: 'Comrades', icon: '👥', href: '/comrades' },
    { name: 'Messages', icon: '💬', href: '/messages' },
    { name: 'AI Tools', icon: '🤖', href: '/ai' },
    { name: 'Analytics', icon: '📊', href: '/analytics' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Search */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  Karu<span className="text-blue-600">Teens</span>
                </span>
              </div>
              
              <div className="hidden md:block w-80">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students, groups, posts..."
                    className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Center Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button 
                  key={item.name}
                  onClick={() => window.location.href = item.href}
                  className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-200 ${
                    item.active 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Right Section - User Stats & Profile */}
            <div className="flex items-center space-x-4">
              {/* Gamification Stats */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-sm font-medium">
                  <span>🔥</span>
                  <span>{userStats.currentStreak}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white text-sm font-medium">
                  <span>⚡</span>
                  <span>{userStats.totalPoints}</span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lvl {userStats.level}
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                <span className="text-xl">
                  {isDark ? '☀️' : '🌙'}
                </span>
              </button>

              {/* Premium Badge/Upgrade Button */}
              {isPremium ? (
                <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full">
                  ✨ PRO
                </div>
              ) : (
                <button
                  onClick={() => setUpgradeModal(true)}
                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  🚀 Upgrade
                </button>
              )}
              
              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-2 transition-colors duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase() || '🎓'}
                  </div>
                  <span className="hidden md:block text-gray-700 dark:text-gray-300 font-medium">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="hidden md:block text-gray-400 text-sm">▼</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-scaleIn">
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {user?.email?.charAt(0).toUpperCase() || '🎓'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user?.email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              Level {userStats.level}
                            </span>
                            {isPremium && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                ✨ PRO
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          window.location.href = '/profile';
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <span className="text-lg">👤</span>
                        <span className="text-gray-700 dark:text-gray-300">My Profile</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          window.location.href = '/analytics';
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <span className="text-lg">🏆</span>
                        <span className="text-gray-700 dark:text-gray-300">Achievements</span>
                      </button>
                      
                      <button
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <span className="text-lg">⚙️</span>
                        <span className="text-gray-700 dark:text-gray-300">Settings</span>
                      </button>
                      
                      {!isPremium && (
                        <button
                          onClick={() => {
                            setUpgradeModal(true);
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white flex items-center space-x-3 transition-all duration-200"
                        >
                          <span className="text-lg">🚀</span>
                          <span>Upgrade to Pro</span>
                        </button>
                      )}
                      
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 text-red-600 dark:text-red-400 transition-colors duration-200"
                      >
                        <span className="text-lg">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-40">
        <div className="flex justify-around items-center">
          {navigationItems.slice(0, 5).map((item) => (
            <button 
              key={item.name}
              onClick={() => window.location.href = item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}