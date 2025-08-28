import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useAuth } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  creator: { full_name: string; username: string };
  members: Array<{ user: { id: string; full_name: string; username: string } }>;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: { full_name: string; username: string };
  reply_to_id?: string;
  reply_to?: { content: string; sender?: { full_name: string } } | null;
}

interface Session {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  is_online: boolean;
  created_by: string;
}

export default function StudyGroupDetail() {
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      loadGroup();
      loadMessages();
      loadSessions();
      
      // Subscribe to real-time messages - simplified approach
      const channel = supabase
        .channel(`group_messages_${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'group_messages',
            filter: `group_id=eq.${id}`
          },
          (payload) => {
            console.log('Real-time message received:', payload);
            // Just reload all messages when new one comes in
            loadMessages();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  const loadGroup = async () => {
    const { data: groupData } = await supabase
      .from('study_groups')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!groupData) return;
    
    const { data: creator } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', groupData.creator_id)
      .single();
    
    const { data: memberData } = await supabase
      .from('study_group_members')
      .select('user_id')
      .eq('group_id', id);
    
    const members = [];
    for (const member of memberData || []) {
      const { data: user } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq('id', member.user_id)
        .single();
      if (user) {
        members.push({ user });
      }
    }
    
    setGroup({
      ...groupData,
      creator: creator || { full_name: 'Student', username: 'student' },
      members: members || []
    });
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('group_messages')
      .select('*, sender:profiles(full_name, username)')
      .eq('group_id', id)
      .order('created_at', { ascending: true });
    
    // Load reply data separately to avoid complex joins
    const messagesWithReplies = [];
    for (const message of data || []) {
      let replyData = null;
      if (message.reply_to_id) {
        const { data: reply } = await supabase
          .from('group_messages')
          .select('content, sender:profiles(full_name)')
          .eq('id', message.reply_to_id)
          .single();
        replyData = reply;
      }
      messagesWithReplies.push({ ...message, reply_to: replyData });
    }
    
    setMessages(messagesWithReplies);
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('group_id', id)
      .order('scheduled_at', { ascending: true });
    
    setSessions(data || []);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add message optimistically
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      sender_id: user?.id || '',
      created_at: new Date().toISOString(),
      sender: { full_name: user?.user_metadata?.full_name || 'You', username: user?.email || 'you' },
      reply_to_id: replyingTo?.id || null,
      reply_to: replyingTo ? { content: replyingTo.content, sender: replyingTo.sender } : null
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setReplyingTo(null);

    // Send to database
    await supabase.from('group_messages').insert({
      group_id: id,
      sender_id: user?.id,
      content: tempMessage.content,
      reply_to_id: tempMessage.reply_to_id
    });
  };

  const scheduleSession = async () => {
    const title = (document.getElementById('session-title') as HTMLInputElement)?.value;
    const description = (document.getElementById('session-description') as HTMLTextAreaElement)?.value;
    const scheduledAt = (document.getElementById('session-datetime') as HTMLInputElement)?.value;
    const duration = parseInt((document.getElementById('session-duration') as HTMLInputElement)?.value || '60');
    const location = (document.getElementById('session-location') as HTMLInputElement)?.value;
    const isOnline = (document.getElementById('session-online') as HTMLInputElement)?.checked;

    if (!title || !scheduledAt) {
      alert('Please fill in required fields');
      return;
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await supabase.from('meetings').insert({
      group_id: id,
      title,
      description,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      room_id: roomId,
      created_by: user?.id,
      meeting_url: `${window.location.origin}/study-groups/${id}/meeting/${roomId}`
    });

    setShowScheduleModal(false);
    loadSessions();
  };

  if (!group) return <div>Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <EnhancedNavbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                  <p className="text-gray-600">{group.subject}</p>
                  <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Created by {group.creator.full_name}</p>
                  <p className="text-sm text-gray-500">{group.members.length} members</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'chat', name: 'Group Chat', icon: '💬' },
                  { id: 'sessions', name: 'Study Sessions', icon: '📅' },
                  { id: 'members', name: 'Members', icon: '👥' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon} {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                    {messages.map((message) => (
                      <div key={message.id} className="mb-4 group hover:bg-gray-100 p-2 rounded">
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {message.sender.full_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{message.sender.full_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 hover:text-blue-800 transition-opacity"
                              >
                                Reply
                              </button>
                            </div>
                            
                            {/* Reply indicator */}
                            {message.reply_to && (
                              <div className="bg-gray-200 border-l-4 border-blue-500 p-2 mt-1 mb-2 rounded">
                                <p className="text-xs text-gray-600">
                                  Replying to {message.reply_to.sender?.full_name || 'Someone'}
                                </p>
                                <p className="text-sm text-gray-800 truncate">
                                  {message.reply_to.content}
                                </p>
                              </div>
                            )}
                            
                            <p className="text-gray-900 mt-1">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    {/* Reply indicator */}
                    {replyingTo && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded flex justify-between items-center">
                        <div>
                          <p className="text-xs text-blue-600">Replying to {replyingTo.sender.full_name}</p>
                          <p className="text-sm text-gray-800 truncate">{replyingTo.content}</p>
                        </div>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={replyingTo ? `Reply to ${replyingTo.sender.full_name}...` : "Type a message..."}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      📅 Schedule Session
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-gray-600">{session.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>📅 {new Date(session.scheduled_at).toLocaleString()}</span>
                              <span>⏱️ {session.duration_minutes} mins</span>
                              <span>💻 Online Meeting</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <>
                              <button 
                                onClick={() => window.open(`/study-groups/${id}/meeting/${session.room_id}`, '_blank')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                🎥 Join Meeting
                              </button>
                              <button 
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}/study-groups/${id}/meeting/${session.room_id}`;
                                  navigator.clipboard.writeText(shareUrl);
                                  alert('Meeting link copied to clipboard!');
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                🔗 Share Link
                              </button>
                            </>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-3">
                  {group.members.map((member) => (
                    <div key={member.user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{member.user.full_name}</p>
                        <p className="text-sm text-gray-500">@{member.user.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold mb-4">Schedule Study Session</h3>
              <div className="space-y-4">
                <input id="session-title" placeholder="Session title" className="w-full px-3 py-2 border rounded-lg" />
                <textarea id="session-description" placeholder="Description" rows={3} className="w-full px-3 py-2 border rounded-lg" />
                <input id="session-datetime" type="datetime-local" className="w-full px-3 py-2 border rounded-lg" />
                <input id="session-duration" type="number" placeholder="Duration (minutes)" defaultValue="60" className="w-full px-3 py-2 border rounded-lg" />
                <input id="session-location" placeholder="Location (if offline)" className="w-full px-3 py-2 border rounded-lg" />
                <label className="flex items-center">
                  <input id="session-online" type="checkbox" defaultChecked className="mr-2" />
                  Online session
                </label>
                
                <div className="flex space-x-3">
                  <button onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button onClick={scheduleSession} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Schedule</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}