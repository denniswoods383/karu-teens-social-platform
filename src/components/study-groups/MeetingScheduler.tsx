import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { showInAppNotification } from '../notifications/InAppNotification';

interface MeetingSchedulerProps {
  groupId: string;
  onMeetingCreated: () => void;
  onClose: () => void;
}

export default function MeetingScheduler({ groupId, onMeetingCreated, onClose }: MeetingSchedulerProps) {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    max_participants: 500
  });
  const [loading, setLoading] = useState(false);

  const scheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('meetings')
        .insert({
          group_id: groupId,
          title: meeting.title,
          description: meeting.description,
          scheduled_at: meeting.scheduled_at,
          duration_minutes: meeting.duration_minutes,
          max_participants: meeting.max_participants,
          room_id: roomId,
          created_by: user.id,
          meeting_url: `${window.location.origin}/meeting/${roomId}`
        });

      if (!error) {
        showInAppNotification('success', 'Meeting Scheduled', 'Meeting has been scheduled successfully!');
        onMeetingCreated();
        onClose();
      } else {
        showInAppNotification('error', 'Error', 'Failed to schedule meeting');
      }
    } catch (error) {
      showInAppNotification('error', 'Error', 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">📅 Schedule Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={scheduleMeeting} className="space-y-4">
          <input
            type="text"
            value={meeting.title}
            onChange={(e) => setMeeting(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Meeting Title"
            required
          />

          <textarea
            value={meeting.description}
            onChange={(e) => setMeeting(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Description"
            rows={3}
          />

          <input
            type="datetime-local"
            value={meeting.scheduled_at}
            onChange={(e) => setMeeting(prev => ({ ...prev, scheduled_at: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            min={new Date().toISOString().slice(0, 16)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={meeting.duration_minutes}
              onChange={(e) => setMeeting(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>

            <select
              value={meeting.max_participants}
              onChange={(e) => setMeeting(prev => ({ ...prev, max_participants: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={50}>50 people</option>
              <option value={100}>100 people</option>
              <option value={250}>250 people</option>
              <option value={500}>500 people</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}