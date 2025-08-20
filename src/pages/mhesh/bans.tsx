import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function UserBans() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdmin();
    loadUsers();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'denniswood383@gmail.com') {
      router.push('/');
    }
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const banUser = async (userId: string, days: number) => {
    const banUntil = new Date();
    banUntil.setDate(banUntil.getDate() + days);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_banned: true,
        banned_until: banUntil.toISOString()
      })
      .eq('id', userId);
    
    if (!error) {
      loadUsers();
      alert(`User banned for ${days} days`);
    }
  };
  
  const unbanUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_banned: false,
        banned_until: null
      })
      .eq('id', userId);
    
    if (!error) {
      loadUsers();
      alert('User unbanned successfully');
    }
  };
  
  const handleBanClick = (userId: string, isBanned: boolean) => {
    if (isBanned) {
      unbanUser(userId);
    } else {
      const days = prompt('Ban for how many days?', '7');
      if (days && parseInt(days) > 0) {
        banUser(userId, parseInt(days));
      }
    }
  };

  const filteredUsers = users.filter((user: any) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">🚫 User Bans</h1>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">@{user.username || user.id}</p>
                  <p className="text-xs text-gray-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.is_banned 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.is_banned ? '🚫 Banned' : '✅ Active'}
                  </span>
                  <div className="flex flex-col space-y-1">
                    {user.banned_until && new Date(user.banned_until) > new Date() && (
                      <span className="text-xs text-red-600">
                        Until: {new Date(user.banned_until).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handleBanClick(user.id, user.is_banned)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        user.is_banned
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {user.is_banned ? 'Unban User' : 'Ban User'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}