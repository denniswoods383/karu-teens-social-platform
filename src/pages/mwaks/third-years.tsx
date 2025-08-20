import Link from 'next/link';

const ThirdYears = () => {
  const units = [
    'ACS 311', 'BBM 300', 'BIT 314', 'CHE 310', 'COM 310', 
    'ECO 310', 'ENG 310', 'MAT 310', 'PHY 310', 'ZOO 309'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Third Year Units</h1>
            <Link href="/mwaks">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Back to MWAKS</button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {units.map((unit) => (
              <Link key={unit} href={`/mwaks/units/${unit.replace(' ', '-')}`}>
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-4 text-white hover:shadow-lg transition-shadow cursor-pointer">
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

export default ThirdYears;