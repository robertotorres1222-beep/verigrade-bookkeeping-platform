'use client';

import { useState } from 'react';
import { 
  BanknotesIcon,
  LinkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

export default function BankingPage() {
  const [connectedAccounts] = useState([
    {
      id: 'ACC001',
      bankName: 'Chase Business',
      accountType: 'Business Checking',
      accountNumber: '****1234',
      balance: '$45,230.50',
      status: 'connected',
      lastSync: '2024-01-15 10:30 AM',
      transactions: 847
    },
    {
      id: 'ACC002',
      bankName: 'Bank of America',
      accountType: 'Business Savings',
      accountNumber: '****5678',
      balance: '$125,890.75',
      status: 'connected',
      lastSync: '2024-01-15 09:45 AM',
      transactions: 234
    },
    {
      id: 'ACC003',
      bankName: 'Wells Fargo',
      accountType: 'Business Credit Card',
      accountNumber: '****9012',
      balance: '-$8,450.30',
      status: 'connected',
      lastSync: '2024-01-14 11:20 AM',
      transactions: 156
    }
  ]);

  const [recentTransactions] = useState([
    {
      id: 'TXN001',
      date: '2024-01-15',
      description: 'Office Supplies Purchase',
      amount: '-$245.67',
      account: 'Chase Business ****1234',
      category: 'Office Expenses',
      status: 'reconciled'
    },
    {
      id: 'TXN002',
      date: '2024-01-15',
      description: 'Client Payment - ABC Corp',
      amount: '+$5,000.00',
      account: 'Chase Business ****1234',
      category: 'Income',
      status: 'reconciled'
    },
    {
      id: 'TXN003',
      date: '2024-01-14',
      description: 'Monthly Rent Payment',
      amount: '-$3,200.00',
      account: 'Chase Business ****1234',
      category: 'Rent',
      status: 'pending'
    },
    {
      id: 'TXN004',
      date: '2024-01-14',
      description: 'Credit Card Payment',
      amount: '-$1,850.00',
      account: 'Wells Fargo ****9012',
      category: 'Credit Card Payment',
      status: 'reconciled'
    }
  ]);

  const [supportedBanks] = useState([
    { name: 'Chase', logo: '/api/placeholder/40/40', supported: true },
    { name: 'Bank of America', logo: '/api/placeholder/40/40', supported: true },
    { name: 'Wells Fargo', logo: '/api/placeholder/40/40', supported: true },
    { name: 'Citibank', logo: '/api/placeholder/40/40', supported: true },
    { name: 'US Bank', logo: '/api/placeholder/40/40', supported: true },
    { name: 'PNC Bank', logo: '/api/placeholder/40/40', supported: true },
    { name: 'Capital One', logo: '/api/placeholder/40/40', supported: true },
    { name: 'TD Bank', logo: '/api/placeholder/40/40', supported: true }
  ]);

  const [bankingSummary] = useState({
    totalAccounts: 3,
    totalBalance: '$162,570.95',
    pendingTransactions: 12,
    reconciledTransactions: 1235,
    lastSync: '2024-01-15 10:30 AM'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'reconciled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Banking
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Integration</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Connect your bank accounts for automatic transaction imports, real-time balance updates, 
              and seamless reconciliation. Secure, encrypted, and compliant with bank-level security standards.
            </p>
          </div>
        </div>
      </section>

      {/* Banking Overview */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{bankingSummary.totalAccounts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <BanknotesIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{bankingSummary.totalBalance}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{bankingSummary.pendingTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reconciled</p>
                  <p className="text-2xl font-bold text-gray-900">{bankingSummary.reconciledTransactions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Accounts */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connected Accounts</h2>
              <p className="text-lg text-gray-600">Manage your linked bank accounts and credit cards</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Connect Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                      <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{account.bankName}</h3>
                      <p className="text-sm text-gray-600">{account.accountType}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                    {account.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium text-gray-900">{account.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className="font-bold text-gray-900">{account.balance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transactions:</span>
                    <span className="font-medium text-gray-900">{account.transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="font-medium text-gray-900">{account.lastSync}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                    <ArrowPathIcon className="h-4 w-4" />
                    Sync Now
                  </button>
                  <button className="text-gray-600 hover:text-gray-500 p-2">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-500 p-2">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
            <p className="text-lg text-gray-600">Automatically imported transactions from your connected accounts</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Imported Transactions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-4">
                        <CreditCardIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">{transaction.account} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{transaction.amount}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Banks */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Supported Banks</h2>
            <p className="text-lg text-gray-600">Connect with over 11,000+ financial institutions</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {supportedBanks.map((bank, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                <div className="text-sm font-medium text-gray-900">{bank.name}</div>
                {bank.supported && (
                  <div className="text-xs text-green-600 mt-1">Supported</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure Banking Features</h2>
            <p className="text-lg text-gray-600">Bank-level security with advanced automation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
              <p className="text-gray-600 mb-4">256-bit SSL encryption and read-only access to your accounts.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• No account credentials stored</li>
                <li>• Read-only access</li>
                <li>• 256-bit SSL encryption</li>
                <li>• SOC 2 Type II certified</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <ArrowPathIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatic Sync</h3>
              <p className="text-gray-600 mb-4">Transactions are automatically imported and categorized.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time transaction imports</li>
                <li>• Automatic categorization</li>
                <li>• Duplicate detection</li>
                <li>• Smart reconciliation</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <LinkIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Setup</h3>
              <p className="text-gray-600 mb-4">Connect your accounts in minutes with our secure process.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• One-click account linking</li>
                <li>• Instant verification</li>
                <li>• Multiple account support</li>
                <li>• Easy account management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect Your Bank Accounts Today
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Streamline your bookkeeping with automatic transaction imports and real-time balance updates. 
            Secure, fast, and reliable banking integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Talk to Banking Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
