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
    <div className="card-hero" style={{ background: 'var(--gradient-secondary)', color: 'white' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          📄 Past Papers Practice
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Quick Mode Selection */}
      <div className="grid-3 mb-6">
        <button
          onClick={() => setSelectedMode('timed')}
          className={`p-6 rounded-lg border-2 transition-all text-center ${
            selectedMode === 'timed' 
              ? 'border-yellow-300 bg-white/20' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/10'
          }`}
        >
          <Clock className="w-8 h-8 mb-3 mx-auto" />
          <div className="font-semibold mb-1">Timed Mode</div>
          <div className="text-sm opacity-80">Exam conditions</div>
        </button>

        <button
          onClick={() => setSelectedMode('topic')}
          className={`p-6 rounded-lg border-2 transition-all text-center ${
            selectedMode === 'topic' 
              ? 'border-yellow-300 bg-white/20' 
              : 'border-white/30 hover:border-white/50 hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-8 h-8 mb-3 mx-auto" />
          <div className="font-semibold mb-1">Topic Mode</div>
          <div className="text-sm opacity-80">Practice by subject</div>
        </button>

        <button className="p-6 rounded-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all text-center">
          <BarChart3 className="w-8 h-8 mb-3 mx-auto" />
          <div className="font-semibold mb-1">Analytics</div>
          <div className="text-sm opacity-80">Track progress</div>
        </button>
      </div>

      {/* Retry Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="bg-white/10 rounded-lg p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">🎯 Focus on weak areas</span>
            <button className="btn btn-sm" style={{ background: 'var(--gradient-warning)', color: 'white' }}>
              <RotateCcw className="w-4 h-4" />
              Retry Weak Topics
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map(topic => (
              <div key={topic} className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'rgb(254, 202, 202)' }}>
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/10 rounded-lg p-4 grid-4 mb-6 animate-slide-up">
          <select 
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="input bg-white/20 border-white/30 text-white placeholder-white/70"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
          </select>

          <select 
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="input bg-white/20 border-white/30 text-white"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select 
            value={filters.university}
            onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
            className="input bg-white/20 border-white/30 text-white"
          >
            <option value="">All Universities</option>
            <option value="University of Nairobi">UoN</option>
            <option value="Kenyatta University">KU</option>
            <option value="Moi University">Moi</option>
          </select>

          <select 
            value={filters.year}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="input bg-white/20 border-white/30 text-white"
          >
            <option value="">All Years</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      )}

      {/* Recent Papers */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">📚 Recent Papers</h3>
        <div className="space-y-3">
          {mockPapers.slice(0, 3).map(paper => (
            <div key={paper.id} className="bg-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-all cursor-pointer">
              <div>
                <div className="font-medium text-lg mb-1">{paper.subject} {paper.year}</div>
                <div className="text-sm opacity-80">{paper.university} • {paper.questions} questions • {paper.timeLimit}min</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`badge ${
                  paper.difficulty === 'Easy' ? 'badge-success' :
                  paper.difficulty === 'Medium' ? 'badge-warning' :
                  'bg-red-500 text-white'
                }`}>
                  {paper.difficulty}
                </div>
                <button className="btn btn-primary bg-white text-indigo-600 hover:bg-gray-100">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}