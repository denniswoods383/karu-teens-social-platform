import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { initializeNotifications, showNotification } from '../../lib/notifications';
import Image from 'next/image';
import { messageSchema, validateData } from '../../lib/validation';
import { checkRateLimit, rateLimitErrors } from '../../lib/rateLimiting';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  is_delivered?: boolean;
  is_read?: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  username: string;
  full_name: string;
  last_message?: string;
  unread_count?: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConversations();
    
    // Initialize push notifications
    initializeNotifications();
  }, []);
  
  useEffect(() => {
    // Handle URL parameters for direct conversation links
    if (router.query.conversation) {
      const conversationId = router.query.conversation as string;
      loadConversationFromId(conversationId);
    } else if (router.query.user) {
      const userId = router.query.user as string;
      setSelectedChat(userId);
      addUserToConversations(userId);
    }
  }, [router.query]);

  useEffect(() => {
    if (selectedChat && user?.id) {
      loadMessages(selectedChat);
      
      // Subscribe to real-time messages
      const channel = supabase
        .channel(`messages-${selectedChat}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const newMessage = payload.new as Message;
            
            // Only add if it's for this conversation
            if ((newMessage.sender_id === user?.id && newMessage.receiver_id === selectedChat) ||
                (newMessage.sender_id === selectedChat && newMessage.receiver_id === user?.id)) {
              setMessages(prev => {
                if (prev.find(msg => msg.id === newMessage.id)) return prev;
                return [...prev, newMessage];
              });
              
              // Show push notification for received messages
              if (newMessage.sender_id === selectedChat) {
                const senderName = conversations.find(c => c.id === selectedChat)?.full_name || 'Someone';
                showNotification(`New message from ${senderName}`, {
                  body: newMessage.content || 'Sent a file',
                  tag: `message-${newMessage.id}`,
                  data: { url: `/messages?user=${selectedChat}` }
                });
                
                // Send email notification
                fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    to: user?.email,
                    subject: `New message from ${senderName}`,
                    html: `<p><strong>${senderName}</strong> sent you a message: "${newMessage.content || 'Sent a file'}"</p>`
                  })
                });
              }
            }
          }
        )
        .subscribe();
      
      // Subscribe to typing indicators
      const typingChannel = supabase
        .channel('typing')
        .on('broadcast', { event: 'user_typing' }, (payload) => {
          const { user_id, chat_id, typing } = payload.payload;
          if (user_id !== user?.id && chat_id === selectedChat) {
            setOtherUserTyping(typing);
          }
        })
        .subscribe();
      
      typingChannelRef.current = typingChannel;
      
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(typingChannel);
      };
    }
  }, [selectedChat, user?.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    const container = document.getElementById('messages-container');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100); // Small delay to ensure message is rendered
    }
  }, [messages]);

  const typingChannelRef = useRef<any>(null);

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!selectedChat || !typingChannelRef.current) return;
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    if (value.trim()) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'user_typing',
        payload: { user_id: user?.id, chat_id: selectedChat, typing: true }
      });
      
      typingTimeout.current = setTimeout(() => {
        if (typingChannelRef.current) {
          typingChannelRef.current.send({
            type: 'broadcast',
            event: 'user_typing',
            payload: { user_id: user?.id, chat_id: selectedChat, typing: false }
          });
        }
      }, 1500);
    } else {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'user_typing',
        payload: { user_id: user?.id, chat_id: selectedChat, typing: false }
      });
    }
  };

  const loadConversations = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .limit(10);
      setConversations(data || []);
    } catch (error) {
      console.error('Failed to load conversations');
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });
      
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'karu_uploads');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    );
    
    return response.json();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || isSending) return;

    // Validate message
    const validation = validateData(messageSchema, {
      content: newMessage.trim(),
      receiver_id: selectedChat
    });

    if (!validation.success) {
      alert('errors' in validation ? validation.errors.join(', ') : 'Validation failed');
      return;
    }

    if (!newMessage.trim() && selectedFiles.length === 0) {
      alert('Please enter a message or select a file');
      return;
    }

    // Check rate limit
    const canMessage = await checkRateLimit('messages');
    if (!canMessage) {
      alert(rateLimitErrors.messages);
      return;
    }

    setIsSending(true);
    const messageContent = newMessage;
    const filesToUpload = [...selectedFiles];
    
    // Clear inputs immediately
    setNewMessage('');
    setSelectedFiles([]);
    
    // Add optimistic message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id || '',
      receiver_id: selectedChat,
      content: messageContent || (filesToUpload.length > 0 ? 'Uploading...' : ''),
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      let fileUrl = null;
      let fileType = null;
      let fileName = null;
      
      // Upload file if exists
      if (filesToUpload.length > 0) {
        const file = filesToUpload[0];
        const uploadResult = await uploadToCloudinary(file);
        fileUrl = uploadResult.secure_url;
        fileType = file.type;
        fileName = file.name;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: selectedChat,
          content: messageContent || (fileUrl ? `Shared ${fileType?.startsWith('image/') ? 'photo' : 'file'}` : ''),
          file_url: fileUrl,
          file_type: fileType,
          file_name: fileName
        })
        .select();
      
      if (error) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setNewMessage(messageContent);
        setSelectedFiles(filesToUpload);
      } else if (data && data[0]) {
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== tempMessage.id);
          return [...filtered, data[0]];
        });
      }
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageContent);
      setSelectedFiles(filesToUpload);
    } finally {
      setIsSending(false);
    }
  };

  const loadConversationFromId = async (conversationId: string) => {
    try {
      // Get conversation details
      const { data: conversation } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();
      
      if (conversation) {
        // Determine the other user in the conversation
        const otherUserId = conversation.user1_id === user?.id ? conversation.user2_id : conversation.user1_id;
        
        // Load other user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('id', otherUserId)
          .single();
        
        if (profile) {
          // Add to conversations if not exists
          const userExists = conversations.find(c => c.id === otherUserId);
          if (!userExists) {
            setConversations(prev => [...prev, {
              id: profile.id,
              username: profile.username || profile.id,
              full_name: profile.full_name || 'Student'
            }]);
          }
          
          // Set as selected chat
          setSelectedChat(otherUserId);
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };
  
  const addUserToConversations = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', userId)
        .single();
      
      if (data) {
        const userExists = conversations.find(c => c.id === userId);
        if (!userExists) {
          setConversations(prev => [...prev, {
            id: data.id,
            username: data.username || data.id,
            full_name: data.full_name || 'Student'
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to load user data');
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .neq('id', user?.id)
        .limit(20);
      
      if (data) {
        const users = data.map(u => ({
          ...u,
          username: u.username || u.id,
          full_name: u.full_name || 'Student'
        }));
        
        setAllUsers(users);
        setSearchUsers(users);
      }
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const startNewChat = (userId: string) => {
    setSelectedChat(userId);
    setShowNewChat(false);
    addUserToConversations(userId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchUsers(allUsers);
    } else {
      const filtered = allUsers.filter((user: any) => 
        (user.full_name || user.username).toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchUsers(filtered);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-8rem)] flex">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                  <button 
                    onClick={() => {
                      setShowNewChat(!showNewChat);
                      if (!showNewChat) loadAllUsers();
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    + New
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {showNewChat ? (
                  <div>
                    <div className="p-3 bg-gray-50 border-b">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    {searchUsers.length > 0 ? (
                      searchUsers.map((user: any) => (
                        <button
                          key={user.id}
                          onClick={() => startNewChat(user.id)}
                          className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              🎓
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {user.full_name || user.username}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                @{user.username}
                                {conversations.find(c => c.id === user.id) && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Recent</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No users found</p>
                        <p className="text-sm mt-2">Try a different search term</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {conversations.length > 0 ? (
                      conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedChat(conv.id)}
                          className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                            selectedChat === conv.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              🎓
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {conv.full_name || conv.username}
                              </p>
                              <p className="text-sm text-gray-500 truncate">@{conv.username}</p>
                              {conv.last_message && (
                                <p className="text-xs text-gray-400 truncate mt-1">
                                  {conv.last_message}
                                </p>
                              )}
                            </div>
                            {conv.unread_count && conv.unread_count > 0 && (
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                  {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No conversations yet</p>
                        <p className="text-sm mt-2">Start a conversation by messaging someone!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        🎓
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {conversations.find(c => c.id === selectedChat)?.full_name || 
                           conversations.find(c => c.id === selectedChat)?.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{conversations.find(c => c.id === selectedChat)?.username}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50/30 to-cyan-50/30" id="messages-container">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                          <div
                            className={`max-w-sm px-4 py-3 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${
                              (message as any).is_admin_message
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-2 border-red-300'
                                : message.sender_id === user?.id
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            {(message as any).is_admin_message && (
                              <div className="flex items-center mb-2 text-yellow-200">
                                <span className="text-xs font-bold">🚫 ADMIN MESSAGE - NO REPLY</span>
                              </div>
                            )}
                            {message.file_url ? (
                              <div className="space-y-2">
                                {message.file_type?.startsWith('image/') ? (
                                  <Image 
                                    src={message.file_url} 
                                    alt={message.file_name}
                                    width={300}
                                    height={200}
                                    className="max-w-xs rounded-lg cursor-pointer"
                                    onClick={() => window.open(message.file_url, '_blank')}
                                  />
                                ) : (
                                  <div className="bg-white/20 rounded-lg p-3 flex items-center space-x-2">
                                    <span className="text-lg">📄</span>
                                    <div>
                                      <p className="text-sm font-medium">{message.file_name}</p>
                                      <a 
                                        href={message.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs underline"
                                      >
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                )}
                                {message.content && message.content !== `Shared ${message.file_type?.startsWith('image/') ? 'photo' : 'file'}` && (
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            )}
                            <div className={`flex items-center justify-between mt-2 ${
                              message.is_admin_message ? 'text-red-100' :
                              message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <p className="text-xs font-medium">
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <span className="text-xs">
                                {message.sender_id === user?.id ? (
                                  <span className="flex items-center space-x-1">
                                    <span>✓✓</span>
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : null}
                    
                    {/* Typing Indicator */}
                    {otherUserTyping && (
                      <div className="flex justify-start animate-fadeIn">
                        <div className="bg-gray-200 px-4 py-2 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {messages.length === 0 && !otherUserTyping ? (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <span className="text-4xl mb-4 block">💬</span>
                          <p className="text-lg font-medium">Start the conversation!</p>
                          <p className="text-sm">Send a message to get started</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Message Input - Disabled for admin conversations */}
                  {selectedChat !== 'admin' ? (
                    <form onSubmit={sendMessage} className="p-4 border-t bg-gradient-to-r from-blue-50 to-cyan-50">
                    {/* File Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="bg-white rounded-lg p-2 border border-blue-200 flex items-center space-x-2">
                            <span className="text-sm">{file.type.startsWith('image/') ? '📷' : '📄'}</span>
                            <span className="text-xs text-gray-600 truncate max-w-20">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-end space-x-3">
                      {/* File Upload Button */}
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedFiles(prev => [...prev, ...files]);
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="p-3 bg-white border-2 border-blue-200 rounded-full hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <span className="text-xl">📎</span>
                      </label>
                      
                      {/* Message Input */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => handleTyping(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              sendMessage(e);
                            }
                          }}
                          placeholder="Type a message... 😊"
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm"
                        />
                        {isTyping && (
                          <div className="absolute -top-6 left-2 text-xs text-blue-500 bg-white px-2 py-1 rounded-full shadow-sm">
                            typing...
                          </div>
                        )}
                      </div>
                      
                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
                        className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="text-xl">{isSending ? '⏳' : '🚀'}</span>
                      </button>
                    </div>
                  </form>
                  ) : (
                    <div className="p-4 border-t bg-red-50 text-center">
                      <p className="text-red-600 font-medium">🚫 Admin messages are read-only. You cannot reply.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}