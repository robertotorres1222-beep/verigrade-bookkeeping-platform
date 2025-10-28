'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, FileText, Users, BarChart3, Calculator, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'feature' | 'data' | 'action';
  url?: string;
  icon: React.ReactNode;
  category: string;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Dashboard',
    description: 'Main dashboard with financial overview',
    type: 'page',
    url: '/dashboard',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Navigation'
  },
  {
    id: '2',
    title: 'Practice Dashboard',
    description: 'Manage your practice and clients',
    type: 'page',
    url: '/practice',
    icon: <Users className="w-4 h-4" />,
    category: 'Navigation'
  },
  {
    id: '3',
    title: 'AI Assistant',
    description: 'AI-powered bookkeeping assistance',
    type: 'page',
    url: '/ai-assistant',
    icon: <Calculator className="w-4 h-4" />,
    category: 'Navigation'
  },
  {
    id: '4',
    title: 'Tax Calendar',
    description: 'Track tax deadlines and reminders',
    type: 'page',
    url: '/tax-calendar',
    icon: <Calendar className="w-4 h-4" />,
    category: 'Navigation'
  },
  {
    id: '5',
    title: 'Create Invoice',
    description: 'Generate new invoice for client',
    type: 'action',
    icon: <FileText className="w-4 h-4" />,
    category: 'Actions'
  },
  {
    id: '6',
    title: 'Export Data',
    description: 'Export financial data to CSV/Excel',
    type: 'action',
    icon: <FileText className="w-4 h-4" />,
    category: 'Actions'
  },
  {
    id: '7',
    title: 'Recent Transactions',
    description: 'View recent financial transactions',
    type: 'data',
    icon: <Clock className="w-4 h-4" />,
    category: 'Data'
  }
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = mockSearchResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase()) ||
      result.category.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      window.location.href = result.url;
    } else {
      // Handle action results
      const event = new CustomEvent('executeAction', { detail: result });
      window.dispatchEvent(event);
    }
    onClose();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'text-blue-600 bg-blue-50';
      case 'action': return 'text-green-600 bg-green-50';
      case 'data': return 'text-purple-600 bg-purple-50';
      case 'feature': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for pages, features, or actions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 outline-none text-lg placeholder-gray-400"
              />
              <button
                onClick={onClose}
                className="ml-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Results */}
            {query && (
              <div ref={resultsRef} className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center flex-1">
                          <div className="mr-3 text-gray-400">
                            {result.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {result.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.description}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(result.type)}`}>
                              {result.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {result.category}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No results found for "{query}"</p>
                    <p className="text-sm mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {!query && (
              <div className="p-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-3">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const event = new CustomEvent('createNewItem');
                      window.dispatchEvent(event);
                      onClose();
                    }}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create Invoice
                  </button>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('exportData');
                      window.dispatchEvent(event);
                      onClose();
                    }}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

