import { useState } from 'react';
import { Clock, BookOpen, BarChart3, RotateCcw, Filter } from 'lucide-react';

interface PastPaper {
  id: string;
  subject: string;
  year: number;
  university: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: number;
  timeLimit: number;
}

const mockPapers: PastPaper[] = [
  { id: '1', subject: 'Mathematics', year: 2023, university: 'University of Nairobi', difficulty: 'Medium', questions: 10, timeLimit: 120 },
  { id: '2', subject: 'Chemistry', year: 2023, university: 'Kenyatta University', difficulty: 'Hard', questions: 15, timeLimit: 180 },
  { id: '3', subject: 'Physics', year: 2022, university: 'Moi University', difficulty: 'Easy', questions: 8, timeLimit: 90 }
];

export default function PastPapersHero() {
  const [selectedMode, setSelectedMode] = useState<'timed' | 'topic' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    university: '',
    year: ''
  });

  const weakTopics = ['Calculus', 'Organic Chemistry', 'Thermodynamics'];

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          📄 Past Papers Practice
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Quick Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button
          onClick={() => setSelectedMode('timed')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedMode === 'timed' 
              ? 'border-yellow-300 bg-white/20' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/10'
          }`}
        >
          <Clock className="w-6 h-6 mb-2 mx-auto" />
          <div className="font-semibold">Timed Mode</div>
          <div className="text-sm opacity-80">Exam conditions</div>
        </button>

        <button
          onClick={() => setSelectedMode('topic')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedMode === 'topic' 
              ? 'border-yellow-300 bg-white/20' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-6 h-6 mb-2 mx-auto" />
          <div className="font-semibold">Topic Mode</div>
          <div className="text-sm opacity-80">Practice by subject</div>
        </button>

        <button className="p-4 rounded-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all">
          <BarChart3 className="w-6 h-6 mb-2 mx-auto" />
          <div className="font-semibold">Analytics</div>
          <div className="text-sm opacity-80">Track progress</div>
        </button>
      </div>

      {/* Retry Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">🎯 Focus on weak areas</span>
            <button className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center">
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry Weak Topics
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map(topic => (
              <span key={topic} className="bg-red-500/20 text-red-100 px-2 py-1 rounded text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/10 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <select 
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="bg-white/20 border border-white/30 rounded px-3 py-2 text-white placeholder-white/70"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
          </select>

          <select 
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="bg-white/20 border border-white/30 rounded px-3 py-2 text-white"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select 
            value={filters.university}
            onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
            className="bg-white/20 border border-white/30 rounded px-3 py-2 text-white"
          >
            <option value="">All Universities</option>
            <option value="University of Nairobi">UoN</option>
            <option value="Kenyatta University">KU</option>
            <option value="Moi University">Moi</option>
          </select>

          <select 
            value={filters.year}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="bg-white/20 border border-white/30 rounded px-3 py-2 text-white"
          >
            <option value="">All Years</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      )}

      {/* Recent Papers */}
      <div className="space-y-2">
        <h3 className="font-semibold mb-2">📚 Recent Papers</h3>
        {mockPapers.slice(0, 3).map(paper => (
          <div key={paper.id} className="bg-white/10 rounded-lg p-3 flex items-center justify-between hover:bg-white/20 transition-colors cursor-pointer">
            <div>
              <div className="font-medium">{paper.subject} {paper.year}</div>
              <div className="text-sm opacity-80">{paper.university} • {paper.questions} questions • {paper.timeLimit}min</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${
                paper.difficulty === 'Easy' ? 'bg-green-500/20 text-green-100' :
                paper.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-100' :
                'bg-red-500/20 text-red-100'
              }`}>
                {paper.difficulty}
              </span>
              <button className="bg-white text-indigo-600 px-3 py-1 rounded font-medium text-sm hover:bg-gray-100 transition-colors">
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}