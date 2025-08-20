import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { uploadFile, storeFileMetadata } from '../lib/supabase-mwaks';
import { supabase } from '../lib/supabase';

const AdminPanel = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const allUnits = [
    'ACS 111', 'AEE 100', 'AGR 100', 'BIT 110', 'CHE 112', 'COM 112', 'ECO 110', 'ENG 110', 'MAT 100', 'PHY 112', 'ZOO 112',
    'ACS 211', 'BBM 200', 'BIT 211', 'CHE 210', 'COM 210', 'ECO 210', 'ENG 210', 'MAT 213', 'PHY 211', 'ZOO 212',
    'ACS 311', 'BBM 300', 'BIT 314', 'CHE 310', 'COM 310', 'ECO 310', 'ENG 310', 'MAT 310', 'PHY 310', 'ZOO 309',
    'ACS 411', 'BBM 400', 'BIT 410', 'CHE 410', 'COM 410', 'ECO 410', 'ENG 410', 'MAT 412', 'PHY 410', 'ZOO 413'
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        if (user.email !== 'denniswood383@gmail.com') {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
    };
    getUser();
  }, [router]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || !selectedUnit) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const uploadResult = await uploadFile(file, selectedUnit);
        await storeFileMetadata(selectedUnit, file.name, uploadResult.secure_url, file.type);
      }
      alert(`${files.length} files uploaded successfully for ${selectedUnit}`);
      setFiles(null);
      setSelectedUnit('');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user || user.email !== 'denniswood383@gmail.com') {
    return <div className="min-h-screen bg-red-50 flex items-center justify-center"><div className="text-xl text-red-600">Access Denied</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">File Upload</h2>
              <form onSubmit={handleFileUpload} className="space-y-6">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Choose a unit...</option>
                  {allUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="w-full p-3 border rounded-lg"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  required
                />
                
                <button
                  type="submit"
                  disabled={uploading || !selectedUnit || !files}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/mhesh/users'}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => window.location.href = '/mhesh/posts'}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700"
                >
                  Manage Posts
                </button>
                <button
                  onClick={() => window.location.href = '/mhesh/messaging'}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                >
                  Send Messages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;