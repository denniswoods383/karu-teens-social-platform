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
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isComplete ? (
            <div className="flex items-center space-x-2">
              <div className="badge badge-success">
                <Shield className="w-4 h-4" />
                Verified Student
              </div>
            </div>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
          )}
        </div>
        
        {!isComplete && (
          <button
            onClick={() => setShowNudge(false)}
            className="btn btn-sm btn-secondary"
          >
            Dismiss
          </button>
        )}
      </div>

      {isComplete ? (
        <div className="bg-green-50 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center space-x-2 text-green-700 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Profile Complete!</span>
          </div>
          <div className="text-sm text-green-600">
            🎉 You've unlocked: Priority support, exclusive study groups, and early access to new features
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{completedCount}/{completionItems.length} completed</span>
              <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{Math.round(completionPercentage)}%</span>
            </div>
            <div className="progress">
              <div 
                className="progress-bar"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Completion Items */}
          <div className="space-y-3">
            {completionItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <item.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`${item.completed ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}`}>
                    {item.label}
                  </span>
                </div>
                
                {!item.completed && (
                  <button className="btn btn-sm" style={{ background: 'var(--color-primary)', color: 'white' }}>
                    {item.action}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Benefits Preview */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 text-purple-700 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Unlock Verified Student Benefits</span>
            </div>
            <div className="text-sm text-purple-600">
              Priority support • Exclusive groups • Early features • Verified badge
            </div>
          </div>
        </>
      )}
    </div>
  );
}