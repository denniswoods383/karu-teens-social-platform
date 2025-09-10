import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useSupabase';

export default function PostsDebug() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .limit(5);
        
        if (error) {
          setError(`Database error: ${error.message}`);
        } else {
          setPosts(data || []);
        }
      } catch (err) {
        setError(`Connection error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkPosts();
    }
  }, [user]);

  if (loading) return <div>Checking posts...</div>;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <h3 className="font-bold">Posts Debug Info:</h3>
      <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
      <p>Posts found: {posts.length}</p>
      {error && <p>Error: {error}</p>}
      {posts.length > 0 && (
        <div>
          <p>Sample post: {JSON.stringify(posts[0], null, 2)}</p>
        </div>
      )}
    </div>
  );
}