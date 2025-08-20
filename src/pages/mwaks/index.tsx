import Link from 'next/link';

const MWAKSHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">MWAKS</h1>
            <p className="text-lg text-gray-600">Moi University West Academic Knowledge System</p>
            <p className="text-sm text-gray-500 mt-2">Access study materials by year level</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/mwaks/first-years">
              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">1st Years</h2>
                <p className="text-green-100">100-level courses</p>
              </div>
            </Link>

            <Link href="/mwaks/second-years">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">2nd Years</h2>
                <p className="text-blue-100">200-level courses</p>
              </div>
            </Link>

            <Link href="/mwaks/third-years">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">3rd Years</h2>
                <p className="text-purple-100">300-level courses</p>
              </div>
            </Link>

            <Link href="/mwaks/fourth-years">
              <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">4th Years</h2>
                <p className="text-red-100">400-level courses</p>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/feed">
              <button className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                Back to Feed
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MWAKSHome;