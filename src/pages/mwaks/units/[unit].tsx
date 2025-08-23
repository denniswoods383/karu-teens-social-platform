import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useSupabase';

const UnitPage = () => {
  const router = useRouter();
  const { unit } = router.query;
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const { user } = useAuth();

  const unitName = typeof unit === 'string' ? unit.replace('-', ' ') : '';

  useEffect(() => {
    if (unit && typeof unit === 'string') {
      loadMaterials();
      loadBookmarks();
    }
  }, [unit]);
  
  const loadMaterials = async () => {
    const { data } = await supabase
      .from('study_materials')
      .select('*')
      .eq('unit_code', unitName)
      .order('created_at', { ascending: false });
    
    setMaterials(data || []);
    setLoading(false);
  };
  
  const loadBookmarks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('material_bookmarks')
      .select('material_id')
      .eq('user_id', user.id);
    
    setBookmarked(data?.map(b => b.material_id) || []);
  };

  const downloadFile = async (material: any) => {
    // Track download
    await supabase.rpc('track_material_download', { material_uuid: material.id });
    
    // Download file
    const link = document.createElement('a');
    link.href = material.file_url;
    link.download = material.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Refresh materials to update download count
    loadMaterials();
  };
  
  const toggleBookmark = async (materialId: string) => {
    if (!user) return;
    
    if (bookmarked.includes(materialId)) {
      await supabase
        .from('material_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('material_id', materialId);
      setBookmarked(prev => prev.filter(id => id !== materialId));
    } else {
      await supabase
        .from('material_bookmarks')
        .insert({ user_id: user.id, material_id: materialId });
      setBookmarked(prev => [...prev, materialId]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{unitName}</h1>
            <Link href="/mwaks">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Back to MWAKS
              </button>
            </Link>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                No materials available for this unit yet
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <div key={material.id} className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    {material.file_type?.includes('image') ? (
                      <img 
                        src={material.file_url} 
                        alt={material.title} 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                        <span className="text-4xl text-gray-500 mb-2">📄</span>
                        <span className="text-sm text-gray-500">{material.file_type?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 flex-1">{material.title}</h3>
                      <button
                        onClick={() => toggleBookmark(material.id)}
                        className={`ml-2 p-1 rounded ${bookmarked.includes(material.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                      >
                        ⭐
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>{material.category}</span>
                      <span>📥 {material.download_count} downloads</span>
                    </div>
                    <button
                      onClick={() => downloadFile(material)}
                      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitPage;