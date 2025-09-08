import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, User, FileText, Users, BookOpen, Clock, TrendingUp, Filter, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useSupabase';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'group' | 'question' | 'pastpaper';
  title: string;
  subtitle?: string;
  avatar?: string;
  difficulty?: string;
  subject?: string;
  year?: number;
  answered?: boolean;
  university?: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    subject: '',
    difficulty: '',
    university: '',
    year: '',
    type: '',
    answered: ''
  });
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadSearchHistory();
    loadPopularSearches();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const loadSearchHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('search_history')
      .select('query')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    setSearchHistory(data?.map(h => h.query) || []);
  };

  const loadPopularSearches = async () => {
    const { data } = await supabase
      .from('popular_searches')
      .select('query')
      .order('search_count', { ascending: false })
      .limit(5);
    
    setPopularSearches(data?.map(p => p.query) || []);
  };

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results: SearchResult[] = [];
      
      // Apply filters
      const shouldIncludeType = (type: string) => !filters.type || filters.type === type;
      
      // Search users (people)
      if (shouldIncludeType('user')) {
        let userQuery = supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, university')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
        
        if (filters.university) userQuery = userQuery.eq('university', filters.university);
        
        const { data: users } = await userQuery.limit(3);
        
        users?.forEach(user => {
          results.push({
            id: user.id,
            type: 'user',
            title: user.full_name || user.username,
            subtitle: `@${user.username} • ${user.university}`,
            avatar: user.avatar_url,
            university: user.university
          });
        });
      }
      
      // Search groups
      if (shouldIncludeType('group')) {
        let groupQuery = supabase
          .from('study_groups')
          .select('id, name, subject, member_count')
          .or(`name.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
        
        if (filters.subject) groupQuery = groupQuery.eq('subject', filters.subject);
        
        const { data: groups } = await groupQuery.limit(3);
        
        groups?.forEach(group => {
          results.push({
            id: group.id,
            type: 'group',
            title: group.name,
            subtitle: `${group.subject} • ${group.member_count} members`,
            subject: group.subject
          });
        });
      }
      
      // Search questions
      if (shouldIncludeType('question')) {
        let questionQuery = supabase
          .from('posts')
          .select('id, content, tags, created_at, answer_count')
          .eq('type', 'question')
          .ilike('content', `%${searchQuery}%`);
        
        if (filters.subject) questionQuery = questionQuery.contains('tags', [filters.subject]);
        if (filters.answered === 'unanswered') questionQuery = questionQuery.eq('answer_count', 0);
        if (filters.answered === 'answered') questionQuery = questionQuery.gt('answer_count', 0);
        
        const { data: questions } = await questionQuery.limit(3);
        
        questions?.forEach(question => {
          results.push({
            id: question.id,
            type: 'question',
            title: question.content.substring(0, 60) + (question.content.length > 60 ? '...' : ''),
            subtitle: `${question.answer_count || 0} answers • ${question.tags?.join(', ') || 'General'}`,
            answered: (question.answer_count || 0) > 0
          });
        });
      }
      
      // Search past papers
      if (shouldIncludeType('pastpaper')) {
        let paperQuery = supabase
          .from('past_papers')
          .select('id, subject, year, university, difficulty, question_count')
          .or(`subject.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`);
        
        if (filters.subject) paperQuery = paperQuery.eq('subject', filters.subject);
        if (filters.difficulty) paperQuery = paperQuery.eq('difficulty', filters.difficulty);
        if (filters.university) paperQuery = paperQuery.eq('university', filters.university);
        if (filters.year) paperQuery = paperQuery.eq('year', parseInt(filters.year));
        
        const { data: papers } = await paperQuery.limit(3);
        
        papers?.forEach(paper => {
          results.push({
            id: paper.id,
            type: 'pastpaper',
            title: `${paper.subject} ${paper.year}`,
            subtitle: `${paper.university} • ${paper.question_count} questions • ${paper.difficulty}`,
            subject: paper.subject,
            year: paper.year,
            difficulty: paper.difficulty,
            university: paper.university
          });
        });
      }

      setResults(results);
      
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    
    switch (result.type) {
      case 'user':
        router.push(`/profile/${result.id}`);
        break;
      case 'question':
      case 'post':
        window.dispatchEvent(new CustomEvent('openPostModal', { detail: { postId: result.id } }));
        break;
      case 'group':
        router.push(`/groups/${result.id}`);
        break;
      case 'pastpaper':
        router.push(`/pastpapers/${result.id}`);
        break;
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    performSearch(historyQuery);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'post': return <FileText className="w-4 h-4" />;
      case 'question': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'group': return <Users className="w-4 h-4" />;
      case 'pastpaper': return <BookOpen className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) setShowResults(true);
            else setShowResults(true);
          }}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search people, groups, questions, past papers..."
          className="w-full pl-10 pr-16 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Search Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">All Types</option>
              <option value="user">People</option>
              <option value="group">Groups</option>
              <option value="question">Questions</option>
              <option value="pastpaper">Past Papers</option>
            </select>
            
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
            </select>
            
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            
            <select
              value={filters.university}
              onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">All Universities</option>
              <option value="University of Nairobi">UoN</option>
              <option value="Kenyatta University">KU</option>
              <option value="Moi University">Moi</option>
            </select>
            
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">All Years</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
            
            <select
              value={filters.answered}
              onChange={(e) => setFilters(prev => ({ ...prev, answered: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
            >
              <option value="">All Questions</option>
              <option value="unanswered">Unanswered</option>
              <option value="answered">Answered</option>
            </select>
          </div>
        </div>
      )}
      
      {showResults && !showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : query.length >= 2 ? (
            results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                  >
                    <div className="text-gray-500 dark:text-gray-400">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.answered === false && result.type === 'question' && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Unanswered</span>
                      )}
                      {result.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                          result.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {result.difficulty}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 capitalize">
                        {result.type === 'pastpaper' ? 'Past Paper' : result.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )
          ) : (
            <div className="py-2">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Recent Searches
                  </div>
                  {searchHistory.map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(historyItem)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {historyItem}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <div className={searchHistory.length > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Popular Searches
                  </div>
                  {popularSearches.map((popularItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(popularItem)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {popularItem}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}