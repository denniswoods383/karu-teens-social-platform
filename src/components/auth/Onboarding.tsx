import { useState } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useRouter } from 'next/router';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [university, setUniversity] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const router = useRouter();

  const kenyanUniversities = [
    'University of Nairobi', 'Kenyatta University', 'Moi University', 
    'Egerton University', 'Jomo Kenyatta University', 'Strathmore University',
    'USIU-Africa', 'Daystar University', 'Mount Kenya University'
  ];

  const popularSubjects = [
    'Computer Science', 'Business', 'Engineering', 'Medicine', 'Law',
    'Economics', 'Mathematics', 'Biology', 'Chemistry', 'Physics'
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const autoJoinStudyGroups = async () => {
    if (!user || subjects.length === 0) return;

    try {
      // Find relevant study groups based on university and subjects
      const { data: groups } = await supabase
        .from('study_groups')
        .select('id, name')
        .or(`university.eq.${university},subjects.cs.{${subjects.join(',')}}`);

      if (groups && groups.length > 0) {
        // Auto-join top 2-3 groups
        const groupsToJoin = groups.slice(0, 3);
        
        for (const group of groupsToJoin) {
          await supabase
            .from('study_group_members')
            .insert({
              group_id: group.id,
              user_id: user.id,
              role: 'member'
            });
        }
      }
    } catch (error) {
      console.error('Failed to auto-join groups:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    setUploading(true);

    try {
      let avatar_url = '';
      if (avatarFile) {
        const result = await uploadToCloudinary(avatarFile);
        avatar_url = result.url;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          bio,
          avatar_url: avatar_url || undefined,
          university,
          subjects,
          has_completed_onboarding: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Auto-join study groups
      await autoJoinStudyGroups();

      // Show checklist instead of completing immediately
      setShowChecklist(true);

    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderChecklist = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">🎉 Welcome to KaruTeens!</h2>
      <p className="text-gray-600 mb-6">You've been auto-joined to study groups! Complete these steps to get the most out of your first session:</p>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
          <span className="text-green-600 mr-3">✅</span>
          <span className="text-green-800">Joined 2-3 study groups based on your subjects</span>
        </div>
        
        <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100" 
             onClick={() => router.push('/study-groups')}>
          <span className="text-blue-600 mr-3">1️⃣</span>
          <span className="text-blue-800">Join a study group → Ask your first question</span>
        </div>
        
        <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100"
             onClick={() => router.push('/past-papers')}>
          <span className="text-purple-600 mr-3">2️⃣</span>
          <span className="text-purple-800">Try a timed past paper practice</span>
        </div>
        
        <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100"
             onClick={() => router.push('/feed')}>
          <span className="text-orange-600 mr-3">3️⃣</span>
          <span className="text-orange-800">Explore your personalized feed</span>
        </div>
      </div>
      
      <button 
        onClick={() => { onComplete(); router.push('/feed'); }}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
      >
        Start Learning! 🚀
      </button>
    </div>
  );

  const renderStep = () => {
    if (showChecklist) return renderChecklist();
    
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome to KaruTeens!</h2>
            <p className="text-gray-600 mb-6">Let's personalize your experience. Which university do you attend?</p>
            <select 
              value={university} 
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4"
              required
            >
              <option value="">Select your university</option>
              {kenyanUniversities.map(uni => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
            <button 
              onClick={() => setStep(2)} 
              disabled={!university}
              className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">What subjects interest you?</h2>
            <p className="text-gray-600 mb-6">We'll find relevant study groups and content for you.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {popularSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => {
                    if (subjects.includes(subject)) {
                      setSubjects(subjects.filter(s => s !== subject));
                    } else {
                      setSubjects([...subjects, subject]);
                    }
                  }}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    subjects.includes(subject) 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-gray-600">Back</button>
              <button 
                onClick={() => setStep(3)} 
                disabled={subjects.length === 0}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
              >
                Next ({subjects.length} selected)
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Add a profile picture</h2>
            <p className="text-gray-600 mb-6">Help your study mates recognize you (optional).</p>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="mb-4 w-full" />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself (optional)"
              className="w-full border rounded-lg p-3 mb-4"
              rows={3}
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="text-gray-600">Back</button>
              <button onClick={updateProfile} className="bg-green-600 text-white py-3 px-6 rounded-lg" disabled={uploading}>
                {uploading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  );
}
