import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';

export default function AutoHideNavbar() {
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
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

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <img src="/ui/karu_logo.png" alt="KarU teens" className="h-8" />
              <div className="hidden md:block w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-3 py-1 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => window.location.href = '/feed'}
                className="flex flex-col items-center py-2 text-blue-600 hover:bg-gray-100 px-4 rounded-lg"
              >
                <img src="/ui/home.jpeg" alt="Home" className="w-6 h-6" />
                <span className="text-xs font-medium">Home</span>
              </button>
              <button 
                onClick={() => window.location.href = '/comrades'}
                className="flex flex-col items-center py-2 text-gray-600 hover:bg-gray-100 px-4 rounded-lg hover:text-blue-600"
              >
                <img src="/ui/comrades.jpeg" alt="Comrades" className="w-6 h-6" />
                <span className="text-xs font-medium">Comrades</span>
              </button>
              <button 
                onClick={() => window.location.href = '/messages'}
                className="flex flex-col items-center py-2 text-gray-600 hover:bg-gray-100 px-4 rounded-lg hover:text-blue-600"
              >
                <img src="/ui/messages.jpeg" alt="Messages" className="w-6 h-6" />
                <span className="text-xs font-medium">Messages</span>
              </button>
              <button 
                onClick={() => window.location.href = '/notifications'}
                className="flex flex-col items-center py-2 text-gray-600 hover:bg-gray-100 px-4 rounded-lg hover:text-blue-600"
              >
                <img src="/ui/notification.jpeg" alt="Notifications" className="w-6 h-6" />
                <span className="text-xs font-medium">Notifications</span>
              </button>
              <button 
                onClick={() => window.location.href = '/ai'}
                className="flex flex-col items-center py-2 text-gray-600 hover:bg-gray-100 px-4 rounded-lg hover:text-blue-600"
              >
                <span className="text-xl">🤖</span>
                <span className="text-xs font-medium">AI Tools</span>
              </button>
              <button 
                onClick={() => window.location.href = '/menu'}
                className="flex flex-col items-center py-2 text-gray-600 hover:bg-gray-100 px-4 rounded-lg hover:text-blue-600"
              >
                <span className="text-xl">☰</span>
                <span className="text-xs font-medium">Menu</span>
              </button>
            </div>

            {/* Right Section - Profile */}
            <div className="flex items-center space-x-4">
              <div className="md:hidden">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <span className="text-xl">🔍</span>
                </button>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    🎓
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium">{user?.email?.split('@')[0]}</span>
                  <span className="hidden md:block text-gray-400">▼</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          🎓
                        </div>
                        <div>
                          <p className="font-semibold">Student</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = '/profile';
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                      >
                        <span>👤</span>
                        <span>My Profile</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3">
                        <span>🔒</span>
                        <span>Privacy Settings</span>
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3 text-red-600"
                      >
                        <span>🚪</span>
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


    </>
  );
}