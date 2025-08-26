import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

export default function AdminUrlsPage() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUrl, setNewUrl] = useState({ url: '', title: '', description: '', price: 30 });

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single();
      
      const adminStatus = data?.is_admin || false;
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        loadUrls();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setLoading(false);
    }
  };

  const loadUrls = async () => {
    try {
      const { data } = await supabase
        .from('custom_urls')
        .select('*')
        .order('created_at', { ascending: false });
      
      setUrls(data || []);
    } catch (error) {
      console.error('Failed to load URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('custom_urls')
        .insert({
          url: newUrl.url,
          title: newUrl.title,
          description: newUrl.description,
          price: newUrl.price,
          uploaded_by: user?.id
        });

      if (!error) {
        setNewUrl({ url: '', title: '', description: '', price: 30 });
        loadUrls();
        alert('URL added successfully!');
      } else {
        alert('Failed to add URL: ' + error.message);
      }
    } catch (error) {
      console.error('Failed to add URL:', error);
      alert('Failed to add URL');
    }
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🚫</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Admin access required</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100">
        <EnhancedNavbar />
        
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🔐</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Admin - URL Management
                </h1>
                <p className="text-gray-600">Manage custom URLs</p>
              </div>
            </div>

            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
              <h2 className="text-xl font-bold text-red-800 mb-4">➕ Add New URL</h2>
              <form onSubmit={addUrl} className="space-y-4">
                <input
                  type="url"
                  value={newUrl.url}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                  required
                />
                <input
                  type="text"
                  value={newUrl.title}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="URL Title"
                  required
                />
                <textarea
                  value={newUrl.description}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description"
                  rows={3}
                />
                <input
                  type="number"
                  value={newUrl.price}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Price (KSh)"
                  min="1"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  ➕ Add URL
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All URLs ({urls.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {urls.map((url) => (
                  <div key={url.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">{url.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{url.description}</p>
                    <p className="text-xs text-blue-600 break-all mb-3">{url.url}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">KSh {url.price}</span>
                      {url.claimed_by ? (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          ❌ Claimed
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          ✅ Available
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}