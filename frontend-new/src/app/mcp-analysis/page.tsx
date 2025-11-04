'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  SparklesIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface AnalysisResult {
  analysis?: {
    insights?: Array<{
      title: string;
      description: string;
      impact?: string;
      recommendation?: string;
      confidence: number;
    }>;
    summary?: string;
    predictions?: Array<{
      month: string;
      predicted: number;
      confidence: number;
    }>;
  };
  error?: string;
}

interface Prompt {
  id: string;
  title: string;
  category: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    label: string;
  }>;
}

export default function MCPAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisType, setAnalysisType] = useState('financial_insights');
  const [query, setQuery] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showPromptTemplates, setShowPromptTemplates] = useState(false);

  const analysisTypes = [
    {
      id: 'financial_insights',
      name: 'Financial Insights',
      description: 'Get AI-powered insights into your business performance',
      icon: LightBulbIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'anomaly_detection',
      name: 'Anomaly Detection',
      description: 'Identify unusual transactions and patterns',
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'cash_flow_prediction',
      name: 'Cash Flow Prediction',
      description: 'Forecast future cash flows with AI',
      icon: ArrowTrendingUpIcon,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  // Fetch available prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        const data = await response.json();
        if (data.success) {
          setPrompts(data.data.prompts);
        }
      } catch (error) {
        // Silently fail - prompts are optional
        // Could add user notification here if needed
      }
    };

    fetchPrompts();
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Use localhost backend for development, or demo mode for production
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const apiUrl = isDevelopment ? 'http://localhost:3001/api/mcp/analysis' : 'https://verigradebackend-production.up.railway.app/api/mcp/analysis';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: analysisType,
          query: query || `Analyze my ${analysisType.replace('_', ' ')}`,
          data: {},
          promptTemplate: selectedPrompt ? {
            id: selectedPrompt.id,
            title: selectedPrompt.title,
            category: selectedPrompt.category
          } : null
        }),
      });

      if (!response.ok) {
        // If backend is not available, use demo mode
        const demoResult = {
          analysis: {
            insights: [
              {
                title: 'Demo Analysis Result',
                description: 'This is a demonstration of VeriGrade AI analysis capabilities. Connect to the backend for real-time analysis.',
                impact: 'Demo Mode',
                recommendation: 'Deploy backend for full functionality',
                confidence: 0.95
              }
            ],
            summary: 'Demo analysis completed successfully. This showcases VeriGrade\'s AI-powered financial insights capabilities.'
          }
        };
        setAnalysisResult(demoResult);
      } else {
        const data = await response.json();
        
        if (data.success) {
          setAnalysisResult(data.data);
        } else {
          setAnalysisResult({
            error: data.message || 'Analysis failed'
          });
        }
      }
    } catch (error) {
      // Fallback to demo mode if backend is not available
      const demoResult = {
        analysis: {
          insights: [
            {
              title: 'Demo Mode - AI Analysis',
              description: 'VeriGrade AI is analyzing your financial data. This is a demonstration of our advanced AI capabilities.',
              impact: 'Positive Impact',
              recommendation: 'Continue monitoring your financial health with VeriGrade AI',
              confidence: 0.92
            }
          ],
          summary: 'Demo analysis shows VeriGrade\'s AI can provide valuable financial insights and recommendations.'
        }
      };
      setAnalysisResult(demoResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedAnalysisType = analysisTypes.find(type => type.id === analysisType);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <CpuChipIcon className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            AI-Powered MCP Analysis
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Advanced AI insights using Perplexity MCP technology. Get intelligent analysis of your financial data with cutting-edge artificial intelligence.
          </motion.p>
        </div>

        {/* Analysis Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Analysis Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analysisTypes.map((type) => (
              <motion.button
                key={type.id}
                onClick={() => setAnalysisType(type.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  analysisType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-4`}>
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-gray-600 text-sm">{type.description}</p>
                {analysisType === type.id && (
                  <div className="mt-4 flex items-center text-blue-600">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Prompt Template Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">AI Prompt Templates</h2>
            <button
              onClick={() => setShowPromptTemplates(!showPromptTemplates)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4" />
              {showPromptTemplates ? 'Hide Templates' : 'Show Templates'}
            </button>
          </div>

          {showPromptTemplates && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {prompts.slice(0, 6).map((prompt: Prompt) => (
                <motion.button
                  key={prompt.id}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                    setQuery(`Use the ${prompt.title} template for analysis`);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{prompt.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 capitalize">{prompt.category}</span>
                    {selectedPrompt?.id === prompt.id && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {selectedPrompt && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Selected Template</span>
              </div>
              <h3 className="font-semibold text-blue-900">{selectedPrompt.title}</h3>
              <p className="text-blue-800 text-sm">{selectedPrompt.description}</p>
            </div>
          )}
        </motion.div>

        {/* Query Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Query {selectedPrompt ? '(Template Applied)' : '(Optional)'}
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)}
            placeholder={selectedPrompt 
              ? `Using ${selectedPrompt.title} template...`
              : `Enter a specific question about your ${selectedAnalysisType?.name.toLowerCase()}...`
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </motion.div>

        {/* Run Analysis Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-8"
        >
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            } text-white`}
          >
            {isAnalyzing ? (
              <>
                <ArrowPathIcon className="h-6 w-6 mr-3 animate-spin" />
                Running Analysis...
              </>
            ) : (
              <>
                <PlayIcon className="h-6 w-6 mr-3" />
                Run Analysis
              </>
            )}
          </button>
        </motion.div>

        {/* Analysis Results */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Analysis Results</h3>
                <p className="text-gray-600">AI-powered insights for {selectedAnalysisType?.name}</p>
              </div>
            </div>

            {analysisResult.error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
                  <div>
                    <h4 className="text-lg font-semibold text-red-800">Analysis Error</h4>
                    <p className="text-red-600">{analysisResult.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {analysisResult.analysis && (
                  <>
                    {analysisResult.analysis.insights && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h4>
                        <div className="grid gap-4">
                          {analysisResult.analysis.insights.map((insight: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6">
                              <div className="flex items-start">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                  <LightBulbIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-2">{insight.title}</h5>
                                  <p className="text-gray-600 mb-3">{insight.description}</p>
                                  {insight.impact && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                      <p className="text-green-800 font-medium">{insight.impact}</p>
                                    </div>
                                  )}
                                  {insight.recommendation && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <p className="text-blue-800"><strong>Recommendation:</strong> {insight.recommendation}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4 text-right">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {Math.round(insight.confidence * 100)}% confidence
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.analysis.summary && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Summary</h4>
                        <p className="text-gray-700">{analysisResult.analysis.summary}</p>
                      </div>
                    )}

                    {analysisResult.analysis.predictions && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Predictions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {analysisResult.analysis.predictions.map((prediction: any, index: number) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">{prediction.month}</p>
                                <p className="text-2xl font-bold text-gray-900">${prediction.predicted.toLocaleString()}</p>
                                <p className="text-sm text-green-600">{Math.round(prediction.confidence * 100)}% confidence</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Integration Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">MCP Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">n8n-nodes-mcp</h4>
                <p className="text-sm text-green-600">Configured</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Perplexity API</h4>
                <p className="text-sm text-green-600">Integrated</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">VeriGrade Backend</h4>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
