'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  BanknotesIcon, 
  UserGroupIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  CameraIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  vendor: string;
  account: string;
  date: string;
  type: 'income' | 'expense';
  status: 'pending' | 'completed' | 'reconciled';
}

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  pendingTransactions: number;
  reconciledTransactions: number;
}

interface DynamicDashboardProps {
  activeTab: string;
  transactions: Transaction[];
  loading: boolean;
  onAddTransaction: () => void;
  onReceiptCapture: () => void;
  onViewTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
}

export default function DynamicDashboard({ 
  activeTab,
  transactions,
  loading,
  onAddTransaction, 
  onReceiptCapture, 
  onViewTransaction, 
  onEditTransaction, 
  onDeleteTransaction 
}: DynamicDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCount: 0,
    pendingTransactions: 0,
    reconciledTransactions: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Use transactions from props
  const recentTransactions = transactions;

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [transactions]);

  const loadDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockStats: DashboardStats = {
        totalRevenue: 45600.00,
        totalExpenses: 32400.00,
        netIncome: 13200.00,
        transactionCount: 127,
        pendingTransactions: 8,
        reconciledTransactions: 119,
      };

      const mockTransactions: Transaction[] = [
        {
          id: 1,
          description: 'Client Payment - Project Alpha',
          amount: 5000.00,
          category: 'Revenue',
          vendor: 'Alpha Corp',
          account: 'Business Checking',
          date: '2024-01-15',
          type: 'income',
          status: 'completed',
        },
        {
          id: 2,
          description: 'Office Supplies',
          amount: 245.67,
          category: 'Office Expenses',
          vendor: 'Office Depot',
          account: 'Business Credit Card',
          date: '2024-01-14',
          type: 'expense',
          status: 'pending',
        },
        {
          id: 3,
          description: 'Marketing Campaign',
          amount: 1200.00,
          category: 'Marketing',
          vendor: 'Google Ads',
          account: 'Business Credit Card',
          date: '2024-01-13',
          type: 'expense',
          status: 'completed',
        },
        {
          id: 4,
          description: 'Consulting Services',
          amount: 3200.00,
          category: 'Revenue',
          vendor: 'Beta Inc',
          account: 'Business Checking',
          date: '2024-01-12',
          type: 'income',
          status: 'completed',
        },
        {
          id: 5,
          description: 'Software Subscription',
          amount: 99.99,
          category: 'Software',
          vendor: 'SaaS Provider',
          account: 'Business Credit Card',
          date: '2024-01-11',
          type: 'expense',
          status: 'reconciled',
        },
      ];

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const filteredTransactions = recentTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }: any) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8" style={{ color }} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ml-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TransactionRow = ({ transaction }: { transaction: Transaction }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`flex-shrink-0 h-3 w-3 rounded-full ${
            transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
            <div className="text-sm text-gray-500">{transaction.vendor}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{transaction.category}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{transaction.account}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{transaction.date}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {transaction.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`text-sm font-medium ${
          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewTransaction(transaction)}
            className="text-blue-600 hover:text-blue-900"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEditTransaction(transaction)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteTransaction(transaction.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={onReceiptCapture}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CameraIcon className="h-4 w-4 mr-2" />
            Scan Receipt
          </button>
          <button
            onClick={onAddTransaction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
            ) : (
              <SparklesIcon className="h-4 w-4 mr-2" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={BanknotesIcon}
          color="#10B981"
          change="+12%"
          changeType="increase"
        />
        <StatCard
          title="Total Expenses"
          value={`$${stats.totalExpenses.toLocaleString()}`}
          icon={CreditCardIcon}
          color="#EF4444"
          change="+5%"
          changeType="increase"
        />
        <StatCard
          title="Net Income"
          value={`$${stats.netIncome.toLocaleString()}`}
          icon={ChartBarIcon}
          color="#3B82F6"
          change="+18%"
          changeType="increase"
        />
        <StatCard
          title="Transactions"
          value={stats.transactionCount.toString()}
          icon={DocumentTextIcon}
          color="#8B5CF6"
          change="+23"
          changeType="increase"
        />
      </div>

      {/* Quick Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Transactions</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendingTransactions}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Reconciled</p>
              <p className="text-2xl font-bold text-green-900">{stats.reconciledTransactions}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">Active Clients</p>
              <p className="text-2xl font-bold text-blue-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            
            {/* Search and Filter */}
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {filteredTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new transaction.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={onAddTransaction}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Transaction
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
