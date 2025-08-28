import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function MovieUpload() {
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Movie</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-2 border rounded h-24"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Genre"
            value={formData.genre}
            onChange={(e) => setFormData({...formData, genre: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.1"
            max="10"
            placeholder="Rating"
            value={formData.rating}
            onChange={(e) => setFormData({...formData, rating: e.target.value})}
            className="p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Duration (2h 30m)"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            className="p-2 border rounded"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="p-2 border rounded"
          >
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>
        </div>

        <input
          type="file"
          name="video"
          accept="video/*"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="file"
          name="thumbnail"
          accept="image/*"
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Movie'}
        </button>
      </form>
    </div>
  );
}