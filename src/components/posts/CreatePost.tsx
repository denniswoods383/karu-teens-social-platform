import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { uploadFile } from '../../lib/fileStorage';
import { Trash2, X, Plus, Hash, MapPin } from 'lucide-react';
import { postSchema, validateData } from '../../lib/validation';
import { checkRateLimit, rateLimitErrors } from '../../lib/rateLimiting';
import { showSuccessNotification } from '../notifications/InAppNotification';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
  isCompact?: boolean;
}

export default function CreatePost({ onPostCreated, isCompact = false }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const contextualPrompts = [
    { text: 'Ask a question about', subject: true, icon: '❓' },
    { text: 'Share past paper + marking scheme', subject: false, icon: '📄' },
    { text: 'Plan a study session for', subject: true, icon: '📅' },
    { text: 'Need help with homework in', subject: true, icon: '🤝' },
    { text: 'Share study notes for', subject: true, icon: '📝' },
    { text: 'Looking for study partner in', subject: true, icon: '👥' },
    { text: 'Recommend resources for', subject: true, icon: '💡' },
    { text: 'Celebrate academic achievement', subject: false, icon: '🎉' }
  ];
  
  const quickTags = [
    'Question', 'Resource', 'Study Group', 'Past Paper', 'Notes', 'Help Needed'
  ];

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('university, subjects')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
    };
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt(prev => (prev + 1) % contextualPrompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getPlaceholder = () => {
    const prompt = contextualPrompts[currentPrompt];
    if (prompt.subject && userProfile?.subjects?.length > 0) {
      const randomSubject = userProfile.subjects[Math.floor(Math.random() * userProfile.subjects.length)];
      return `${prompt.icon} ${prompt.text} ${randomSubject}...`;
    }
    return `${prompt.icon} ${prompt.text}...`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content.trim() && files.length === 0)) return;

    const canPost = await checkRateLimit('posts');
    if (!canPost) {
      alert(rateLimitErrors.posts);
      return;
    }

    setLoading(true);
    
    // Optimistic post creation
    const optimisticPost = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      content: content.trim(),
      tags,
      created_at: new Date().toISOString(),
      profiles: {
        name: user.user_metadata?.name || 'You',
        avatar_url: user.user_metadata?.avatar_url
      },
      isOptimistic: true
    };
    
    onPostCreated?.(optimisticPost);
    
    try {
      let attachments = [];
      
      for (const file of files) {
        const uploadResult = await uploadFile(file);
        attachments.push({
          type: file.type,
          url: uploadResult.url,
          name: uploadResult.originalName
        });
      }
      
      const postData = {
        user_id: user.id,
        content: content.trim(),
        tags: tags.length > 0 ? tags : null,
        media_urls: attachments.length > 0 ? attachments.map(a => a.url) : null,
        type: tags.includes('Question') ? 'question' : tags.includes('Resource') ? 'resource' : 'post'
      };
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select('*, profiles(name, avatar_url)')
        .single();

      if (!error && data) {
        // Replace optimistic post with real data
        onPostCreated?.({ ...data, isUpdate: true, tempId: optimisticPost.id });
        
        setContent('');
        setFiles([]);
        setTags([]);
        setIsExpanded(false);
        
        showSuccessNotification('Post shared!', 'Your post is now live for everyone to see');
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      // Remove optimistic post on error
      onPostCreated?.({ tempId: optimisticPost.id, isError: true });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    setIsExpanded(true);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    setIsExpanded(true);
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setFiles(prev => [...prev, file]);
          setIsExpanded(true);
        }
      }
    }
  };
  
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  };
  
  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '📷';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document') || fileType.includes('msword')) return '📄';
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z') || fileType.includes('compressed')) return '🗂️';
    if (fileType.includes('text') || fileType.includes('plain')) return '📄';
    if (fileType.includes('json') || fileType.includes('xml') || fileType.includes('csv')) return '📋';
    return '📁';
  };



  if (isCompact) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 md:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isExpanded ? 'p-6' : 'p-4'
    } mb-6`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
            🎓
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (!isExpanded && e.target.value.length > 0) {
                  setIsExpanded(true);
                }
              }}
              onFocus={() => setIsExpanded(true)}
              onPaste={handlePaste}
              placeholder={getPlaceholder()}
              className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 ${
                isExpanded ? 'min-h-[100px]' : 'min-h-[50px]'
              }`}
              rows={isExpanded ? 4 : 2}
            />
            
            {/* Tags */}
            {isExpanded && (
              <div className="mt-3 space-y-3">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {quickTags.filter(tag => !tags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      <Hash className="w-3 h-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                  {userProfile?.university && (
                    <button
                      type="button"
                      onClick={() => addTag(userProfile.university)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {userProfile.university}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* File Upload & Actions */}
        {isExpanded && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                📎 <span>Files</span>
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Drag & drop files or paste images
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isCompact && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                    setFiles([]);
                    setTags([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={(!content.trim() && files.length === 0) || loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 font-medium"
              >
                {loading ? '🚀 Posting...' : '✨ Share'}
              </button>
            </div>
          </div>
        )}
        
        {/* File Previews */}
        {files.length > 0 && isExpanded && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-2">{getFileIcon(file.type)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{file.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
      
      {/* Drag & Drop Overlay */}
      <div 
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 border-2 border-dashed border-purple-400 rounded-2xl opacity-0 pointer-events-none transition-opacity"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <div className="text-purple-600 dark:text-purple-400 font-medium">Drop files here</div>
          </div>
        </div>
      </div>
    </div>
  );
}