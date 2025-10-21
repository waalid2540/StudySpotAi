import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Home,
  BookOpen,
  MessageSquare,
  FileQuestion,
  BarChart3,
  Trophy,
  Users,
  FileText,
  CreditCard,
  Settings,
  Shield,
  Plus,
  Play,
  Sparkles,
  User,
  ArrowRight,
} from 'lucide-react';
import { searchService, type SearchResult } from '../services/searchService';
import { useAuth } from '../contexts/AuthContext';

const iconMap: Record<string, any> = {
  Home,
  BookOpen,
  MessageSquare,
  FileQuestion,
  BarChart3,
  Trophy,
  Users,
  FileText,
  CreditCard,
  Settings,
  Shield,
  Plus,
  Play,
  Sparkles,
  User,
};

const SearchBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(searchService.getRecentSearches());

    // Global keyboard shortcut (Ctrl+K or Cmd+K)
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const searchResults = searchService.search(query, user?.role);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, user?.role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;

    const searchResults = searchService.search(searchQuery, user?.role);
    if (searchResults.length > 0) {
      searchService.addToRecentSearches(searchQuery);
      navigate(searchResults[0].url);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    searchService.addToRecentSearches(query || result.title);
    navigate(result.url);
    setQuery('');
    setIsOpen(false);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    const searchResults = searchService.search(recentQuery, user?.role);
    setResults(searchResults);
  };

  const clearRecentSearches = () => {
    searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results.length > 0) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Search;
    return Icon;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Navigation: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      Learning: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      Progress: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      Communication: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      Account: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700',
      Administration: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      Analytics: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
      Family: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20',
      'Quick Action': 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    };
    return colors[category] || colors.Account;
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages, homework, quizzes... (Ctrl+K)"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2 pl-10 pr-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl max-h-96 overflow-y-auto z-50"
        >
          {query.trim().length >= 2 ? (
            // Search Results
            results.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Search Results ({results.length})
                </div>
                {results.map((result, index) => {
                  const Icon = getIcon(result.icon);
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${getCategoryColor(result.category)} flex-shrink-0`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(result.category)}`}>
                            {result.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                          {result.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-gray-900 dark:text-white font-medium mb-1">No results found</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Try a different search term
                </p>
              </div>
            )
          ) : (
            // Recent Searches & Popular
            <div className="py-2">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Recent Searches
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((recentQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(recentQuery)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {recentQuery}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Popular Searches
                </div>
                {searchService.getPopularSearches().map((popular, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(popular)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{popular}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-3 py-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Tip: Press{' '}
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                    Enter
                  </kbd>{' '}
                  to navigate,{' '}
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                    ↑↓
                  </kbd>{' '}
                  to move
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
