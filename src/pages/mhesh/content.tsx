import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';

export default function ContentModerationPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== 'denniswood383@gmail.com') {
      router.push('/');
      return;
    }
    setUser(user);
    loadReports();
    loadFlaggedPosts();
  };

  const loadReports = async () => {
    try {
      const { data } = await supabase
        .from('content_reports')
        .select(`
          *,
          reporter:profiles!reporter_id(full_name, username),
          reported_post:posts(id, content, user_id),
          reported_user:profiles!reported_user_id(full_name, username, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setReports(data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadFlaggedPosts = async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!user_id(full_name, username),
          reports:content_reports(count)
        `)
        .gt('content_reports.count', 0)
        .order('created_at', { ascending: false });
      
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to load flagged posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({
          status: action,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (!error) {
        // Log admin action
        await supabase
          .from('admin_actions')
          .insert({
            admin_id: user?.id,
            action_type: 'report_reviewed',
            target_id: reportId,
            details: { action }
          });

        alert(`Report ${action} successfully`);
        loadReports();
      }
    } catch (error) {
      console.error('Failed to handle report:', error);
      alert('Failed to process report');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (!error) {
        // Log admin action
        await supabase
          .from('admin_actions')
          .insert({
            admin_id: user?.id,
            action_type: 'post_deleted',
            target_id: postId,
            details: { reason: 'admin_moderation' }
          });

        alert('Post deleted successfully');
        loadFlaggedPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <EnhancedNavbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Pending Reports</h2>
              <p className="text-gray-600">Review user reports and take action</p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Report by {report.reporter?.full_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Reason: {report.reason}
                          </p>
                          {report.details && (
                            <p className="text-sm text-gray-700 mt-1">
                              Details: {report.details}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {report.reported_post && (
                        <div className="bg-gray-50 p-3 rounded mb-3">
                          <p className="text-sm text-gray-700">
                            Reported Post: {report.reported_post.content.substring(0, 100)}...
                          </p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReport(report.id, 'resolved')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleReport(report.id, 'dismissed')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {reports.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No pending reports
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Flagged Posts Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Flagged Content</h2>
              <p className="text-gray-600">Posts with multiple reports</p>
            </div>

            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          By {post.author?.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {post.reports?.[0]?.count || 0} reports
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-sm text-gray-700">
                        {post.content}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deletePost(post.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete Post
                      </button>
                      <button
                        onClick={() => window.open(`/feed#post-${post.id}`, '_blank')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        View Post
                      </button>
                    </div>
                  </div>
                ))}
                
                {posts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No flagged content
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}