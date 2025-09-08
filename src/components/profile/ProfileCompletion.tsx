import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, School, BookOpen, Calendar, Shield } from 'lucide-react';

interface ProfileData {
  university?: string;
  subjects?: string[];
  year?: number;
  verified?: boolean;
  avatar_url?: string;
  bio?: string;
}

export default function ProfileCompletion() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({});
  const [showNudge, setShowNudge] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('university, subjects, year, verified, avatar_url, bio')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const completionItems = [
    {
      key: 'university',
      label: 'School/University',
      icon: School,
      completed: !!profile.university,
      action: 'Add your university'
    },
    {
      key: 'subjects',
      label: 'Study Subjects',
      icon: BookOpen,
      completed: profile.subjects && profile.subjects.length > 0,
      action: 'Select your subjects'
    },
    {
      key: 'year',
      label: 'Academic Year',
      icon: Calendar,
      completed: !!profile.year,
      action: 'Set your year of study'
    },
    {
      key: 'verified',
      label: 'Student Verification',
      icon: Shield,
      completed: !!profile.verified,
      action: 'Verify with student email'
    }
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = (completedCount / completionItems.length) * 100;
  const isComplete = completedCount === completionItems.length;

  if (isComplete && !showNudge) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isComplete ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">✅ Verified Student</span>
            </div>
          ) : (
            <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
          )}
        </div>
        
        {!isComplete && (
          <button
            onClick={() => setShowNudge(false)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Dismiss
          </button>
        )}
      </div>

      {isComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-green-700 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Profile Complete!</span>
          </div>
          <div className="text-sm text-green-600">
            🎉 You've unlocked: Priority support, exclusive study groups, and early access to new features
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">{completedCount}/{completionItems.length} completed</span>
              <span className="font-medium text-purple-600">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Completion Items */}
          <div className="space-y-2">
            {completionItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded ${item.completed ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <item.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                
                {!item.completed && (
                  <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    {item.action}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Benefits Preview */}
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2 text-purple-700 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Unlock Verified Student Benefits</span>
            </div>
            <div className="text-xs text-purple-600">
              Priority support • Exclusive groups • Early features • Verified badge
            </div>
          </div>
        </>
      )}
    </div>
  );
}