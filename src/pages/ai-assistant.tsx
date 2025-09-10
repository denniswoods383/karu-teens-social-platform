import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { Send, Bot, User, BookOpen, Upload, X } from 'lucide-react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import EnhancedNavbar from '../components/layout/EnhancedNavbar';


interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: File[];
}

interface UserProfile {
  subjects: string[];
  university: string;
  year: number;
  recent_activities: string[];
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('subjects, university, year')
      .eq('id', user.id)
      .single();
    
    if (data) {
      // Get recent activities
      const { data: activities } = await supabase
        .from('posts')
        .select('content, tags')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setUserProfile({
        ...data,
        recent_activities: activities?.map(a => `${a.content.substring(0, 100)}...`) || []
      });
    }
  };

  const loadChatHistory = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20);
    
    if (data) {
      const chatMessages = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(chatMessages);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // You'll need to set this up
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    
    const data = await response.json();
    return data.secure_url;
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getPersonalizedContext = () => {
    if (!userProfile) return '';
    
    return `User Context:
- University: ${userProfile.university}
- Year: ${userProfile.year}
- Subjects: ${userProfile.subjects?.join(', ') || 'Not specified'}
- Recent Activities: ${userProfile.recent_activities.join('; ')}

Please provide personalized answers based on this student's academic context.`;
  };

  const sendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);
    setIsLoading(true);
    
    try {
      // Upload images to get URLs
      const imageUrls: string[] = [];
      for (const file of currentAttachments) {
        if (file.type.startsWith('image/')) {
          const url = await uploadToCloudinary(file);
          imageUrls.push(url);
        }
      }
      
      // Save user message
      await supabase.from('ai_conversations').insert({
        user_id: user?.id,
        content: currentInput,
        is_user: true,
        attachments: imageUrls
      });
      
      // Prepare context for AI
      const context = getPersonalizedContext();
      const prompt = currentInput ? `${context}\n\nStudent Question: ${currentInput}` : 'Please analyze the uploaded images and help me understand the content.';
      
      // Call OpenRouter API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt,
          imageUrls
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Save AI response
        await supabase.from('ai_conversations').insert({
          user_id: user?.id,
          content: data.response,
          is_user: false
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Help me understand this concept",
    "Explain this assignment",
    "Analyze this image/diagram",
    "Study tips for my subjects",
    "Past paper practice questions"
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100">
        <EnhancedNavbar />
        
        <div className="pt-20 pb-6 max-w-4xl mx-auto px-4">
          <div className="card-hero mb-6" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
            <div className="flex items-center space-x-3 mb-4">
              <Bot className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">AI Study Assistant</h1>
                <p className="opacity-90">Personalized help for your courses and assignments</p>
              </div>
            </div>
            
            {userProfile && (
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-90 mb-2">Your Academic Profile:</div>
                <div className="flex flex-wrap gap-2">
                  <div className="badge bg-white/20 text-white">{userProfile.university}</div>
                  <div className="badge bg-white/20 text-white">Year {userProfile.year}</div>
                  {userProfile.subjects?.map(subject => (
                    <div key={subject} className="badge bg-white/20 text-white">{subject}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Messages */}
          <div className="card mb-6" style={{ height: '500px', overflow: 'hidden' }}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to your AI Study Assistant!</h3>
                    <p className="text-gray-500 mb-6">Ask me anything about your courses, assignments, or study topics.</p>
                    
                    <div className="grid-2 gap-3 max-w-md mx-auto">
                      {quickPrompts.slice(0, 4).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(prompt)}
                          className="btn btn-secondary text-left p-3"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.isUser 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {!message.isUser && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                        {message.isUser && <User className="w-4 h-4 mt-1 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.attachments && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((file, index) => (
                                <div key={index}>
                                  {typeof file === 'string' ? (
                                    <img src={file} alt="Uploaded" className="max-w-xs rounded mt-2" />
                                  ) : (
                                    <div className="text-xs opacity-75">📎 {file.name}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-xs opacity-75 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="border-t pt-4">
                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center bg-gray-100 rounded px-3 py-1">
                        <span className="text-sm mr-2">📎 {file.name}</span>
                        <button onClick={() => removeAttachment(index)}>
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary p-3"
                    title="Attach files"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about homework, assignments, or upload images to analyze..."
                    className="input flex-1"
                    disabled={isLoading}
                  />
                  
                  <button
                    onClick={sendMessage}
                    disabled={(!input.trim() && attachments.length === 0) || isLoading}
                    className="btn btn-primary p-3"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}