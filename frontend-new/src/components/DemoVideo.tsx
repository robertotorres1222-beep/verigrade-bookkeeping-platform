'use client';

import { useState } from 'react';
import { PlayIcon, XMarkIcon, DocumentTextIcon, ChartBarIcon, BanknotesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function DemoVideo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "AI Receipt Processing",
      description: "Upload a receipt and watch our AI extract data automatically",
      icon: DocumentTextIcon,
      content: (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Receipt Upload</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Office Supplies Receipt</p>
                  <p className="text-sm text-gray-600">Uploaded 2 seconds ago</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">Amount: $245.67</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">Vendor: Office Depot</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">Category: Office Supplies</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">Date: Jan 15, 2024</p>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">✅ Processed in 2.3 seconds</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Real-time Analytics",
      description: "View your business performance with live insights",
      icon: ChartBarIcon,
      content: (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Business Analytics</h4>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">$12,450</p>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">$8,230</p>
              <p className="text-sm text-gray-600">Net Profit</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Expense Categories</span>
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Office Supplies</span>
                <span className="text-sm font-medium text-gray-900">$1,245</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Marketing</span>
                <span className="text-sm font-medium text-gray-900">$2,100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Software</span>
                <span className="text-sm font-medium text-gray-900">$450</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Bank Reconciliation",
      description: "Automatically match bank transactions with your records",
      icon: BanknotesIcon,
      content: (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Bank Reconciliation</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">✅ Matched Transactions</span>
                <span className="text-sm text-green-600">23/25</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Office Depot - $245.67</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Matched</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Google Ads - $1,200.00</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Matched</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-gray-700">Unknown Transaction - $89.99</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Review</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">92% Auto-matched</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Mobile App",
      description: "Capture receipts on-the-go with our mobile app",
      icon: RocketLaunchIcon,
      content: (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Mobile Receipt Capture</h4>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">VG</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">VeriGrade Mobile</p>
                <p className="text-sm text-gray-600">Tap to capture receipt</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-600">Camera</p>
                <p className="text-sm font-medium text-gray-900">📷</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-600">Gallery</p>
                <p className="text-sm font-medium text-gray-900">🖼️</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-sm text-gray-600">📱 Available on iOS & Android</span>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % demoSteps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + demoSteps.length) % demoSteps.length);
  };

  return (
    <>
      {/* Demo Video Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
      >
        <PlayIcon className="h-5 w-5" />
        Watch Demo
      </button>

      {/* Video Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full mx-4 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                VeriGrade Service Demo
              </h3>
              <p className="text-gray-600">
                See how VeriGrade transforms your bookkeeping workflow in real-time
              </p>
            </div>

            <div className="aspect-video bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 flex items-center justify-center">
              <div className="w-full max-w-4xl">
                {demoSteps[currentStep].content}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                {demoSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-4">
                {demoSteps[currentStep].title}: {demoSteps[currentStep].description}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Try Live Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
