import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function ProfileCompletionButton() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const router = useRouter();

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
      
      const completionItems = [
        !!data.university,
        data.subjects && data.subjects.length > 0,
        !!data.year,
        !!data.verified
      ];
      
      const completed = completionItems.filter(Boolean).length;
      setCompletionPercentage((completed / completionItems.length) * 100);
    }
  };

  if (completionPercentage === 100) return null;

  return (
    <button
      onClick={() => router.push('/profile')}
      className="fixed bottom-32 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 animate-bounce"
    >
      <span className="text-xl">⚠️</span>
    </button>
  );
}