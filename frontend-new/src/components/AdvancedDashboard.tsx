'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  BellIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon
} from '@heroicons/react/24/outline'

interface DashboardMetric {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  trend: number[]
  icon: React.ComponentType<any>
  color: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  account: string
}

interface AIInsight {
  id: string
  type: 'warning' | 'suggestion' | 'opportunity'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
}

export default function AdvancedDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [realTimeData, setRealTimeData] = useState(true)

  // Advanced metrics with real-time simulation
  const [metrics, setMetrics] = useState<DashboardMetric[]>([
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '$124,567',
      change: 12.5,
      changeType: 'increase',
      trend: [100, 110, 105, 120, 125, 135, 124],
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      id: 'expenses',
      title: 'Total Expenses',
      value: '$89,234',
      change: -3.2,
      changeType: 'decrease',
      trend: [95, 92, 98, 90, 88, 85, 89],
      icon: ArrowTrendingDownIcon,
      color: 'text-red-600'
    },
    {
      id: 'profit',
      title: 'Net Profit',
      value: '$35,333',
      change: 28.7,
      changeType: 'increase',
      trend: [25, 28, 30, 32, 35, 38, 35],
      icon: ArrowTrendingUpIcon,
      color: 'text-blue-600'
    },
    {
      id: 'customers',
      title: 'Active Customers',
      value: '1,247',
      change: 8.1,
      changeType: 'increase',
      trend: [1100, 1150, 1180, 1200, 1220, 1240, 1247],
      icon: UserGroupIcon,
      color: 'text-purple-600'
    }
  ])

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Client Payment - Website Redesign',
      amount: 2500,
      type: 'income',
      category: 'Services',
      date: '2024-01-15',
      status: 'completed',
      account: 'Business Checking'
    },
    {
      id: '2',
      description: 'Office Rent - January',
      amount: -1200,
      type: 'expense',
      category: 'Rent',
      date: '2024-01-14',
      status: 'completed',
      account: 'Business Checking'
    },
    {
      id: '3',
      description: 'Software Subscription - Adobe Creative Suite',
      amount: -52.99,
      type: 'expense',
      category: 'Software',
      date: '2024-01-13',
      status: 'pending',
      account: 'Business Credit Card'
    },
    {
      id: '4',
      description: 'Consulting Fee - Marketing Strategy',
      amount: 1800,
      type: 'income',
      category: 'Consulting',
      date: '2024-01-12',
      status: 'completed',
      account: 'Business Checking'
    },
    {
      id: '5',
      description: 'Equipment Purchase - MacBook Pro',
      amount: -2499,
      type: 'expense',
      category: 'Equipment',
      date: '2024-01-11',
      status: 'completed',
      account: 'Business Credit Card'
    }
  ])

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Cash Flow Optimization',
      description: 'Your cash flow is 23% above average. Consider investing in growth opportunities.',
      impact: 'high',
      actionable: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Expense Alert',
      description: 'Software expenses have increased 15% this month. Review subscriptions.',
      impact: 'medium',
      actionable: true
    },
    {
      id: '3',
      type: 'suggestion',
      title: 'Tax Preparation',
      description: 'Quarterly tax payment due in 12 days. Estimated amount: $8,500.',
      impact: 'high',
      actionable: true
    }
  ])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeData) {
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: metric.id === 'revenue' ? `$${(parseInt(metric.value.replace(/[$,]/g, '')) + Math.floor(Math.random() * 100)).toLocaleString()}` : metric.value,
          trend: [...metric.trend.slice(1), metric.trend[metric.trend.length - 1] + (Math.random() - 0.5) * 10]
        })))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [realTimeData])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return ExclamationTriangleIcon
      case 'suggestion': return CheckCircleIcon
      case 'opportunity': return ArrowTrendingUpIcon
      default: return BellIcon
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-orange-600 bg-orange-100'
      case 'suggestion': return 'text-blue-600 bg-blue-100'
      case 'opportunity': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Advanced Dashboard</h2>
          <p className="text-gray-600">Preparing your financial insights...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Advanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time financial insights and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${realTimeData ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {realTimeData ? 'Live Data' : 'Static Data'}
                </span>
              </div>
              <button
                onClick={() => setRealTimeData(!realTimeData)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {realTimeData ? 'Pause Live' : 'Enable Live'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-8 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'transactions', label: 'Transactions', icon: DocumentTextIcon },
            { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon },
            { id: 'insights', label: 'AI Insights', icon: BellIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Advanced Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gray-50`}>
                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        metric.changeType === 'increase' ? 'text-green-600' : 
                        metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.changeType === 'increase' ? (
                          <ArrowUpRightIcon className="w-4 h-4" />
                        ) : metric.changeType === 'decrease' ? (
                          <ArrowDownRightIcon className="w-4 h-4" />
                        ) : null}
                        <span className="text-sm font-medium">
                          {metric.changeType !== 'neutral' && `${Math.abs(metric.change)}%`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                    </div>
                    {/* Mini Chart */}
                    <div className="mt-4 h-12 flex items-end space-x-1">
                      {metric.trend.map((value, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${(value / Math.max(...metric.trend)) * 100}%` }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                          className={`w-2 rounded-t ${
                            metric.changeType === 'increase' ? 'bg-green-500' :
                            metric.changeType === 'decrease' ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Advanced Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                  <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                      <p className="text-gray-600">Advanced chart visualization</p>
                      <p className="text-sm text-gray-500">Integration with Chart.js or D3.js</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h3>
                  <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ArrowTrendingDownIcon className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <p className="text-gray-600">Pie chart visualization</p>
                      <p className="text-sm text-gray-500">Category breakdown analysis</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-600">Live Updates</span>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Export Data
                      </button>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRightIcon className={`w-5 h-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                            ) : (
                              <ArrowDownRightIcon className={`w-5 h-5 ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{transaction.category}</span>
                              <span>•</span>
                              <span>{transaction.account}</span>
                              <span>•</span>
                              <span>{transaction.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                          <span className={`text-lg font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-600">AI Analysis Active</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {aiInsights.map((insight, index) => {
                    const IconComponent = getInsightIcon(insight.type)
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{insight.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                                insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {insight.impact} impact
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{insight.description}</p>
                            {insight.actionable && (
                              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                Take Action →
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
