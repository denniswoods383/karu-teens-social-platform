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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const grantPremium = async (userId: string, weeks: number) => {
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + (weeks * 7));
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: true,
        premium_until: premiumUntil.toISOString()
      })
      .eq('id', userId);
    
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
      
      loadUsers();
      alert(`Premium access granted for ${weeks} weeks`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">✨ Premium Manager</h1>
          
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
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.is_premium 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.is_premium ? '✨ Premium' : 'Free'}
                  </span>
                  <div className="flex flex-col space-y-1">
                    {user.premium_until && new Date(user.premium_until) > new Date() && (
                      <span className="text-xs text-yellow-600">
                        Until: {new Date(user.premium_until).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handlePremiumClick(user.id, user.is_premium)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        user.is_premium
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {user.is_premium ? 'Remove Premium' : 'Grant Premium'}
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