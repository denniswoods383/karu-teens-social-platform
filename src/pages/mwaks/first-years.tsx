import Link from 'next/link';

const FirstYears = () => {
  const units = [
    'ACS 111', 'AEE 100', 'AGR 100', 'BIT 110', 'CHE 112', 'COM 112', 
    'ECO 110', 'ENG 110', 'MAT 100', 'PHY 112', 'ZOO 112'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">First Year Units</h1>
            <Link href="/mwaks">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Back to MWAKS
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {units.map((unit) => (
              <Link key={unit} href={`/mwaks/units/${unit.replace(' ', '-')}`}>
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-4 text-white hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-bold text-lg">{unit}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstYears;