import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import VideoConference from '../../../../components/video/VideoConference';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../hooks/useSupabase';

export default function StudyGroupMeeting() {
  const router = useRouter();
  const { id: groupId, sessionId } = router.query;
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId && sessionId && user) {
      checkAccess();
    }
  }, [groupId, sessionId, user]);

  const checkAccess = async () => {
    try {
      const { data: sessionData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('group_id', groupId)
        .single();

      if (!sessionData) {
        setLoading(false);
        return;
      }

      const { data: groupData } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      const { data: membership } = await supabase
        .from('study_group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', user?.id)
        .single();

      const { data: sharedMeeting } = await supabase
        .from('meeting_shares')
        .select('*')
        .eq('meeting_id', sessionId)
        .eq('shared_with', user?.id)
        .single();

      const accessGranted = membership || sharedMeeting;

      setSession(sessionData);
      setGroup(groupData);
      setHasAccess(!!accessGranted);

      if (accessGranted) {
        await supabase
          .from('meeting_participants')
          .upsert({
            meeting_id: sessionId,
            user_id: user?.id,
            joined_at: new Date().toISOString(),
            is_present: true
          });
      }
    } catch (error) {
      console.error('Failed to check access:', error);
    } finally {
      setLoading(false);
    }
  };

  const leaveMeeting = async () => {
    try {
      await supabase
        .from('meeting_participants')
        .update({
          left_at: new Date().toISOString(),
          is_present: false
        })
        .eq('meeting_id', sessionId)
        .eq('user_id', user?.id);
      
      router.push(`/study-groups/${groupId}`);
    } catch (error) {
      console.error('Failed to leave meeting:', error);
      router.push(`/study-groups/${groupId}`);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading meeting...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!session || !hasAccess) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-4">
              {!session 
                ? "This meeting doesn't exist or has ended." 
                : "You must be a group member or have a shared link to join."
              }
            </p>
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
        roomId={sessionId as string}
        studyGroupId={groupId as string}
        onLeave={leaveMeeting}
      />
    </ProtectedRoute>
  );
}