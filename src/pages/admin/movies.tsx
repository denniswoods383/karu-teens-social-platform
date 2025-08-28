import ProtectedRoute from '../../components/auth/ProtectedRoute';
import MovieUpload from '../../components/admin/MovieUpload';

export default function AdminMovies() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Movie Management</h1>
          <MovieUpload />
        </div>
      </div>
    </ProtectedRoute>
  );
}