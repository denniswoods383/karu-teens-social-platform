import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function MheshUrlsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState({ url: '', title: '', description: '', price: 30 });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        if (user.email !== 'denniswood383@gmail.com') {
          router.push('/');
        } else {
          loadUrls();
        }
      } else {
        router.push('/auth/login');
      }
    };
    getUser();
  }, [router]);

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

  const deleteUrl = async (urlId: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    try {
      const { error } = await supabase
        .from('custom_urls')
        .delete()
        .eq('id', urlId);

      if (!error) {
        loadUrls();
        alert('URL deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete URL:', error);
      alert('Failed to delete URL');
    }
  };

  if (!user || user.email !== 'denniswood383@gmail.com') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🔗</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Custom URLs Management
                </h1>
                <p className="text-gray-600">Manage premium URLs for users</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/mhesh')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Back to Admin
            </button>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl">
            <h2 className="text-xl font-bold text-orange-800 mb-4">➕ Add New URL</h2>
            <form onSubmit={addUrl} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newUrl.url}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newUrl.title}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="URL Title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newUrl.description}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="URL Description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KSh)</label>
                <input
                  type="number"
                  value={newUrl.price}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  min="1"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-red-700 font-medium"
                >
                  ➕ Add URL
                </button>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All URLs ({urls.length})</h2>
            
            {urls.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🔗</span>
                <p className="text-gray-500 text-lg">No URLs added yet</p>
                <p className="text-gray-400">Add your first URL above!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">URL</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {urls.map((url) => (
                      <tr key={url.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{url.title}</p>
                            <p className="text-sm text-gray-500">{url.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-blue-600 break-all max-w-xs">{url.url}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-purple-600">KSh {url.price}</span>
                        </td>
                        <td className="px-4 py-3">
                          {url.claimed_by ? (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                              ❌ Claimed
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              ✅ Available
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {url.mpesa_transaction_id ? (
                            <div>
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                ✅ Paid
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{url.mpesa_transaction_id}</p>
                            </div>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteUrl(url.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}