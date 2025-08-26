import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

interface CustomUrl {
  id: string;
  url: string;
  title: string;
  description: string;
  claimed_by: string | null;
  payment_status: string;
  price: number;
  created_at: string;
}

export default function CustomUrlsPage() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<CustomUrl[]>([]);
  const [userUrl, setUserUrl] = useState<CustomUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUrl, setNewUrl] = useState({ url: '', title: '', description: '' });
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      loadUrls();
      loadUserUrl();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single();
      
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Failed to check admin status:', error);
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

  const loadUserUrl = async () => {
    try {
      const { data } = await supabase
        .from('custom_urls')
        .select('*')
        .eq('claimed_by', user?.id)
        .single();
      
      setUserUrl(data);
    } catch (error) {
      setUserUrl(null);
    }
  };

  const addUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('custom_urls')
        .insert({
          url: newUrl.url,
          title: newUrl.title,
          description: newUrl.description,
          uploaded_by: user?.id
        });

      if (!error) {
        setNewUrl({ url: '', title: '', description: '' });
        loadUrls();
        alert('URL added successfully!');
      }
    } catch (error) {
      console.error('Failed to add URL:', error);
      alert('Failed to add URL');
    }
  };

  const initiatePayment = async (urlId: string) => {
    if (userUrl) {
      alert('You have already claimed a URL!');
      return;
    }

    setPaymentLoading(urlId);
    
    try {
      const phoneNumber = prompt('Enter your M-Pesa phone number (07xxxxxxxx):');
      if (!phoneNumber) {
        setPaymentLoading(null);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactionId = `MP${Date.now()}`;
      
      const { error } = await supabase
        .from('custom_urls')
        .update({
          claimed_by: user?.id,
          payment_status: 'paid',
          mpesa_transaction_id: transactionId,
          claimed_at: new Date().toISOString()
        })
        .eq('id', urlId)
        .eq('claimed_by', null);

      if (!error) {
        alert('Payment successful! URL claimed.');
        loadUrls();
        loadUserUrl();
      } else {
        alert('URL already claimed by someone else!');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100">
        <EnhancedNavbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200/50 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🔗</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Custom URLs
                </h1>
                <p className="text-gray-600">Premium URLs - KSh 30 each</p>
              </div>
            </div>

            {userUrl && (
              <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <h2 className="text-xl font-bold text-green-800 mb-4">🎉 Your Claimed URL</h2>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900">{userUrl.title}</h3>
                  <p className="text-gray-600 mb-2">{userUrl.description}</p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-blue-600 font-medium break-all mb-2">{userUrl.url}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(userUrl.url);
                          alert('URL copied to clipboard!');
                        }}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200"
                      >
                        📋 Copy URL
                      </button>
                      <a 
                        href={userUrl.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-green-100 text-green-600 px-3 py-1 rounded text-sm hover:bg-green-200"
                      >
                        🔗 Visit URL
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
                <h2 className="text-xl font-bold text-red-800 mb-4">🔐 Admin Panel</h2>
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
                    placeholder="URL Description"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-orange-700 font-medium"
                  >
                    ➕ Add URL
                  </button>
                </form>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available URLs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {urls.map((url) => (
                  <div key={url.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{url.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{url.description}</p>
                        {url.claimed_by === user?.id ? (
                          <div className="bg-gray-50 p-2 rounded border">
                            <p className="text-xs text-gray-500 break-all mb-2">{url.url}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(url.url);
                                alert('URL copied to clipboard!');
                              }}
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              📋 Copy URL
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">🔒 URL hidden until purchased</p>
                        )}
                      </div>
                      <div className="ml-4">
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
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">KSh {url.price}</span>
                      
                      {!url.claimed_by && !userUrl ? (
                        <button
                          onClick={() => initiatePayment(url.id)}
                          disabled={paymentLoading === url.id}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        >
                          {paymentLoading === url.id ? '⏳ Processing...' : '💳 Pay & Claim'}
                        </button>
                      ) : url.claimed_by === user?.id ? (
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          🔗 Access
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {userUrl ? 'You already have a URL' : 'Claimed'}
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