import { useState } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
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

      const { error } = await supabase
        .from('profiles')
        .update({
          bio,
          avatar_url: avatar_url || undefined,
          has_completed_onboarding: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      onComplete();

    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Karu Teens!</h2>
            <p className="text-gray-600 mb-6">Let's get your profile set up so you can start connecting with your comrades.</p>
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-2 rounded-lg">Let's Go!</button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Add a Profile Picture</h2>
            <p className="text-gray-600 mb-6">Make it easier for your friends to find you.</p>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="mb-4" />
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-gray-600">Back</button>
              <button onClick={() => setStep(3)} className="bg-blue-600 text-white py-2 px-4 rounded-lg">Next</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Tell us about yourself</h2>
            <p className="text-gray-600 mb-6">Write a short bio to let people know what you're about.</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g., Computer Science student, love hiking and coding."
              className="w-full border rounded-lg p-2 mb-4"
              rows={3}
            />
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="text-gray-600">Back</button>
              <button onClick={updateProfile} className="bg-green-600 text-white py-2 px-4 rounded-lg" disabled={uploading}>
                {uploading ? 'Finishing...' : 'Finish'}
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {renderStep()}
      </div>
    </div>
  );
}
