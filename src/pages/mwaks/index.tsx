import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePremiumStore } from '../../store/premiumStore';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

const MWAKSHome = () => {
  const { isPremium, isFreeTrial, setUpgradeModal } = usePremiumStore();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [stats, setStats] = useState({ totalMaterials: 0, totalDownloads: 0 });
  
  useEffect(() => {
    if (!isPremium && !isFreeTrial) {
      setUpgradeModal(true);
    } else {
      loadStats();
      loadBookmarks();
    }
  }, [isPremium, isFreeTrial, setUpgradeModal]);
  
  const loadStats = async () => {
    const { count: materialsCount } = await supabase
      .from('study_materials')
      .select('*', { count: 'exact', head: true });
    
    const { data: downloads } = await supabase
      .from('study_materials')
      .select('download_count');
    
    const totalDownloads = downloads?.reduce((sum, item) => sum + (item.download_count || 0), 0) || 0;
    
    setStats({ totalMaterials: materialsCount || 0, totalDownloads });
  };
  
  const loadBookmarks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('material_bookmarks')
      .select('material_id, study_materials(title, unit_code)')
      .eq('user_id', user.id);
    setBookmarks(data || []);
  };
  
  const searchMaterials = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const { data } = await supabase
      .from('study_materials')
      .select('*')
      .or(`title.ilike.%${query}%,unit_code.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);
    
    setSearchResults(data || []);
  };
  
  if (!isPremium && !isFreeTrial) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Premium Feature</h1>
              <p className="text-gray-600 mb-6">Access to MWAKS (600+ study materials) requires a premium subscription.</p>
              <button
                onClick={() => setUpgradeModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700"
              >
                🚀 Start Free Trial (7 Days)
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">MWAKS</h1>
            <p className="text-lg text-gray-600">Karatina University Academic Knowledge System</p>
            <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-500">
              <span>📚 {stats.totalMaterials} Materials</span>
              <span>⬇️ {stats.totalDownloads} Downloads</span>
              <span>⭐ {bookmarks.length} Bookmarked</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search materials, units, or topics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchMaterials(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-w-md mx-auto mt-4 bg-white border rounded-lg shadow-lg">
                {searchResults.map((material) => (
                  <div key={material.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-gray-900">{material.title}</div>
                    <div className="text-sm text-gray-500">{material.unit_code} • {material.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/mwaks/first-years">
              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">1st Years</h2>
                <p className="text-green-100">100-level courses</p>
              </div>
            </Link>

            <Link href="/mwaks/second-years">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">2nd Years</h2>
                <p className="text-blue-100">200-level courses</p>
              </div>
            </Link>

            <Link href="/mwaks/third-years">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">3rd Years</h2>
                <p className="text-purple-100">300-level courses</p>
              </div>
            </Link>

            <Link href="/mwaks/fourth-years">
              <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">4th Years</h2>
                <p className="text-red-100">400-level courses</p>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-blue-800 mb-2">📖 Recent Materials</h3>
              <p className="text-sm text-blue-600">Browse latest uploads</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-green-800 mb-2">⭐ My Bookmarks</h3>
              <p className="text-sm text-green-600">{bookmarks.length} saved materials</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-purple-800 mb-2">📊 My Downloads</h3>
              <p className="text-sm text-purple-600">Track your progress</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/feed">
              <button className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                Back to Feed
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default MWAKSHome;