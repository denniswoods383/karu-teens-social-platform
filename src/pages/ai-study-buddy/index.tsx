import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import EnhancedNavbar from '../../components/layout/EnhancedNavbar';
import { useGamificationStore } from '../../store/gamificationStore';
import { usePremiumStore } from '../../store/premiumStore';

interface StudyRecommendation {
  id: string;
  type: 'topic' | 'resource' | 'schedule' | 'method';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  subject: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
}

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  performance: number;
  completed: boolean;
  date: string;
}

export default function AIStudyBuddyPage() {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [studyGoal, setStudyGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('recommendations');
  const { addPoints, points, level } = useGamificationStore();
  const { isPremium, hasFeatureAccess, setUpgradeModal } = usePremiumStore();

  useEffect(() => {
    if (hasFeatureAccess('unlimited_ai')) {
      loadRecommendations();
      loadStudySessions();
    }
  }, []);

  const loadRecommendations = () => {
    // AI-generated study recommendations based on user performance
    const sampleRecommendations: StudyRecommendation[] = [
      {
        id: '1',
        type: 'topic',
        title: 'Review Calculus Integration Techniques',
        description: 'Based on your recent quiz performance, focus on integration by parts and substitution methods. These concepts appear frequently in upcoming exams.',
        priority: 'high',
        subject: 'Mathematics',
        estimatedTime: '45 mins',
        difficulty: 'medium',
        source: 'Performance Analysis'
      },
      {
        id: '2',
        type: 'resource',
        title: 'Recommended: Khan Academy - Organic Chemistry',
        description: 'Your study pattern suggests visual learning works best for you. This video series covers reaction mechanisms with clear animations.',
        priority: 'medium',
        subject: 'Chemistry',
        estimatedTime: '60 mins',
        difficulty: 'hard',
        source: 'Learning Style Analysis'
      },
      {
        id: '3',
        type: 'schedule',
        title: 'Optimize Your Study Schedule',
        description: 'Your peak performance time is 2-4 PM. Schedule difficult subjects (Physics, Chemistry) during this window for better retention.',
        priority: 'high',
        subject: 'General',
        estimatedTime: '15 mins setup',
        difficulty: 'easy',
        source: 'Productivity Analysis'
      },
      {
        id: '4',
        type: 'method',
        title: 'Try Active Recall for Computer Science',
        description: 'Flashcards and practice coding problems would improve your algorithm understanding by an estimated 35% based on similar student profiles.',
        priority: 'medium',
        subject: 'Computer Science',
        estimatedTime: '30 mins/day',
        difficulty: 'medium',
        source: 'Method Optimization'
      }
    ];
    
    setRecommendations(sampleRecommendations);
  };

  const loadStudySessions = () => {
    // Recent study session data
    const sampleSessions: StudySession[] = [
      {
        id: '1',
        subject: 'Mathematics',
        topic: 'Calculus - Derivatives',
        duration: 45,
        performance: 78,
        completed: true,
        date: '2025-01-20'
      },
      {
        id: '2',
        subject: 'Chemistry', 
        topic: 'Organic Reactions',
        duration: 60,
        performance: 65,
        completed: true,
        date: '2025-01-19'
      },
      {
        id: '3',
        subject: 'Physics',
        topic: 'Thermodynamics',
        duration: 30,
        performance: 85,
        completed: false,
        date: '2025-01-18'
      }
    ];
    
    setStudySessions(sampleSessions);
  };

  const generatePersonalizedPlan = async () => {
    if (!hasFeatureAccess('unlimited_ai')) {
      setUpgradeModal(true);
      return;
    }

    setIsAnalyzing(true);
    addPoints(10, 'using AI study buddy');

    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      alert('🤖 AI Study Plan Generated! Check your recommendations for personalized insights. +10 XP');
    }, 3000);
  };

  const handleStartStudySession = (recommendation: StudyRecommendation) => {
    addPoints(5, 'starting study session');
    alert(`📚 Starting study session: ${recommendation.title}. Good luck! +5 XP`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topic': return '📖';
      case 'resource': return '🎥';
      case 'schedule': return '📅';
      case 'method': return '🧠';
      default: return '💡';
    }
  };

  const subjects = ['all', 'Mathematics', 'Chemistry', 'Physics', 'Computer Science', 'Biology', 'Literature'];

  if (!hasFeatureAccess('unlimited_ai') && !isPremium) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <EnhancedNavbar />
          
          <div className="max-w-4xl mx-auto px-4 pt-20 pb-24">
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🤖</div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                AI Study Buddy
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Get personalized study recommendations, optimize your schedule, and boost your academic performance with AI-powered insights.
              </p>
              
              {/* Feature Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Analyze your study patterns and performance to identify improvement areas</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="text-3xl mb-3">🎯</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personalized Plans</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Get custom study schedules optimized for your learning style and goals</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Recommendations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receive intelligent suggestions for topics, resources, and study methods</p>
                </div>
              </div>
              
              <button
                onClick={() => setUpgradeModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
              >
                🚀 Upgrade to Student Pro - $4.99/month
              </button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Unlock unlimited AI features and personalized study insights
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <EnhancedNavbar />
        
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  🤖 AI Study Buddy
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Your personalized academic success companion powered by AI
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                    ✨ PRO Feature
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    🔥 Streak: 0 days
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    ⚡ Level: {level}
                  </span>
                </div>
              </div>
              
              <button
                onClick={generatePersonalizedPlan}
                disabled={isAnalyzing}
                className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>🧠</span>
                    <span>Generate AI Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Goal Setting */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎯 Set Your Study Goal</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="e.g., Improve calculus grade from B to A, Master organic chemistry reactions..."
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={generatePersonalizedPlan}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                🤖 Analyze Goal
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                {[
                  { id: 'recommendations', name: 'AI Recommendations', icon: '🎯' },
                  { id: 'sessions', name: 'Study Sessions', icon: '📚' },
                  { id: 'insights', name: 'Performance Insights', icon: '📊' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'recommendations' && (
            <div>
              {/* Filter */}
              <div className="mb-6">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations
                  .filter(rec => selectedSubject === 'all' || rec.subject === selectedSubject)
                  .map((recommendation) => (
                  <div key={recommendation.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {recommendation.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(recommendation.priority)}`}>
                              {recommendation.priority} priority
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {recommendation.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                      {recommendation.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          📚 {recommendation.subject}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          💡 {recommendation.source}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleStartStudySession(recommendation)}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm"
                      >
                        🚀 Start Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">📚 Recent Study Sessions</h2>
              <div className="space-y-4">
                {studySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {session.subject.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{session.topic}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.subject} • {session.duration} mins • {session.date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        session.performance >= 80 ? 'text-green-600 dark:text-green-400' :
                        session.performance >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {session.performance}%
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        session.completed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {session.completed ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Performance Trends</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Performance</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">76%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Study Time This Week</span>
                    <span className="font-bold text-green-600 dark:text-green-400">12.5 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Strongest Subject</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">Physics</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Improvement Area</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">Chemistry</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 AI Insights</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      💡 Your peak learning time is 2-4 PM. Schedule challenging topics during this window.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      📈 Your study consistency has improved 35% this month. Keep it up!
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      ⚠️ Consider shorter, more frequent sessions for better retention in Chemistry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}