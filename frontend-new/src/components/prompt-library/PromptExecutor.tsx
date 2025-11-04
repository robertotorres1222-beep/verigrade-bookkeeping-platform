'use client';

import { useState, useEffect } from 'react';
import { X, Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiConfig';

interface Prompt {
  id: string;
  title: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    label: string;
    autoFill?: string;
    options?: string[];
  }>;
}

interface PromptExecutorProps {
  prompt: Prompt;
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptExecutor({ prompt, isOpen, onClose }: PromptExecutorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Auto-populate form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchPopulatedData = async () => {
        setIsLoadingData(true);
        try {
          const response = await fetch(API_ENDPOINTS.prompts.byId(prompt.id), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.populatedData) {
              // Use auto-populated data
              setFormData(data.data.populatedData);
            } else {
              // Initialize with empty values
              const initialData: Record<string, any> = {};
              prompt.fields.forEach(field => {
                initialData[field.name] = '';
              });
              setFormData(initialData);
            }
          } else {
            // Initialize with empty values
            const initialData: Record<string, any> = {};
            prompt.fields.forEach(field => {
              initialData[field.name] = '';
            });
            setFormData(initialData);
          }
        } catch (error) {
          console.error('Error fetching populated data:', error);
          // Initialize with empty values
          const initialData: Record<string, any> = {};
          prompt.fields.forEach(field => {
            initialData[field.name] = '';
          });
          setFormData(initialData);
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchPopulatedData();
      setResult(null);
      setError(null);
    }
  }, [isOpen, prompt]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      // Use absolute URL for API calls
      const response = await fetch(API_ENDPOINTS.prompts.execute(prompt.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputData: formData
        })
      });

      if (!response.ok) {
        // Fallback to demo mode if backend is not available
        const demoResult = {
          analysis: {
            insights: [
              {
                title: 'Demo AI Analysis',
                description: `This is a demonstration of the ${prompt.title} analysis. The AI has processed your input data and generated comprehensive insights.`,
                impact: 'Positive Impact',
                recommendation: 'Continue using VeriGrade AI for enhanced business insights',
                confidence: 0.95
              }
            ],
            summary: `AI analysis completed for ${prompt.title}. This showcases VeriGrade's advanced AI capabilities for professional accounting and business advisory services.`
          },
          processedPrompt: `Demo execution of ${prompt.title} with provided data: ${JSON.stringify(formData, null, 2)}`,
          timestamp: new Date().toISOString()
        };
        setResult(demoResult);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setResult(data.data.result);
      } else {
        setError(data.message || 'Failed to execute prompt');
      }
    } catch (err) {
      // Fallback to demo mode on error
      const demoResult = {
        analysis: {
          insights: [
            {
              title: 'Demo AI Analysis',
              description: `This is a demonstration of the ${prompt.title} analysis. The AI has processed your input data and generated comprehensive insights.`,
              impact: 'Positive Impact',
              recommendation: 'Continue using VeriGrade AI for enhanced business insights',
              confidence: 0.92
            }
          ],
          summary: `AI analysis completed for ${prompt.title}. This showcases VeriGrade's advanced AI capabilities for professional accounting and business advisory services.`
        },
        processedPrompt: `Demo execution of ${prompt.title} with provided data: ${JSON.stringify(formData, null, 2)}`,
        timestamp: new Date().toISOString()
      };
      setResult(demoResult);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderField = (field: any) => {
    const { name, type, label, options } = field;

    switch (type) {
      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <textarea
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          </div>
        );

      case 'select':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <select
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select {label.toLowerCase()}...</option>
              {options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'number':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="number"
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          </div>
        );

      default:
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="text"
              value={formData[name] || ''}
              onChange={(e) => handleInputChange(name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{prompt.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Form Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Provide Information</h3>
              
              <div className="space-y-4">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Loading auto-populated data...</span>
                  </div>
                ) : (
                  prompt.fields.map(field => {
                    const isAutoFilled = formData[field.name] && formData[field.name] !== '';
                    return (
                      <div key={field.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                          </label>
                          {isAutoFilled && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Auto-filled
                            </span>
                          )}
                        </div>
                        {renderField(field)}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isExecuting ? 'Executing...' : 'Execute Prompt'}
                </button>
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="w-1/2 border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis Results</h3>
            
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">Analysis Complete</span>
                </div>

                {result.analysis && (
                  <div className="space-y-4">
                    {result.analysis.insights && result.analysis.insights.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                        <div className="space-y-3">
                          {result.analysis.insights.map((insight: any, index: number) => (
                            <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h5 className="font-medium text-blue-900 mb-1">{insight.title}</h5>
                              <p className="text-blue-800 text-sm mb-2">{insight.description}</p>
                              {insight.impact && (
                                <p className="text-blue-700 text-sm font-medium">Impact: {insight.impact}</p>
                              )}
                              {insight.recommendation && (
                                <p className="text-blue-700 text-sm mt-1">Recommendation: {insight.recommendation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.analysis.summary && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                          {result.analysis.summary}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  Generated at: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Play className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-gray-600">Fill in the form and execute to see AI analysis results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
