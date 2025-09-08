import { useState } from 'react';

interface Group {
  id: string;
  name: string;
  subject: string;
  activeMembers: number;
  nextSession: string;
  topAnswers: number;
  memberAvatars: string[];
  isJoined: boolean;
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Engineering Mathematics',
    subject: 'Mathematics',
    activeMembers: 24,
    nextSession: 'Today 7:00 PM',
    topAnswers: 12,
    memberAvatars: ['/api/placeholder/32/32', '/api/placeholder/32/32', '/api/placeholder/32/32'],
    isJoined: false
  },
  {
    id: '2',
    name: 'Organic Chemistry Study',
    subject: 'Chemistry',
    activeMembers: 18,
    nextSession: 'Tomorrow 6:30 PM',
    topAnswers: 8,
    memberAvatars: ['/api/placeholder/32/32', '/api/placeholder/32/32'],
    isJoined: false
  },
  {
    id: '3',
    name: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    activeMembers: 31,
    nextSession: 'Wed 8:00 PM',
    topAnswers: 15,
    memberAvatars: ['/api/placeholder/32/32', '/api/placeholder/32/32', '/api/placeholder/32/32', '/api/placeholder/32/32'],
    isJoined: false
  }
];

export default function RecommendedGroups() {
  const [groups, setGroups] = useState(mockGroups);

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: true, activeMembers: group.activeMembers + 1 }
        : group
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🎯 Perfect Study Groups for You</h2>
        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
          Explore More
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{group.name}</h3>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {group.subject}
                </span>
              </div>
              <button
                onClick={() => handleJoinGroup(group.id)}
                disabled={group.isJoined}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  group.isJoined
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 active:scale-95'
                }`}
              >
                {group.isJoined ? '✓ You\'re in!' : 'Join Now'}
              </button>
            </div>

            {/* Active Members */}
            <div className="flex items-center mb-2">
              <div className="flex -space-x-2 mr-2">
                {group.memberAvatars.slice(0, 3).map((avatar, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-xs text-white font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                ))}
                {group.memberAvatars.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600">
                <span className="font-medium text-green-600">{group.activeMembers}</span> students online
              </span>
            </div>

            {/* Next Session */}
            <div className="flex items-center mb-2">
              <span className="text-xs text-gray-500 mr-1">📅</span>
              <span className="text-xs text-gray-700 font-medium">{group.nextSession}</span>
            </div>

            {/* Top Answers */}
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-1">🏆</span>
              <span className="text-xs text-gray-700">
                <span className="font-medium text-orange-600">{group.topAnswers}</span> helpful answers shared
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}