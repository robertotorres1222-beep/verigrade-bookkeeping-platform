'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  CalculatorIcon,
  DocumentCheckIcon,
  ReceiptRefundIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import AIResearchAssistant from './AIResearchAssistant';
import PWAInstaller from './PWAInstaller';
import MCPIntegration from './MCPIntegration';
import LocalAnalyticsViewer from './LocalAnalyticsViewer';
import AnalyticsTester from './AnalyticsTester';

interface User {
  name: string;
  email: string;
  company: string;
}

export default function StartupDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Enhanced analytics tracking
  const trackEvent = async (eventName: string, properties?: any) => {
    try {
      // Try PostHog first, fallback to local analytics
      try {
        const { trackEvent: trackPostHog } = await import('../lib/posthog');
        trackPostHog(eventName, properties);
      } catch (error) {
        // PostHog not available, use local analytics
        const localAnalytics = await import('../lib/localAnalytics');
        localAnalytics.default.track(eventName, properties);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const handleTabChange = async (tabId: string) => {
    setActiveTab(tabId);
    
    // Track tab change
    await trackEvent('dashboard_tab_change', {
      previous_tab: activeTab,
      new_tab: tabId,
      timestamp: new Date().toISOString()
    });
  };

  // Mock data
  const [transactions] = useState([
    {
      id: '1',
      type: 'income',
      description: 'Website Design Project',
      amount: 2500,
      date: '2024-01-15',
      category: 'Services',
      status: 'completed'
    },
    {
      id: '2',
      type: 'expense',
      description: 'Office Supplies',
      amount: 125.50,
      date: '2024-01-14',
      category: 'Office',
      status: 'completed'
    },
    {
      id: '3',
      type: 'income',
      description: 'Mobile App Development',
      amount: 5000,
      date: '2024-01-13',
      category: 'Services',
      status: 'pending'
    }
  ]);

  const [dashboardStats] = useState({
    totalRevenue: 7500,
    totalExpenses: 125.50,
    profit: 7374.50,
    pendingInvoices: 1,
    totalCustomers: 12
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const orgData = localStorage.getItem('organization');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        let organization: any = {};
        
        // Safely parse organization data
        if (orgData && orgData !== 'undefined' && orgData !== 'null') {
          organization = JSON.parse(orgData);
        }
        
        setUser({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          company: organization.name || 'My Company'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Set default user data if parsing fails
        setUser({
          name: 'User',
          email: 'user@example.com',
          company: 'My Company'
        });
      }
    } else {
      // Set default user data if no user data exists
      setUser({
        name: 'User',
        email: 'user@example.com',
        company: 'My Company'
      });
    }
  }, []);

  const handleLogout = async () => {
    // Track logout event
    await trackEvent('user_logout', {
      user: user?.email,
      company: user?.company,
      timestamp: new Date().toISOString()
    });
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    
    // Clear cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to login
    window.location.href = '/login';
  };

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: HomeIcon },
    { id: 'transactions', name: 'Transactions', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'reports', name: 'Reports', icon: PresentationChartLineIcon },
    { id: 'budget', name: 'Budget', icon: CalculatorIcon },
    { id: 'invoices', name: 'Invoices', icon: DocumentCheckIcon },
    { id: 'expenses', name: 'Expenses', icon: ReceiptRefundIcon },
    { id: 'clients', name: 'Clients', icon: UserGroupIcon },
    { id: 'banking', name: 'Banking', icon: BuildingOfficeIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section with Animated Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                Here's your business overview for today
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'total_revenue',
              value: dashboardStats.totalRevenue,
              timestamp: new Date().toISOString()
            });
            console.log('Revenue card clicked');
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                    ${dashboardStats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-green-600">
                <ArrowTrendingUpIcon className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">+12%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-200"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'total_expenses',
              value: dashboardStats.totalExpenses,
              timestamp: new Date().toISOString()
            });
            console.log('Expenses card clicked');
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-300">
                  <ReceiptRefundIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                    ${dashboardStats.totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-red-600">
                <ArrowTrendingDownIcon className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">-3%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{width: '15%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'net_profit',
              value: dashboardStats.profit,
              timestamp: new Date().toISOString()
            });
            console.log('Profit card clicked');
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    ${dashboardStats.profit.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-blue-600">
                <ArrowTrendingUpIcon className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">+18%</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'total_customers',
              value: dashboardStats.totalCustomers,
              timestamp: new Date().toISOString()
            });
            console.log('Customers card clicked');
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                    {dashboardStats.totalCustomers}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-purple-600">
                <ArrowTrendingUpIcon className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">+5</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Assistant Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant</h3>
                <p className="text-gray-600">Leverage AI-powered prompts for enhanced business insights</p>
              </div>
            </div>
            <button 
              className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={async () => {
                await trackEvent('ai_assistant_clicked', {
                  location: 'dashboard_overview',
                  timestamp: new Date().toISOString()
                });
                window.location.href = '/ai-assistant';
              }}
            >
              <svg className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Explore AI Prompts
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-blue-100/50 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-gray-800">Financial Analysis</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">30+ specialized prompts for financial insights</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium">Active</span>
                <span className="text-xs text-gray-500">Last used: 2h ago</span>
              </div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-blue-100/50 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-gray-800">Tax & Compliance</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Strategic planning and compliance tools</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 font-medium">Ready</span>
                <span className="text-xs text-gray-500">Updated: 1d ago</span>
              </div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-blue-100/50 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-gray-800">Content Creation</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Marketing and communication tools</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-600 font-medium">New</span>
                <span className="text-xs text-gray-500">Added: 3d ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-600">Last 6 months</p>
            </div>
            <div className="flex items-center text-green-600">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">+24%</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 72, 58, 85, 78, 92].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-1000 hover:from-green-600 hover:to-green-500"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
              <p className="text-sm text-gray-600">This month</p>
            </div>
            <div className="flex items-center text-red-600">
              <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">-8%</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Office Supplies', amount: 450, percentage: 35, color: 'bg-blue-500' },
              { name: 'Marketing', amount: 320, percentage: 25, color: 'bg-green-500' },
              { name: 'Software', amount: 280, percentage: 22, color: 'bg-purple-500' },
              { name: 'Travel', amount: 180, percentage: 18, color: 'bg-orange-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">${item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-600">Your latest financial activity</p>
            </div>
            <button 
              className="group inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={async () => {
                await trackEvent('add_transaction_clicked', {
                  location: 'recent_transactions_section',
                  timestamp: new Date().toISOString()
                });
                console.log('Add Transaction clicked from Recent Transactions');
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Add Transaction
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {transactions.map((transaction, index) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                        <div className="text-xs text-gray-500">{transaction.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        onClick={async () => {
                          await trackEvent('transaction_view_clicked', {
                            transaction_id: transaction.id,
                            transaction_type: transaction.type,
                            timestamp: new Date().toISOString()
                          });
                          console.log('View transaction:', transaction.id);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        onClick={async () => {
                          await trackEvent('transaction_edit_clicked', {
                            transaction_id: transaction.id,
                            transaction_type: transaction.type,
                            timestamp: new Date().toISOString()
                          });
                          console.log('Edit transaction:', transaction.id);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={async () => {
                          await trackEvent('transaction_delete_clicked', {
                            transaction_id: transaction.id,
                            transaction_type: transaction.type,
                            timestamp: new Date().toISOString()
                          });
                          console.log('Delete transaction:', transaction.id);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing 3 of 3 transactions</p>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
              View all transactions →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="startup-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          <button 
            className="startup-btn-primary"
            onClick={async () => {
              await trackEvent('add_transaction_clicked', {
                location: 'all_transactions_section',
                timestamp: new Date().toISOString()
              });
              // Add your transaction creation logic here
              console.log('Add Transaction clicked from All Transactions');
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
        <p className="text-gray-600">Transaction management functionality will be implemented here.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'transactions':
        return renderTransactions();
      default:
        return (
          <div className="startup-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {navigationItems.find(item => item.id === activeTab)?.name}
            </h3>
            <p className="text-gray-600">
              This feature is coming soon. The {navigationItems.find(item => item.id === activeTab)?.name.toLowerCase()} 
              functionality will be implemented in the next update.
            </p>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={async () => {
                  setSidebarOpen(!sidebarOpen);
                  await trackEvent('sidebar_toggle', {
                    action: sidebarOpen ? 'close' : 'open',
                    timestamp: new Date().toISOString()
                  });
                }}
                className="text-gray-500 hover:text-gray-600 lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-indigo-600 ml-4">VeriGrade</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-600">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.company}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-600"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-64 lg:flex-shrink-0`}>
          <div className="h-full bg-white shadow-sm">
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      activeTab === item.id
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name.split(' ')[0]}!
              </h2>
              <p className="text-gray-600">
                Here's what's happening with your business today.
              </p>
            </div>

            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* AI Research Assistant */}
      <AIResearchAssistant />
      
      {/* PWA Installer */}
      <PWAInstaller />
      
      {/* MCP Integration */}
      <MCPIntegration />

      {/* Analytics Tester */}
      <AnalyticsTester />

      {/* Local Analytics Viewer (for when PostHog is blocked) */}
      <LocalAnalyticsViewer />
    </div>
  );
}
