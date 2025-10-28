'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test 1: Backend Health Check
      const healthResponse = await fetch('http://localhost:3001/health');
      const healthData = await healthResponse.json();
      setBackendStatus(healthData);

      // Test 2: AI Categorization
      const categorizationResponse = await fetch('http://localhost:3001/api/transactions/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Office Depot - Printer Paper',
          amount: 45.99,
        }),
      });
      const categorizationData = await categorizationResponse.json();
      setApiTest(categorizationData);

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 VeriGrade Platform Test
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Testing connections...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Error</h2>
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-red-500 mt-4">
                Make sure the backend is running on port 3001
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Backend Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">✅</span>
                  Backend Status
                </h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Status:</strong> <span className="text-green-600">Connected</span></p>
                  <p><strong>Environment:</strong> {backendStatus?.environment}</p>
                  <p><strong>Timestamp:</strong> {backendStatus?.timestamp}</p>
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Features:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>AI Categorization: {backendStatus?.features?.aiCategorization ? '🟢 Enabled' : '🟡 Mock Mode'}</li>
                      <li>PDF Generation: {backendStatus?.features?.pdfGeneration ? '🟢 Enabled' : '🔴 Disabled'}</li>
                      <li>Queue Worker: {backendStatus?.features?.queueWorker ? '🟢 Configured' : '🟡 Mock Mode'}</li>
                      <li>S3 Storage: {backendStatus?.features?.s3Storage ? '🟢 Configured' : '🟡 Not Configured'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* API Test */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🤖</span>
                  AI Categorization Test
                </h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Test Input:</strong> "Office Depot - Printer Paper" ($45.99)</p>
                  <div className="mt-4 bg-white rounded p-4 border border-blue-100">
                    <p><strong>Category:</strong> <span className="text-blue-600 font-semibold">{apiTest?.data?.category}</span></p>
                    <p><strong>Confidence:</strong> {(apiTest?.data?.confidence * 100).toFixed(0)}%</p>
                    <p><strong>Reasoning:</strong> {apiTest?.data?.reasoning}</p>
                    <p><strong>Status:</strong> {apiTest?.data?.status}</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-purple-800 mb-4">🔗 Quick Links</h2>
                <div className="grid grid-cols-2 gap-4">
                  <a href="http://localhost:3000" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-purple-100">
                    <p className="font-semibold text-purple-900">Frontend Home</p>
                    <p className="text-sm text-purple-600">http://localhost:3000</p>
                  </a>
                  <a href="http://localhost:3001/api" target="_blank" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-purple-100">
                    <p className="font-semibold text-purple-900">API Docs</p>
                    <p className="text-sm text-purple-600">http://localhost:3001/api</p>
                  </a>
                  <a href="http://localhost:3001/health" target="_blank" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-purple-100">
                    <p className="font-semibold text-purple-900">Health Check</p>
                    <p className="text-sm text-purple-600">http://localhost:3001/health</p>
                  </a>
                  <a href="/dashboard" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-purple-100">
                    <p className="font-semibold text-purple-900">Dashboard</p>
                    <p className="text-sm text-purple-600">/dashboard</p>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                <button
                  onClick={testBackendConnection}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  🔄 Retest Connection
                </button>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold inline-block"
                >
                  📊 Go to Dashboard
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 System Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Frontend Port:</p>
              <p className="text-gray-600">3000</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Backend Port:</p>
              <p className="text-gray-600">3001</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Framework:</p>
              <p className="text-gray-600">Next.js 15.5.4</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Backend:</p>
              <p className="text-gray-600">Express.js</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}












