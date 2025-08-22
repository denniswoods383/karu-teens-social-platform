export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Offline</h1>
        <p className="text-gray-600 mb-6">
          Check your internet connection and try again
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}