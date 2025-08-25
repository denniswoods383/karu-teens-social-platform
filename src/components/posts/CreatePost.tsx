import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';
import { uploadToCloudinary, CLOUDINARY_CONFIG } from '../../lib/cloudinary';
import { Trash2, Play, Pause, Scissors } from 'lucide-react';
import Image from 'next/image';
import { postSchema, validateData } from '../../lib/validation';
import { checkRateLimit, rateLimitErrors } from '../../lib/rateLimiting';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [previews, setPreviews] = useState<{[key: string]: string}>({});
  const [videoTrimming, setVideoTrimming] = useState<{[key: string]: {start: number, end: number, duration: number}}>({});
  const videoRefs = useRef<{[key: string]: HTMLVideoElement}>({});
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate input
    const validation = validateData(postSchema, {
      content: content.trim(),
      media_urls: files.length > 0 ? ['https://example.com/placeholder'] : undefined
    });

    if (!validation.success) {
      alert('errors' in validation ? validation.errors.join(', ') : 'Validation failed');
      return;
    }

    if (!content.trim() && files.length === 0) {
      alert('Please add some content or media to your post');
      return;
    }

    // Check rate limit
    const canPost = await checkRateLimit('posts');
    if (!canPost) {
      alert(rateLimitErrors.posts);
      return;
    }

    setLoading(true);
    try {
      let attachments = [];
      
      // Upload files to Cloudinary
      for (const file of files) {
        try {
          let fileToUpload = file;
          
          // Apply video trimming if needed
          if (file.type.startsWith('video/') && videoTrimming[file.name]) {
            const { start, end } = videoTrimming[file.name];
            if (start > 0 || end < videoTrimming[file.name].duration) {
              fileToUpload = await trimVideo(file, start, end);
            }
          }
          
          console.log('Starting upload for:', file.name, file.type);
          const cloudinaryResult = await uploadToCloudinary(fileToUpload, (progress) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          });
          
          console.log('Cloudinary result:', cloudinaryResult);
          
          // Only add to attachments if upload was successful and has a valid URL
          if (cloudinaryResult && cloudinaryResult.url) {
            console.log('Upload successful, URL:', cloudinaryResult.url);
            attachments.push({
              type: file.type,
              url: cloudinaryResult.url,
              name: file.name,
              size: file.size
            });
          } else {
            console.error('Upload succeeded but no URL returned for:', file.name, cloudinaryResult);
            alert(`Failed to upload ${file.name}. Please try again.`);
          }
        } catch (error) {
          console.error('Failed to upload file:', file.name, error);
          alert(`Failed to upload ${file.name}: ${error.message || 'Unknown error'}`);
        }
      }
      
      // Check if any uploads failed
      if (files.length > 0 && attachments.length === 0) {
        alert('All file uploads failed. Please check your internet connection and try again.');
        return;
      }

      console.log('Creating post with attachments:', attachments);
      const postData = {
        user_id: user.id,
        content: content.trim(),
        media_urls: attachments.length > 0 ? attachments.map(a => a.url) : null,
        image_url: attachments.length > 0 ? attachments[0].url : null
      };
      console.log('Post data:', postData);
      
      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (!error) {
        console.log('Post created successfully!');
        setContent('');
        setFiles([]);
        setUploadProgress({});
        setPreviews({});
        setVideoTrimming({});
        onPostCreated?.();
        
        // Track analytics
        import('../../lib/analytics').then(({ trackEvent, events }) => {
          trackEvent(events.POST_CREATED, { hasMedia: files.length > 0 });
        });
      } else {
        console.error('Post creation error:', error);
        alert('Failed to create post: ' + error.message);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    selectedFiles.forEach(file => {
      console.log('Processing file:', file.name, file.type, file.size);
      
      // Check for corrupted/empty files
      if (file.size < 100) {
        alert(`File ${file.name} appears to be corrupted or empty (${file.size} bytes). Please select a valid file.`);
        return;
      }
      
      if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
        alert(`Video ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use videos under 50MB.`);
        return;
      }
      
      // Create preview
      try {
        const url = URL.createObjectURL(file);
        console.log('Created blob URL:', url);
        setPreviews(prev => ({ ...prev, [file.name]: url }));
        
        // Set default video trimming (auto-cut to 60 seconds)
        if (file.type.startsWith('video/')) {
          const video = document.createElement('video');
          video.src = url;
          video.onloadedmetadata = () => {
            const duration = Math.min(video.duration, 60); // Max 60 seconds
            setVideoTrimming(prev => ({
              ...prev,
              [file.name]: { start: 0, end: duration, duration: video.duration }
            }));
          };
          video.onerror = (e) => {
            console.error('Video load error:', e);
          };
        }
      } catch (error) {
        console.error('Error creating object URL:', error);
        alert(`Failed to process file: ${file.name}`);
      }
    });
    
    const validFiles = selectedFiles.filter(file => {
      // Filter out corrupted/empty files
      if (file.size < 100) {
        return false;
      }
      if (file.type.startsWith('video/')) {
        return file.size <= 50 * 1024 * 1024;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };
  
  const removeFile = (index: number) => {
    const file = files[index];
    if (previews[file.name]) {
      URL.revokeObjectURL(previews[file.name]);
      setPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[file.name];
        return newPreviews;
      });
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
    setVideoTrimming(prev => {
      const newTrimming = { ...prev };
      delete newTrimming[file.name];
      return newTrimming;
    });
  };

  const trimVideo = async (file: File, start: number, end: number): Promise<File> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // For now, just return the original file
        // In a real implementation, you'd use FFmpeg.js or similar
        resolve(file);
      };
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            🎓
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening on campus? Share your thoughts! 📚✨"
            className="flex-1 p-4 border-2 border-blue-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-800 placeholder-blue-400"
            rows={3}
          />
        </div>
        
        {/* File Upload */}
        <div className="mt-4">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
          >
            📸 Add Media
          </label>
        </div>
        
        {/* Selected Files with Previews */}
        {files.length > 0 && (
          <div className="mt-4 space-y-4">
            {files.map((file, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{file.type.startsWith('video/') ? '🎥' : '📷'}</span>
                    <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Preview */}
                {previews[file.name] && (
                  <div className="mb-3">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={previews[file.name]} 
                        alt="Preview" 
                        className="max-w-full h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('Image load error for:', file.name, previews[file.name]);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="relative">
                        <video 
                          ref={el => { if (el) videoRefs.current[file.name] = el; }}
                          src={previews[file.name]} 
                          className="max-w-full h-48 object-cover rounded-lg border"
                          controls
                          onError={(e) => {
                            console.error('Video load error for:', file.name, previews[file.name]);
                          }}
                        />
                        
                        {/* Video Trimming Controls */}
                        {videoTrimming[file.name] && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Scissors className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">Trim Video</span>
                              <span className="text-xs text-gray-500">
                                (Auto-limited to 60s)
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-gray-600 w-12">Start:</label>
                                <input
                                  type="range"
                                  min="0"
                                  max={videoTrimming[file.name].duration}
                                  step="0.1"
                                  value={videoTrimming[file.name].start}
                                  onChange={(e) => {
                                    const start = parseFloat(e.target.value);
                                    setVideoTrimming(prev => ({
                                      ...prev,
                                      [file.name]: {
                                        ...prev[file.name],
                                        start,
                                        end: Math.min(start + 60, prev[file.name].duration)
                                      }
                                    }));
                                  }}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-600 w-12">
                                  {videoTrimming[file.name].start.toFixed(1)}s
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-gray-600 w-12">End:</label>
                                <input
                                  type="range"
                                  min={videoTrimming[file.name].start}
                                  max={Math.min(videoTrimming[file.name].start + 60, videoTrimming[file.name].duration)}
                                  step="0.1"
                                  value={videoTrimming[file.name].end}
                                  onChange={(e) => {
                                    const end = parseFloat(e.target.value);
                                    setVideoTrimming(prev => ({
                                      ...prev,
                                      [file.name]: { ...prev[file.name], end }
                                    }));
                                  }}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-600 w-12">
                                  {videoTrimming[file.name].end.toFixed(1)}s
                                </span>
                              </div>
                              <div className="text-xs text-center text-blue-600 font-medium">
                                Duration: {(videoTrimming[file.name].end - videoTrimming[file.name].start).toFixed(1)}s
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Upload Progress */}
                {uploadProgress[file.name] && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    ></div>
                    <div className="text-xs text-center mt-1 text-blue-600 font-medium">
                      {uploadProgress[file.name]}% uploaded
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={(!content.trim() && files.length === 0) || loading}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
          >
            {loading ? '🚀 Posting...' : '✨ Share'}
          </button>
        </div>
      </form>
    </div>
  );
}