import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme() as any;
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    profile_visibility: 'public',
    notifications_likes: true,
    notifications_comments: true,
    notifications_followers: true,
    notifications_messages: true,
    notifications_email_digest: false,
    notifications_email_security: true,
    theme: 'light',
    font_size: 'medium'
  });
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
      loadProfile();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setSettings(data);
      } else if (error?.code === 'PGRST116') {
        // Create default settings
        await saveSettings(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const saveSettings = async (newSettings = settings) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          ...newSettings,
          updated_at: new Date().toISOString()
        });
      
      if (!error) {
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' }
  ];

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={profile?.username || user?.email?.split('@')[0] || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profile?.full_name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Edit your profile information from the Profile page</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Password</h3>
        <button 
          onClick={async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
                redirectTo: `${window.location.origin}/auth/reset-password`
              });
              if (!error) {
                alert('Password reset email sent! Check your inbox.');
              }
            } catch (error) {
              alert('Failed to send reset email.');
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Change Password
        </button>
      </div>
      
      {saving && (
        <div className="text-sm text-blue-600 font-medium">
          💾 Saving settings...
        </div>
      )}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Visibility</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input 
              type="radio" 
              name="visibility" 
              className="mr-3" 
              checked={settings.profile_visibility === 'public'}
              onChange={() => updateSetting('profile_visibility', 'public')}
            />
            <span>Public - Anyone can see your profile</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="visibility" 
              className="mr-3" 
              checked={settings.profile_visibility === 'friends'}
              onChange={() => updateSetting('profile_visibility', 'friends')}
            />
            <span>Friends only - Only your comrades can see your profile</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="visibility" 
              className="mr-3" 
              checked={settings.profile_visibility === 'private'}
              onChange={() => updateSetting('profile_visibility', 'private')}
            />
            <span>Private - Only you can see your profile</span>
          </label>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
        <div className="space-y-3">
          <button 
            onClick={async () => {
              try {
                const { data: userData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user?.id)
                  .single();
                
                const { data: posts } = await supabase
                  .from('posts')
                  .select('*')
                  .eq('user_id', user?.id);
                
                const exportData = { profile: userData, posts };
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'karu-teens-data.json';
                a.click();
              } catch (error) {
                alert('Failed to export data.');
              }
            }}
            className="block w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            📥 Download my data
          </button>
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                try {
                  await supabase.auth.signOut();
                  alert('Account deletion requested. Contact support to complete the process.');
                } catch (error) {
                  alert('Failed to process deletion request.');
                }
              }
            }}
            className="block w-full text-left p-3 border border-red-300 rounded-lg hover:bg-red-50 text-red-600"
          >
            🗑️ Delete my account
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Likes on your posts</span>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={settings.notifications_likes}
              onChange={(e) => updateSetting('notifications_likes', e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Comments on your posts</span>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={settings.notifications_comments}
              onChange={(e) => updateSetting('notifications_comments', e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>New followers</span>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={settings.notifications_followers}
              onChange={(e) => updateSetting('notifications_followers', e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Direct messages</span>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={settings.notifications_messages}
              onChange={(e) => updateSetting('notifications_messages', e.target.checked)}
            />
          </label>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Weekly digest</span>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={settings.notifications_email_digest}
              onChange={(e) => updateSetting('notifications_email_digest', e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Security alerts</span>
            <input 
              type="checkbox" 
              className="toggle" 
              checked={settings.notifications_email_security}
              onChange={(e) => updateSetting('notifications_email_security', e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={() => {
              updateSetting('theme', 'light');
              setTheme('light');
            }}
            className={`p-4 border-2 rounded-lg bg-white ${
              settings.theme === 'light' ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <div className="w-full h-8 bg-white border rounded mb-2"></div>
            <span className="text-sm">Light</span>
          </button>
          <button 
            onClick={() => {
              updateSetting('theme', 'dark');
              setTheme('dark');
            }}
            className={`p-4 border-2 rounded-lg bg-gray-900 ${
              settings.theme === 'dark' ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <div className="w-full h-8 bg-gray-800 rounded mb-2"></div>
            <span className="text-sm text-white">Dark</span>
          </button>
          <button 
            onClick={() => {
              updateSetting('theme', 'auto');
              setTheme('auto');
            }}
            className={`p-4 border-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 ${
              settings.theme === 'auto' ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <div className="w-full h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded mb-2"></div>
            <span className="text-sm text-white">Auto</span>
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Font Size</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input 
              type="radio" 
              name="fontSize" 
              className="mr-3" 
              checked={settings.font_size === 'small'}
              onChange={() => updateSetting('font_size', 'small')}
            />
            <span className="text-sm">Small</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="fontSize" 
              className="mr-3" 
              checked={settings.font_size === 'medium'}
              onChange={() => updateSetting('font_size', 'medium')}
            />
            <span>Medium</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="fontSize" 
              className="mr-3" 
              checked={settings.font_size === 'large'}
              onChange={() => updateSetting('font_size', 'large')}
            />
            <span className="text-lg">Large</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <EnhancedNavbar />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences</p>
              {saving && (
                <div className="mt-2 text-sm text-blue-600 font-medium flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Saving changes...
                </div>
              )}
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200">
                <nav className="p-4 space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                {activeTab === 'account' && renderAccountSettings()}
                {activeTab === 'privacy' && renderPrivacySettings()}
                {activeTab === 'notifications' && renderNotificationSettings()}
                {activeTab === 'appearance' && renderAppearanceSettings()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}