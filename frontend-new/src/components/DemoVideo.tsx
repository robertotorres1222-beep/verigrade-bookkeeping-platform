'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  XMarkIcon, 
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  duration: number;
  features: string[];
}

const demoSteps: DemoStep[] = [
  {
    id: 'dashboard',
    title: 'Real-time Dashboard',
    description: 'Get instant insights into your business performance',
    icon: ChartBarIcon,
    duration: 3,
    features: ['Live financial metrics', 'Interactive charts', 'Quick actions', 'Smart notifications']
  },
  {
    id: 'ai-categorization',
    title: 'AI-Powered Categorization',
    description: 'Watch our AI automatically categorize transactions with 99.9% accuracy',
    icon: SparklesIcon,
    duration: 4,
    features: ['Smart categorization', 'Learning from corrections', 'Pattern recognition', 'Confidence scoring']
  },
  {
    id: 'receipt-processing',
    title: 'Receipt Processing',
    description: 'Upload receipts and watch the magic happen',
    icon: DocumentTextIcon,
    duration: 3,
    features: ['OCR text extraction', 'Automatic data entry', 'Expense categorization', 'Tax deduction tracking']
  },
  {
    id: 'bank-integration',
    title: 'Bank Integration',
    description: 'Connect your bank accounts for seamless transaction sync',
    icon: BanknotesIcon,
    duration: 4,
    features: ['Secure bank connection', 'Real-time sync', 'Transaction matching', 'Reconciliation tools']
  }
];

export default function DemoVideo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsOpen(true);
    setIsPlaying(true);
    startDemo();
  };

  const startDemo = () => {
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < demoSteps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, demoSteps[stepIndex]?.duration * 1000 || 3000);
  };

  return (
    <>
      {/* Demo Trigger Button */}
      <motion.button
        onClick={handlePlay}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 mx-auto group-hover:bg-white/30 transition-colors duration-300">
            <PlayIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Watch VeriGrade in Action</h3>
          <p className="text-blue-100 mb-4">
            See how our AI-powered platform transforms your bookkeeping in minutes
          </p>
          <div className="flex items-center justify-center text-sm font-semibold">
            <PlayIcon className="w-4 h-4 mr-2" />
            Play Interactive Demo
            <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </motion.button>

      {/* Demo Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">VeriGrade Interactive Demo</h2>
                  <p className="text-gray-600">Experience our AI-powered bookkeeping platform</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Demo Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left Side - Demo Steps */}
                <div className="p-8 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Demo Steps</h3>
                  <div className="space-y-4">
                    {demoSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          index === currentStep
                            ? 'border-blue-500 bg-blue-50'
                            : index < currentStep
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index < currentStep
                              ? 'bg-green-500 text-white'
                              : index === currentStep
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {index < currentStep ? (
                              <CheckIcon className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <step.icon className="w-5 h-5 text-gray-600" />
                              <h4 className="font-semibold text-gray-900">{step.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {step.features.map((feature, featureIndex) => (
                                <span
                                  key={featureIndex}
                                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Demo Visualization */}
                <div className="p-8 bg-white">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                    {isPlaying ? (
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center"
                      >
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          {demoSteps[currentStep] && React.createElement(demoSteps[currentStep].icon, { className: "w-12 h-12 text-white" })}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {demoSteps[currentStep]?.title}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {demoSteps[currentStep]?.description}
                        </p>
                        <div className="flex justify-center space-x-2">
                          {demoSteps[currentStep]?.features.map((feature, index) => (
                            <motion.span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {feature}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <PlayIcon className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Ready to Start?
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Click play to see VeriGrade in action
                        </p>
                        <button
                          onClick={startDemo}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Start Demo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{currentStep + 1} of {demoSteps.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    <strong>Ready to try VeriGrade?</strong> Start your free trial today
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close Demo
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Start Free Trial
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}