import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useSupabase';
import LandingPage from './landing';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to feed
  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  // Show landing page for non-authenticated users
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🎓</div>
          <h1 className="text-3xl font-bold mb-4">Karu Teens</h1>
          <p className="text-gray-300 mb-6">Kenya's Student Platform</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to feed
  }

  return <LandingPage />;
}