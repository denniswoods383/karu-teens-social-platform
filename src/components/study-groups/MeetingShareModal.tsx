import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { showInAppNotification } from '../notifications/InAppNotification';

interface MeetingShareModalProps {
  meetingId: string;
  meetingTitle: string;
  onClose: () => void;
}

export default function MeetingShareModal({ meetingId, meetingTitle, onClose }: MeetingShareModalProps) {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .neq('id', user?.id)
        .limit(20);
      
      setStudents(data || []);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const shareMeeting = async () => {
    if (selectedStudents.length === 0) return;

    setLoading(true);
    try {
      const shares = selectedStudents.map(studentId => ({
        meeting_id: meetingId,
        shared_by: user?.id,
        shared_with: studentId,
        share_message: shareMessage
      }));

      const { error } = await supabase
        .from('meeting_shares')
        .insert(shares);

      if (!error) {
        showInAppNotification('success', 'Meeting Shared', `Meeting shared with ${selectedStudents.length} students`);
        onClose();
      } else {
        showInAppNotification('error', 'Error', 'Failed to share meeting');
      }
    } catch (error) {
      showInAppNotification('error', 'Error', 'Failed to share meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">📤 Share Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-900 mb-2">{meetingTitle}</h3>
          <textarea
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Add a message (optional)"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Select Students ({selectedStudents.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {students.map(student => (
              <label key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.full_name || student.username}</p>
                  <p className="text-sm text-gray-500">@{student.username}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={shareMeeting}
            disabled={loading || selectedStudents.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Sharing...' : `Share with ${selectedStudents.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}