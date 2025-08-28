import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import VideoConference from '../../components/video/VideoConference';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

export default function MeetingRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roomId && user) {
      loadMeeting();
    }
  }, [roomId, user]);

  const loadMeeting = async () => {
    try {
      const { data } = await supabase
        .from('meetings')
        .select('*')
        .eq('room_id', roomId)
        .single();
      
      setMeeting(data);
      
      if (data) {
        await supabase
          .from('meeting_participants')
          .upsert({
            meeting_id: data.id,
            user_id: user?.id,
            joined_at: new Date().toISOString(),
            is_present: true
          });
      }
    } catch (error) {
      console.error('Failed to load meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const leaveMeeting = async () => {
    try {
      if (meeting) {
        await supabase
          .from('meeting_participants')
          .update({
            left_at: new Date().toISOString(),
            is_present: false
          })
          .eq('meeting_id', meeting.id)
          .eq('user_id', user?.id);
      }
      
      router.push('/study-groups');
    } catch (error) {
      console.error('Failed to leave meeting:', error);
      router.push('/study-groups');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Joining meeting...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!meeting) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Meeting Not Found</h1>
            <p className="mb-4">This meeting room doesn't exist or has ended.</p>
            <button
              onClick={() => router.push('/study-groups')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Study Groups
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <VideoConference
        roomId={roomId as string}
        studyGroupId={meeting.group_id}
        onLeave={leaveMeeting}
      />
    </ProtectedRoute>
  );
}