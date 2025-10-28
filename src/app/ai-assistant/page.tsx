'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Send,
  History,
  Star,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Lightbulb,
  RefreshCw,
  X,
  Plus,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';

interface QueryResult {
  type: 'chart' | 'table' | 'summary' | 'list';
  data: any;
  visualization?: {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
    config: any;
  };
  title: string;
  description: string;
}

interface QueryHistory {
  id: string;
  query: string;
  intent: string;
  result: QueryResult;
  timestamp: string;
}

interface FavoriteQuery {
  id: string;
  query: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function AIAssistantPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [favorites, setFavorites] = useState<FavoriteQuery[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [results]);

  const loadInitialData = async () => {
    try {
      // Load suggestions
      const suggestionsResponse = await fetch('/api/organizations/current/users/current/queries/suggestions');
      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        setSuggestions(suggestionsData.data.suggestions);
      }

      // Load favorites
      const favoritesResponse = await fetch('/api/organizations/current/users/current/queries/favorites');
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavorites(favoritesData.data.favorites);
      }

      // Load history
      const historyResponse = await fetch('/api/organizations/current/users/current/queries/history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.data.queries);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitQuery = async (queryText: string = query) => {
    if (!queryText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/organizations/current/users/current/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });

      if (response.ok) {
        const data = await response.json();
        const newResult = data.data.result;
        
        setResults(prev => [...prev, newResult]);
        setQuery('');
        setShowSuggestions(false);
        
        // Reload history to get the new query
        loadInitialData();
      } else {
        toast.error('Failed to process query');
      }
    } catch (error) {
      console.error('Error processing query:', error);
      toast.error('Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuery();
    }
  };

  const saveToFavorites = async (queryText: string, title: string) => {
    try {
      const response = await fetch('/api/organizations/current/users/current/queries/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          title,
          description: `Saved query: ${queryText}`
        })
      });

      if (response.ok) {
        toast.success('Query saved to favorites');
        loadInitialData();
      } else {
        toast.error('Failed to save query');
      }
    } catch (error) {
      console.error('Error saving query:', error);
      toast.error('Failed to save query');
    }
  };

  const deleteFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/organizations/current/users/current/queries/favorites/${favoriteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Favorite deleted');
        loadInitialData();
      } else {
        toast.error('Failed to delete favorite');
      }
    } catch (error) {
      console.error('Error deleting favorite:', error);
      toast.error('Failed to delete favorite');
    }
  };

  const exportResults = async (format: string = 'csv') => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    try {
      const response = await fetch('/api/organizations/current/users/current/queries/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Export all results',
          format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query_results_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Results exported successfully');
      } else {
        toast.error('Failed to export results');
      }
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('Failed to export results');
    }
  };

  const renderVisualization = (result: QueryResult) => {
    if (!result.visualization) return null;

    const { type, config } = result.visualization;

    switch (type) {
      case 'bar':
        return (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Bar Chart Visualization</p>
              <p className="text-xs text-gray-500">Data points: {config.data?.length || 0}</p>
            </div>
          </div>
        );
      
      case 'line':
        return (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Line Chart Visualization</p>
              <p className="text-xs text-gray-500">Data points: {config.data?.length || 0}</p>
            </div>
          </div>
        );
      
      case 'pie':
        return (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pie Chart Visualization</p>
              <p className="text-xs text-gray-500">Data points: {config.data?.length || 0}</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderTable = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-500">No data available</p>;
    }

    const headers = Object.keys(data[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header, index) => (
                <th key={index} className="border border-gray-200 px-4 py-2 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {headers.map((header, headerIndex) => (
                  <td key={headerIndex} className="border border-gray-200 px-4 py-2">
                    {typeof row[header] === 'number' 
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row[header])
                      : String(row[header])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing first 10 rows of {data.length} total
          </p>
        )}
      </div>
    );
  };

  const renderResult = (result: QueryResult, index: number) => {
    return (
      <Card key={index} className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {result.type === 'chart' && <BarChart3 className="h-5 w-5 text-blue-500" />}
                {result.type === 'table' && <Table className="h-5 w-5 text-green-500" />}
                {result.type === 'summary' && <DollarSign className="h-5 w-5 text-purple-500" />}
                {result.type === 'list' && <Users className="h-5 w-5 text-orange-500" />}
                <span>{result.title}</span>
              </CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveToFavorites(result.title, result.title)}
              >
                <Star className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportResults()}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {result.type === 'chart' && renderVisualization(result)}
          {result.type === 'table' && renderTable(result.data)}
          {result.type === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result.data).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-2xl font-bold">
                    {typeof value === 'number' 
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                      : String(value)
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
          {result.type === 'list' && (
            <div className="space-y-2">
              {Array.isArray(result.data) && result.data.map((item, itemIndex) => (
                <div key={itemIndex} className="p-3 border rounded-lg">
                  {typeof item === 'object' ? (
                    <div className="space-y-1">
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span>
                            {typeof value === 'number' 
                              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                              : String(value)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{String(item)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">AI Assistant</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => exportResults('csv')}
            disabled={results.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportResults('json')}
            disabled={results.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          {/* Query Input */}
          <Card>
            <CardHeader>
              <CardTitle>Ask me anything about your finances</CardTitle>
              <CardDescription>
                Use natural language to query your financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Try: 'Show me revenue for this month' or 'What are my top expenses?'"
                    className="w-full p-4 border rounded-lg resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={() => handleSubmitQuery()}
                    disabled={loading || !query.trim()}
                    className="absolute bottom-2 right-2"
                    size="sm"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Try these queries:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {suggestions.slice(0, 6).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery(suggestion);
                            setShowSuggestions(false);
                            handleSubmitQuery(suggestion);
                          }}
                          className="justify-start text-left h-auto p-3"
                        >
                          <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSuggestions(false)}
                      className="text-gray-500"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hide suggestions
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {results.length === 0 ? (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  Start by asking a question about your financial data. Try queries like:
                  <ul className="mt-2 space-y-1">
                    <li>• "Show me revenue for this month"</li>
                    <li>• "What are my top expenses?"</li>
                    <li>• "How is my cash flow?"</li>
                    <li>• "Which customers generate the most revenue?"</li>
                  </ul>
                </AlertDescription>
              </Alert>
            ) : (
              results.map((result, index) => renderResult(result, index))
            )}
            <div ref={messagesEndRef} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query History</CardTitle>
              <CardDescription>
                Your recent queries and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <Alert>
                    <History className="h-4 w-4" />
                    <AlertDescription>
                      No query history available. Start asking questions to build your history.
                    </AlertDescription>
                  </Alert>
                ) : (
                  history.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.query}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {item.intent}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setQuery(item.query);
                              setActiveTab('chat');
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Rerun
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveToFavorites(item.query, `Query ${index + 1}`)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Queries</CardTitle>
              <CardDescription>
                Your saved queries for quick access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favorites.length === 0 ? (
                  <Alert>
                    <Bookmark className="h-4 w-4" />
                    <AlertDescription>
                      No favorite queries yet. Save queries you use frequently for quick access.
                    </AlertDescription>
                  </Alert>
                ) : (
                  favorites.map((favorite, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{favorite.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{favorite.query}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Saved {new Date(favorite.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setQuery(favorite.query);
                              setActiveTab('chat');
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteFavorite(favorite.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}