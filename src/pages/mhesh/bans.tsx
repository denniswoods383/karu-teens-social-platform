import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';

export default function BansPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bans, setBans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBanModal, setShowBanModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'denniswood383@gmail.com') {
      router.push('/');
      return;
    }
    setUser(user);
    loadBans();
    loadUsers();
  };

  const loadBans = async () => {
    try {
      const { data } = await supabase
        .from('user_bans')
        .select(`
          *,
          banned_user:profiles!user_id(full_name, username, email),
          admin:profiles!banned_by(full_name, username)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      setBans(data || []);
    } catch (error) {
      console.error('Failed to load bans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, email')
        .limit(50);
      
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const banUser = async () => {
    const userId = (document.getElementById('ban-user') as HTMLSelectElement)?.value;
    const reason = (document.getElementById('ban-reason') as HTMLTextAreaElement)?.value;
    const banType = (document.getElementById('ban-type') as HTMLSelectElement)?.value;
    const duration = (document.getElementById('ban-duration') as HTMLInputElement)?.value;

    if (!userId || !reason) {
      alert('Please select a user and provide a reason');
      return;
    }

    try {
      const expiresAt = banType === 'temporary' && duration 
        ? new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: userId,
          banned_by: user?.id,
          reason,
          ban_type: banType,
          expires_at: expiresAt
        });

      if (!error) {
        // Log admin action
        await supabase
          .from('admin_actions')
          .insert({
            admin_id: user?.id,
            action_type: 'user_banned',
            target_id: userId,
            details: { reason, ban_type: banType, expires_at: expiresAt }
          });

        alert('User banned successfully');
        setShowBanModal(false);
        loadBans();
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user');
    }
  };

  const unbanUser = async (banId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      const { error } = await supabase
        .from('user_bans')
        .update({ is_active: false })
        .eq('id', banId);

      if (!error) {
        alert('User unbanned successfully');
        loadBans();
      }
    } catch (error) {
      console.error('Failed to unban user:', error);
      alert('Failed to unban user');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <EnhancedNavbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Bans Management</h1>
              <p className="text-gray-600">Manage banned users and create new bans</p>
            </div>
            <button
              onClick={() => setShowBanModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              🚫 Ban User
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {bans.map((ban) => (
                  <div key={ban.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {ban.banned_user?.full_name || ban.banned_user?.username}
                        </h3>
                        <p className="text-sm text-gray-600">{ban.banned_user?.email}</p>
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Reason:</strong> {ban.reason}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Type: {ban.ban_type}</span>
                          <span>Banned by: {ban.admin?.full_name}</span>
                          <span>Date: {new Date(ban.created_at).toLocaleDateString()}</span>
                          {ban.expires_at && (
                            <span>Expires: {new Date(ban.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => unbanUser(ban.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Unban
                      </button>
                    </div>
                  </div>
                ))}
                
                {bans.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No active bans found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Ban User</h3>
            
            <div className="space-y-4">
              <select id="ban-user" className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select user to ban</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username} ({user.email})
                  </option>
                ))}
              </select>
              
              <textarea
                id="ban-reason"
                placeholder="Reason for ban"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
              
              <select id="ban-type" className="w-full px-3 py-2 border rounded-lg">
                <option value="temporary">Temporary</option>
                <option value="permanent">Permanent</option>
              </select>
              
              <input
                id="ban-duration"
                type="number"
                placeholder="Duration (days) - for temporary bans"
                className="w-full px-3 py-2 border rounded-lg"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={banUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}