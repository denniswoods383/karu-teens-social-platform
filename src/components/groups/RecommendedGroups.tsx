import { useState } from 'react';
import '../../styles/design-system.css';

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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">🎯 Perfect Study Groups for You</h2>
        <button className="btn btn-sm" style={{ color: 'var(--color-primary)' }}>
          Explore More
        </button>
      </div>

      <div className="grid-3">
        {groups.map((group) => (
          <div key={group.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                <div className="badge badge-outline" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                  {group.subject}
                </div>
              </div>
              <button
                onClick={() => handleJoinGroup(group.id)}
                disabled={group.isJoined}
                className={`btn btn-sm ${
                  group.isJoined
                    ? 'badge badge-success cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {group.isJoined ? '✓ You\'re in!' : 'Join Now'}
              </button>
            </div>

            {/* Active Members */}
            <div className="flex items-center mb-3">
              <div className="flex -space-x-2 mr-3">
                {group.memberAvatars.slice(0, 3).map((avatar, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ background: 'var(--gradient-primary)' }}
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
              <span className="text-sm text-gray-600">
                <span className="font-semibold" style={{ color: 'var(--color-success)' }}>{group.activeMembers}</span> students online
              </span>
            </div>

            {/* Session & Answers Info */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">📅</span>
                <span className="text-sm text-gray-700 font-medium">{group.nextSession}</span>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">🏆</span>
                <span className="text-sm text-gray-700">
                  <span className="font-semibold" style={{ color: 'var(--color-warning)' }}>{group.topAnswers}</span> helpful answers shared
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}