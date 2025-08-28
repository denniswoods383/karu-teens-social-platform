import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../../../components/layout/EnhancedNavbar';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../hooks/useSupabase';

export default function MeetingRecordings() {
  const router = useRouter();
  const { id: groupId, meetingId } = router.query;
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId && meetingId && user) {
      loadRecordings();
    }
  }, [groupId, meetingId, user]);

  const loadRecordings = async () => {
    try {
      const { data: meetingData } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      const { data: recordingsData } = await supabase
        .from('meeting_recordings')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      setMeeting(meetingData);
      setRecordings(recordingsData || []);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-100">
          <EnhancedNavbar />
          <div className="pt-20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading recordings...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <EnhancedNavbar />
        
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📹 Meeting Recordings</h1>
                <p className="text-gray-600">{meeting?.title}</p>
              </div>
              <button
                onClick={() => router.push(`/study-groups/${groupId}`)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                ← Back to Group
              </button>
            </div>

            {recordings.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🎥</span>
                <p className="text-gray-500 text-lg">No recordings available</p>
                <p className="text-gray-400">Recordings will appear here after meetings are recorded</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div key={recording.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Recording from {new Date(recording.created_at).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(recording.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(recording.recording_url, '_blank')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          ▶️ Watch
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = recording.recording_url;
                            link.download = `meeting-recording-${recording.id}.webm`;
                            link.click();
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                    
                    <video
                      src={recording.recording_url}
                      controls
                      className="w-full h-64 bg-black rounded-lg"
                      preload="metadata"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}