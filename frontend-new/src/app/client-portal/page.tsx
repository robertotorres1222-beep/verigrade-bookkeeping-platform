'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BellIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface Organization {
  id: string;
  name: string;
  industry: string;
}

interface Metrics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  totalOutstanding: number;
  outstandingInvoicesCount: number;
}

interface Transaction {
  type: string;
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface Invoice {
  type: string;
  id: string;
  description: string;
  amount: number;
  date: string;
  status: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
}

interface Activity {
  type: string;
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  status?: string;
}

export default function ClientPortalDashboard() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demo
      const mockOrganization: Organization = {
        id: 'org-1',
        name: 'TechStart Inc',
        industry: 'Technology',
      };

      const mockMetrics: Metrics = {
        totalIncome: 23500,
        totalExpenses: 15750,
        netIncome: 7750,
        totalOutstanding: 8500,
        outstandingInvoicesCount: 1,
      };

      const mockTransactions: Transaction[] = [
        {
          type: 'transaction',
          id: 'txn-1',
          description: 'SaaS Subscription Revenue',
          amount: 15000,
          date: '2024-01-20',
          category: 'Revenue',
        },
        {
          type: 'transaction',
          id: 'txn-2',
          description: 'Software Licenses',
          amount: 2500,
          date: '2024-01-19',
          category: 'Software',
        },
        {
          type: 'transaction',
          id: 'txn-3',
          description: 'Consulting Services',
          amount: 8500,
          date: '2024-01-18',
          category: 'Revenue',
        },
      ];

      const mockInvoices: Invoice[] = [
        {
          type: 'invoice',
          id: 'inv-1',
          description: 'Invoice #INV-001',
          amount: 15000,
          date: '2024-01-15',
          status: 'paid',
        },
        {
          type: 'invoice',
          id: 'inv-2',
          description: 'Invoice #INV-002',
          amount: 8500,
          date: '2024-01-18',
          status: 'sent',
        },
      ];

      const mockExpenses: Expense[] = [
        {
          id: 'exp-1',
          amount: 2500,
          description: 'Software Licenses',
          date: '2024-01-19',
          category: 'Software',
        },
        {
          id: 'exp-2',
          amount: 1200,
          description: 'Office Rent',
          date: '2024-01-15',
          category: 'Rent',
        },
      ];

      const mockActivity: Activity[] = [
        ...mockTransactions.slice(0, 10).map(t => ({
          type: 'transaction',
          id: t.id,
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.category,
        })),
        ...mockInvoices.slice(0, 5).map(i => ({
          type: 'invoice',
          id: i.id,
          description: i.description,
          amount: i.amount,
          date: i.date,
          status: i.status,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setOrganization(mockOrganization);
      setMetrics(mockMetrics);
      setRecentActivity(mockActivity.slice(0, 15));
      setTransactions(mockTransactions);
      setInvoices(mockInvoices);
      setExpenses(mockExpenses);
    } catch (err) {
      setError('Failed to load client data');
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <button
            onClick={fetchClientData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Branded Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{organization?.name} Portal</h1>
                <p className="text-blue-100 text-lg">Client Dashboard</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm text-blue-100">Secure & Encrypted</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200">
                    <BellIcon className="h-6 w-6" />
                  </button>
                  <button className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center">
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Message Bookkeeper
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
              { id: 'transactions', name: 'Transactions', icon: CurrencyDollarIcon },
              { id: 'invoices', name: 'Invoices', icon: DocumentTextIcon },
              { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
              { id: 'reports', name: 'Reports', icon: ChartBarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${metrics?.totalIncome.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${metrics?.totalExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Net Income</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${metrics?.netIncome.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${metrics?.totalOutstanding.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivity.slice(0, 8).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-6 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-3 ${
                            activity.type === 'transaction' 
                              ? activity.description.includes('Revenue') || activity.description.includes('Income')
                                ? 'bg-green-500'
                                : 'bg-red-500'
                              : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {activity.category && `${activity.category} • `}
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            activity.type === 'transaction' 
                              ? activity.description.includes('Revenue') || activity.description.includes('Income')
                                ? 'text-green-600'
                                : 'text-red-600'
                              : 'text-blue-600'
                          }`}>
                            {activity.type === 'transaction' 
                              ? activity.description.includes('Revenue') || activity.description.includes('Income')
                                ? `+$${activity.amount.toLocaleString()}`
                                : `-$${activity.amount.toLocaleString()}`
                              : `$${activity.amount.toLocaleString()}`
                            }
                          </p>
                          {activity.status && (
                            <p className="text-sm text-gray-500 capitalize">{activity.status}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-4">
                  <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                    <ArrowUpTrayIcon className="h-4 w-4 mr-3" />
                    Upload Document
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                    <EyeIcon className="h-4 w-4 mr-3" />
                    View Reports
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                    <PaperAirplaneIcon className="h-4 w-4 mr-3" />
                    Message Bookkeeper
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                    <ClockIcon className="h-4 w-4 mr-3" />
                    Schedule Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`${
                          transaction.description.includes('Revenue') || transaction.description.includes('Income')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.description.includes('Revenue') || transaction.description.includes('Income')
                            ? `+$${transaction.amount.toLocaleString()}`
                            : `-$${transaction.amount.toLocaleString()}`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900">
                          Approve
                        </button>
                        <button className="ml-2 text-red-600 hover:text-red-900">
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'sent'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                  <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-500 mb-4">Upload your first document to get started</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <ChartBarIcon className="h-8 w-8 text-blue-600 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Profit & Loss</h4>
                  <p className="text-gray-600 mb-4">Monthly P&L statement</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Download PDF
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Balance Sheet</h4>
                  <p className="text-gray-600 mb-4">Assets, liabilities, and equity</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Download PDF
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cash Flow</h4>
                  <p className="text-gray-600 mb-4">Cash flow statement</p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
