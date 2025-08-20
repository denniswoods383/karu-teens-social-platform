import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  nextSession: string;
  creator: string;
  tags: string[];
}

export default function StudyGroupsPage() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const { addPoints, unlockAchievement } = useGamificationStore();
  const { isPremium, setUpgradeModal } = usePremiumStore();

  useEffect(() => {
    loadStudyGroups();
  }, []);

  const loadStudyGroups = () => {
    // Sample study groups data
    const sampleGroups: StudyGroup[] = [
      {
        id: '1',
        name: 'Advanced Calculus Study Circle',
        subject: 'Mathematics',
        description: 'Tackling derivatives, integrals, and real-world applications together.',
        members: 8,
        maxMembers: 12,
        isPrivate: false,
        difficulty: 'Advanced',
        nextSession: '2025-01-22T14:00:00',
        creator: 'Sarah Kim',
        tags: ['calculus', 'derivatives', 'integrals']
      },
      {
        id: '2',
        name: 'Computer Science Algorithms',
        subject: 'Computer Science',
        description: 'Breaking down complex algorithms and data structures step by step.',
        members: 15,
        maxMembers: 20,
        isPrivate: false,
        difficulty: 'Intermediate',
        nextSession: '2025-01-21T16:30:00',
        creator: 'Alex Chen',
        tags: ['algorithms', 'data-structures', 'programming']
      },
      {
        id: '3',
        name: 'Organic Chemistry Masters',
        subject: 'Chemistry',
        description: 'Mastering reactions, mechanisms, and synthesis patterns.',
        members: 6,
        maxMembers: 10,
        isPrivate: true,
        difficulty: 'Advanced',
        nextSession: '2025-01-23T10:00:00',
        creator: 'Maria Rodriguez',
        tags: ['organic', 'reactions', 'synthesis']
      },
      {
        id: '4',
        name: 'Physics Problem Solving',
        subject: 'Physics',
        description: 'Collaborative approach to tackling challenging physics problems.',
        members: 12,
        maxMembers: 15,
        isPrivate: false,
        difficulty: 'Intermediate',
        nextSession: '2025-01-22T19:00:00',
        creator: 'David Liu',
        tags: ['mechanics', 'thermodynamics', 'electromagnetism']
      },
      {
        id: '5',
        name: 'Business Strategy Case Studies',
        subject: 'Business',
        description: 'Analyzing real-world business cases and strategic decisions.',
        members: 10,
        maxMembers: 12,
        isPrivate: false,
        difficulty: 'Beginner',
        nextSession: '2025-01-21T13:00:00',
        creator: 'Jessica Park',
        tags: ['strategy', 'case-studies', 'management']
      }
    ];
    
    setStudyGroups(sampleGroups);
  };

  const subjects = ['all', 'Mathematics', 'Computer Science', 'Chemistry', 'Physics', 'Business', 'Biology', 'Literature'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = filterSubject === 'all' || group.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || group.difficulty === filterDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleJoinGroup = (groupId: string) => {
    addPoints(15, 'joining a study group');
    unlockAchievement('study_master');
    alert('🎉 Successfully joined the study group! +15 XP');
  };

  const handleCreateGroup = () => {
    if (!isPremium) {
      setUpgradeModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatNextSession = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `In ${diffHours} hours`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  📚 Study Groups
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Collaborate, learn, and achieve academic excellence together
                </p>
              </div>
              
              <button
                onClick={handleCreateGroup}
                className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Create Group</span>
                {!isPremium && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">PRO</span>}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Groups
                </label>
                <input
                  type="text"
                  placeholder="Search by name, subject, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'all' ? 'All Levels' : difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Study Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                      {group.name}
                    </h3>
                    {group.isPrivate && (
                      <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full">
                        🔒 Private
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      📖 {group.subject}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(group.difficulty)}`}>
                      {group.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {group.description}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Members</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {group.members}/{group.maxMembers}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Next Session</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatNextSession(group.nextSession)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Created by</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {group.creator}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(group.members / group.maxMembers) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {Math.round((group.members / group.maxMembers) * 100)}% full
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.members >= group.maxMembers}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {group.members >= group.maxMembers ? '✋ Full' : '🚀 Join Group'}
                    </button>
                    
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      📖 View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No study groups found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters or create a new study group
              </p>
              <button
                onClick={handleCreateGroup}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}