'use client';

import { HTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: string;
  href: string;
  icon?: React.ReactNode;
}

interface SearchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'results'> {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  results?: SearchResult[];
  loading?: boolean;
  showResults?: boolean;
  maxResults?: number;
}

const Search = forwardRef<HTMLDivElement, SearchProps>(
  ({
    className,
    placeholder = 'Search...',
    onSearch,
    onResultSelect,
    results = [],
    loading = false,
    showResults = true,
    maxResults = 10,
    ...props
  }, ref) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const filteredResults = results.slice(0, maxResults);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => 
              prev < filteredResults.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => 
              prev > 0 ? prev - 1 : filteredResults.length - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
              handleResultSelect(filteredResults[selectedIndex]);
            }
            break;
          case 'Escape':
            setIsOpen(false);
            setSelectedIndex(-1);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredResults]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setIsOpen(value.length > 0);
      setSelectedIndex(-1);
      
      if (onSearch) {
        onSearch(value);
      }
    };

    const handleResultSelect = (result: SearchResult) => {
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
      
      if (onResultSelect) {
        onResultSelect(result);
      }
    };

    const clearSearch = () => {
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(query.length > 0)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {isOpen && showResults && (
          <div
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Searching...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="py-1">
                {filteredResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150',
                      selectedIndex === index && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {result.icon && (
                        <div className="flex-shrink-0 text-gray-400">
                          {result.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        {result.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {result.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 capitalize">
                          {result.type}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No results found</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
Search.displayName = 'Search';

export { Search };

