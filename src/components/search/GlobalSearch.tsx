import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, User, FileText, ShoppingBag, Clock, TrendingUp, Filter } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useSupabase';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'marketplace';
  title: string;
  subtitle?: string;
  avatar?: string;
  created_at?: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', dateRange: 'all' });
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadSearchHistory();
    loadPopularSearches();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, filters]);

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
      const searchResults: SearchResult[] = [];
      let totalResults = 0;

      // Apply filters
      const shouldSearchUsers = filters.type === 'all' || filters.type === 'users';
      const shouldSearchPosts = filters.type === 'all' || filters.type === 'posts';
      const shouldSearchMarketplace = filters.type === 'all' || filters.type === 'marketplace';

      // Date filter
      let dateFilter = '';
      if (filters.dateRange === 'week') {
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (filters.dateRange === 'month') {
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Search users with full-text search
      if (shouldSearchUsers) {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(5);

        users?.forEach(user => {
          searchResults.push({
            id: user.id,
            type: 'user',
            title: user.full_name || user.username,
            subtitle: `@${user.username}`,
            avatar: user.avatar_url
          });
          totalResults++;
        });
      }

      // Search posts with improved search
      if (shouldSearchPosts) {
        let postsQuery = supabase
          .from('posts')
          .select('id, content, created_at')
          .ilike('content', `%${searchQuery}%`)
          .limit(5);
        
        if (dateFilter) {
          postsQuery = postsQuery.gte('created_at', dateFilter);
        }

        const { data: posts } = await postsQuery;

        posts?.forEach(post => {
          searchResults.push({
            id: post.id,
            type: 'post',
            title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
            subtitle: new Date(post.created_at).toLocaleDateString(),
            created_at: post.created_at
          });
          totalResults++;
        });
      }

      // Search marketplace
      if (shouldSearchMarketplace) {
        let marketplaceQuery = supabase
          .from('marketplace_items')
          .select('id, title, description, price, created_at')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .eq('is_available', true)
          .limit(5);
        
        if (dateFilter) {
          marketplaceQuery = marketplaceQuery.gte('created_at', dateFilter);
        }

        const { data: items } = await marketplaceQuery;

        items?.forEach(item => {
          searchResults.push({
            id: item.id,
            type: 'marketplace',
            title: item.title,
            subtitle: `$${item.price}`
          });
          totalResults++;
        });
      }

      setResults(searchResults);
      setShowResults(true);
      
      // Track search
      await supabase.rpc('track_search', { 
        search_query: searchQuery, 
        results_count: totalResults 
      });
      
    } catch (error) {
      console.error('Search failed:', error);
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
      case 'post':
        router.push(`/feed#post-${result.id}`);
        break;
      case 'marketplace':
        router.push(`/marketplace#item-${result.id}`);
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
      case 'marketplace': return <ShoppingBag className="w-4 h-4" />;
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
            else setShowResults(true); // Show history/suggestions
          }}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search users, posts, marketplace..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-1 border rounded text-sm"
              >
                <option value="all">All</option>
                <option value="users">Users</option>
                <option value="posts">Posts</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showResults && (
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
                    <div className="text-xs text-gray-400 capitalize">
                      {result.type}
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