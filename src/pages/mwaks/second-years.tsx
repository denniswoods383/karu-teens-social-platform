import Link from 'next/link';

const SecondYears = () => {
  const units = [
    'ACS 211', 'BBM 200', 'BIT 211', 'CHE 210', 'COM 210', 
    'ECO 210', 'ENG 210', 'MAT 213', 'PHY 211', 'ZOO 212'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Second Year Units</h1>
            <Link href="/mwaks">
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Back to MWAKS</button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {units.map((unit) => (
              <Link key={unit} href={`/mwaks/units/${unit.replace(' ', '-')}`}>
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white hover:shadow-lg transition-shadow cursor-pointer">
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

export default SecondYears;