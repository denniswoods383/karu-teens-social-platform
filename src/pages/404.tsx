import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🎓</div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Looks like you've wandered off campus! The page you're looking for doesn't exist.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Go Back
          </button>
          <Link href="/feed">
            <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              🏠 Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}