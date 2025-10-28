'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, LightBulbIcon, DocumentTextIcon, ChartBarIcon, BuildingOfficeIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchResult {
  success: boolean;
  data: {
    query: string;
    answer: string;
    sources: string[];
    model: string;
  };
  message: string;
}

interface ReasonResult {
  success: boolean;
  data: {
    query: string;
    reasoning: string;
    conclusion: string;
    sources: string[];
    model: string;
  };
  message: string;
}

interface ResearchResult {
  success: boolean;
  data: {
    query: string;
    research: string;
    focus_areas: string[];
    sources: string[];
    model: string;
  };
  message: string;
}

export default function AIResearchAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let endpoint = '';
      let body: any = {};

      switch (activeTab) {
        case 'search':
          endpoint = '/api/perplexity/search';
          body = { query };
          break;
        case 'reason':
          endpoint = '/api/perplexity/reason';
          body = { query };
          break;
        case 'research':
          endpoint = '/api/perplexity/deep-research';
          body = { 
            query,
            focusAreas: ['Analysis', 'Best Practices', 'Implementation']
          };
          break;
        case 'accounting':
          endpoint = '/api/perplexity/research-accounting';
          body = { topic: query };
          break;
        case 'trends':
          endpoint = '/api/perplexity/analyze-trends';
          body = { industry: query };
          break;
        case 'tax':
          endpoint = '/api/perplexity/research-tax-regulations';
          body = { country: query };
          break;
        case 'competitor':
          endpoint = '/api/perplexity/competitor-analysis';
          body = { competitorName: query };
          break;
        case 'integration':
          endpoint = '/api/perplexity/research-integration';
          body = { platform: query };
          break;
      }

      const response = await fetch(`https://verigradebackend-production.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError('Failed to get AI response. Please try again.');
      console.error('AI Research error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'search': return 'Ask any question...';
      case 'reason': return 'Describe a complex problem or comparison...';
      case 'research': return 'Enter a topic for deep research...';
      case 'accounting': return 'Enter accounting topic (e.g., "inventory management")...';
      case 'trends': return 'Enter industry (e.g., "retail", "healthcare")...';
      case 'tax': return 'Enter country (e.g., "United States", "Canada")...';
      case 'competitor': return 'Enter competitor name (e.g., "QuickBooks", "Xero")...';
      case 'integration': return 'Enter platform name (e.g., "Shopify", "Stripe")...';
      default: return 'Ask any question...';
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'search': return <MagnifyingGlassIcon className="w-5 h-5" />;
      case 'reason': return <LightBulbIcon className="w-5 h-5" />;
      case 'research': return <DocumentTextIcon className="w-5 h-5" />;
      case 'accounting': return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'trends': return <ChartBarIcon className="w-5 h-5" />;
      case 'tax': return <CurrencyDollarIcon className="w-5 h-5" />;
      case 'competitor': return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'integration': return <MagnifyingGlassIcon className="w-5 h-5" />;
      default: return <MagnifyingGlassIcon className="w-5 h-5" />;
    }
  };

  const tabs = [
    { id: 'search', label: 'Search', icon: getTabIcon('search') },
    { id: 'reason', label: 'Reason', icon: getTabIcon('reason') },
    { id: 'research', label: 'Research', icon: getTabIcon('research') },
    { id: 'accounting', label: 'Accounting', icon: getTabIcon('accounting') },
    { id: 'trends', label: 'Trends', icon: getTabIcon('trends') },
    { id: 'tax', label: 'Tax', icon: getTabIcon('tax') },
    { id: 'competitor', label: 'Competitor', icon: getTabIcon('competitor') },
    { id: 'integration', label: 'Integration', icon: getTabIcon('integration') },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        title="Open AI Research Assistant"
      >
        <LightBulbIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Research Assistant</h2>
            <p className="text-gray-600">Powered by Perplexity MCP</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          {/* Input */}
          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getPlaceholderText()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Query:</h3>
                  <p className="text-gray-700">{result.data?.query}</p>
                </div>

                {result.data?.answer && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Answer:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{result.data.answer}</p>
                  </div>
                )}

                {result.data?.reasoning && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Reasoning:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{result.data.reasoning}</p>
                  </div>
                )}

                {result.data?.conclusion && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Conclusion:</h3>
                    <p className="text-gray-700">{result.data.conclusion}</p>
                  </div>
                )}

                {result.data?.research && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Research Report:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{result.data.research}</p>
                  </div>
                )}

                {result.data?.sources && result.data.sources.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Sources:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {result.data.sources.map((source: string, index: number) => (
                        <li key={index} className="text-gray-700">{source}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.data?.focus_areas && result.data.focus_areas.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Focus Areas:</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.data.focus_areas.map((area: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500 mt-4">
                  Model: {result.data?.model} | Status: {result.success ? 'Success' : 'Error'}
                </div>
              </div>
            )}

            {!result && !loading && (
              <div className="text-center text-gray-500 mt-8">
                <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Ask a question to get AI-powered insights</p>
                <p className="text-sm mt-2">Powered by Perplexity MCP</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
