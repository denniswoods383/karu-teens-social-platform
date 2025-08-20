import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function PremiumManager() {
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Loaded users:', data);
    console.log('First user structure:', data?.[0]);
    console.log('Load error:', error);
    setUsers(data || []);
  };

  const grantPremium = async (userId: string, weeks: number) => {
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + (weeks * 7));
    
    const { error, data } = await supabase
      .from('profiles')
      .update({ 
        is_premium: true,
        premium_until: premiumUntil.toISOString()
      })
      .eq('id', userId)
      .select();
    
    console.log('Premium update result:', { error, data, userId, premiumUntil });
    console.log('Trying to update user with ID:', userId);
    
    // Also try updating by user_id field if id doesn't work
    if (data && data.length === 0) {
      console.log('No rows updated with id field, trying user_id field...');
      const { error: error2, data: data2 } = await supabase
        .from('profiles')
        .update({ 
          is_premium: true,
          premium_until: premiumUntil.toISOString()
        })
        .eq('user_id', userId)
        .select();
      
      console.log('Update with user_id result:', { error: error2, data: data2 });
    }
    
    if (!error) {
      // Send notification to user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '✨ Premium Access Granted!',
          message: `You have been granted premium access for ${weeks} weeks. Enjoy unlimited access to MWAKS and premium features!`,
          type: 'success'
        });
      
      await loadUsers();
      alert(`Premium access granted for ${weeks} weeks`);
      console.log('Premium granted successfully');
    }
  };
  
  const removePremium = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: false,
        premium_until: null
      })
      .eq('id', userId);
    
    if (!error) {
      // Send notification to user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '⚠️ Premium Access Removed',
          message: 'Your premium access has been removed by an administrator.',
          type: 'warning'
        });
      
      loadUsers();
      alert('Premium access removed');
    }
  };
  
  const handlePremiumClick = (userId: string, isPremium: boolean) => {
    if (isPremium) {
      removePremium(userId);
    } else {
      const weeks = prompt('Grant premium for how many weeks?', '1');
      if (weeks && parseInt(weeks) > 0) {
        grantPremium(userId, parseInt(weeks));
      }
    }
  };

  const filteredUsers = users.filter((user: any) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const checkPremiumStatus = (user: any) => {
    if (!user.is_premium) return false;
    if (!user.premium_until) return true; // Permanent premium
    return new Date(user.premium_until) > new Date();
  };
  
  const getPremiumStatusText = (user: any) => {
    if (!user.is_premium) return 'Free User';
    if (!user.premium_until) return '✨ Premium (Permanent)';
    const expiry = new Date(user.premium_until);
    const now = new Date();
    if (expiry <= now) return '⏰ Premium Expired';
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `✨ Premium (${daysLeft} days left)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">✨ Premium Manager</h1>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter((u: any) => u.is_premium && (!u.premium_until || new Date(u.premium_until) > new Date())).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Premium</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter((u: any) => u.is_premium && u.premium_until && new Date(u.premium_until) <= new Date()).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Expired Premium</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">
                {users.filter((u: any) => !u.is_premium).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Free Users</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Users</div>
            </div>
          </div>
          
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
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm block mb-1 ${
                      checkPremiumStatus(user)
                        ? 'bg-yellow-100 text-yellow-800' 
                        : user.is_premium && user.premium_until && new Date(user.premium_until) <= new Date()
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getPremiumStatusText(user)}
                    </span>
                    {user.premium_until && (
                      <span className="text-xs text-gray-500">
                        Expires: {new Date(user.premium_until).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handlePremiumClick(user.id, checkPremiumStatus(user))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      checkPremiumStatus(user)
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {checkPremiumStatus(user) ? 'Remove Premium' : 'Grant Premium'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}