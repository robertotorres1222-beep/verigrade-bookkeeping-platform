'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [animatedValues, setAnimatedValues] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    transactions: 0
  });

  const tabs = [
    { name: 'Overview', icon: ChartBarIcon },
    { name: 'Transactions', icon: DocumentTextIcon },
    { name: 'Analytics', icon: ArrowTrendingUpIcon }
  ];

  const metrics = [
    { label: 'Revenue', value: animatedValues.revenue, change: '+12.5%', positive: true },
    { label: 'Expenses', value: animatedValues.expenses, change: '-8.2%', positive: true },
    { label: 'Profit', value: animatedValues.profit, change: '+24.1%', positive: true },
    { label: 'Transactions', value: animatedValues.transactions, change: '+15.3%', positive: true }
  ];

  const recentTransactions = [
    { id: 1, description: 'Office Supplies', amount: 125.50, type: 'expense', time: '2 min ago' },
    { id: 2, description: 'Client Payment', amount: 2500.00, type: 'income', time: '15 min ago' },
    { id: 3, description: 'Software Subscription', amount: 99.00, type: 'expense', time: '1 hour ago' },
    { id: 4, description: 'Consulting Fee', amount: 1800.00, type: 'income', time: '2 hours ago' }
  ];

  // Animate values on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedValues({
        revenue: Math.floor(125000 * progress),
        expenses: Math.floor(85000 * progress),
        profit: Math.floor(40000 * progress),
        transactions: Math.floor(1250 * progress)
      });

      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-white font-semibold">VeriGrade Dashboard</h3>
              <p className="text-blue-100 text-sm">AI-Powered Analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Live</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(index)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === index
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${metric.value.toLocaleString()}
                        </p>
                      </div>
                      <div className={`flex items-center text-sm ${
                        metric.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.positive ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                        )}
                        {metric.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Revenue Trend</h4>
                  <span className="text-sm text-gray-600">Last 30 days</span>
                </div>
                <div className="h-32 bg-white rounded-lg flex items-end justify-between p-4">
                  {[40, 60, 45, 80, 70, 90, 85, 95, 88, 92, 89, 96].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm w-6"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-gray-900">Recent Transactions</h4>
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.time}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">AI Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900">99.2%</p>
                    </div>
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Time Saved</p>
                      <p className="text-2xl font-bold text-gray-900">15.5 hrs</p>
                    </div>
                    <ClockIcon className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardPreview;
