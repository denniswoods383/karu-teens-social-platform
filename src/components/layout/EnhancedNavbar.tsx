import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';
import GlobalSearch from '../search/GlobalSearch';

export default function EnhancedNavbar() {
  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { points, level } = useGamificationStore();
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
    { name: 'Home', icon: '🏠', href: '/feed', active: false },
    { name: 'Study Groups', icon: '📚', href: '/study-groups', active: false },
    { name: 'MWAKS', icon: '📖', href: '/mwaks', active: false },
    { name: 'Marketplace', icon: '🛍️', href: '/marketplace', active: false },
    { name: 'AI Study Buddy', icon: '🤖', href: '/ai-study-buddy', active: false },
    { name: 'Comrades', icon: '👥', href: '/comrades', active: false },
    { name: 'Messages', icon: '💬', href: '/messages', active: false },
    { name: 'Analytics', icon: '📊', href: '/analytics', active: false },
  ];

  // Set active state based on current path
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const updatedNavItems = navigationItems.map(item => ({
    ...item,
    active: currentPath === item.href || (item.href === '/feed' && currentPath === '/')
  }));

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
              
              <div className="hidden lg:block w-80">
                <GlobalSearch />
              </div>
              
              {/* Search Icon for smaller screens */}
              <button className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200">
                <span className="text-xl">🔍</span>
              </button>
            </div>

            {/* Center Navigation - Icon Only with Side Labels */}
            <div className="hidden md:flex items-center space-x-2">
              {updatedNavItems.map((item) => (
                <div key={item.name} className="relative group">
                  <button 
                    onClick={() => window.location.href = item.href}
                    className={`relative p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                      item.active 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25'
                    }`}
                  >
                    <span className="text-2xl filter drop-shadow-sm">{item.icon}</span>
                    {item.active && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                  
                  {/* Side Sliding Label */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white text-sm font-medium rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50 group-hover:translate-x-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Section - User Stats & Profile */}
            <div className="flex items-center space-x-4">
              {/* Gamification Stats */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-sm font-medium">
                  <span>🔥</span>
                  <span>0</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full text-white text-sm font-medium">
                  <span>⚡</span>
                  <span>{points}</span>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lvl {level}
                </div>
              </div>

              {/* Notifications */}
              <button
                onClick={() => window.location.href = '/notifications'}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200 relative"
                title="Notifications"
              >
                <span className="text-xl">🔔</span>
                {/* Notification badge - you can add logic to show unread count */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

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
                              Level {level}
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-40">
        <div className="flex justify-around items-center">
          {updatedNavItems.slice(0, 5).map((item) => (
            <div key={item.name} className="relative group">
              <button 
                onClick={() => window.location.href = item.href}
                className={`relative p-3 rounded-xl transition-all duration-300 transform active:scale-95 ${
                  item.active 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white'
                }`}
              >
                <span className="text-xl filter drop-shadow-sm">{item.icon}</span>
                {item.active && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
              
              {/* Mobile Side Label */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-active:opacity-100 group-active:visible transition-all duration-200 whitespace-nowrap z-50">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}