import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function MovieManagement() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    rating: '',
    duration: '',
    type: 'movie'
  });

  const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );
    
    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const videoFile = (form.video as HTMLInputElement).files?.[0];
      const thumbnailFile = (form.thumbnail as HTMLInputElement).files?.[0];

      if (!videoFile) throw new Error('Video file required');

      const [videoResult, thumbnailResult] = await Promise.all([
        uploadToCloudinary(videoFile, 'video'),
        thumbnailFile ? uploadToCloudinary(thumbnailFile, 'image') : null
      ]);

      const { error } = await supabase.from('movies').insert({
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        rating: parseFloat(formData.rating) || 0,
        duration: formData.duration,
        type: formData.type,
        stream_url: videoResult.secure_url,
        thumbnail_url: thumbnailResult?.secure_url || null
      });

      if (error) throw error;

      alert('Movie uploaded successfully!');
      setFormData({ title: '', description: '', genre: '', rating: '', duration: '', type: 'movie' });
      form.reset();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Movie Management</h1>
          <button
            onClick={() => window.location.href = '/mhesh'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Admin
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Upload New Movie</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Movie Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 border rounded-lg h-24"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Genre"
                value={formData.genre}
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
                className="p-3 border rounded-lg"
              />
              <input
                type="number"
                step="0.1"
                max="10"
                placeholder="Rating (0-10)"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: e.target.value})}
                className="p-3 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Duration (e.g., 2h 30m)"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="p-3 border rounded-lg"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="p-3 border rounded-lg"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Video File *</label>
              <input
                type="file"
                name="video"
                accept="video/*"
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Uploading Movie...' : 'Upload Movie'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}