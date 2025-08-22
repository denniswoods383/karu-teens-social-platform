import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, User, FileText, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/router';

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
  const router = useRouter();

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
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search users
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
      });

      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .textSearch('content', searchQuery)
        .limit(5);

      posts?.forEach(post => {
        searchResults.push({
          id: post.id,
          type: 'post',
          title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
          subtitle: new Date(post.created_at).toLocaleDateString(),
          created_at: post.created_at
        });
      });

      // Search marketplace
      const { data: items } = await supabase
        .from('marketplace_items')
        .select('id, title, description, price')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('is_available', true)
        .limit(5);

      items?.forEach(item => {
        searchResults.push({
          id: item.id,
          type: 'marketplace',
          title: item.title,
          subtitle: `$${item.price}`
        });
      });

      setResults(searchResults);
      setShowResults(true);
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
          onFocus={() => query.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search users, posts, marketplace..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
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
          )}
        </div>
      )}
    </div>
  );
}