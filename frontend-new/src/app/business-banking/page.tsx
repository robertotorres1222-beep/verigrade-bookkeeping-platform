'use client';

import { useState } from 'react';
import { 
  BuildingLibraryIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function BusinessBankingPage() {
  const [accounts] = useState([
    {
      id: 'ACC-001',
      name: 'Business Checking',
      type: 'Checking',
      balance: 45678.90,
      accountNumber: '****1234',
      bank: 'Chase Business',
      status: 'active',
      lastTransaction: '2024-01-20'
    },
    {
      id: 'ACC-002',
      name: 'Business Savings',
      type: 'Savings',
      balance: 125000.00,
      accountNumber: '****5678',
      bank: 'Wells Fargo Business',
      status: 'active',
      lastTransaction: '2024-01-19'
    },
    {
      id: 'ACC-003',
      name: 'Business Credit Card',
      type: 'Credit Card',
      balance: -5432.10,
      accountNumber: '****9876',
      bank: 'Capital One',
      status: 'active',
      lastTransaction: '2024-01-20'
    }
  ]);

  const [transactions] = useState([
    {
      id: 'TXN-001',
      description: 'Payment from Acme Corp',
      amount: 5000.00,
      type: 'deposit',
      account: 'Business Checking',
      date: '2024-01-20',
      category: 'Income',
      status: 'completed'
    },
    {
      id: 'TXN-002',
      description: 'Office rent payment',
      amount: -2500.00,
      type: 'withdrawal',
      account: 'Business Checking',
      date: '2024-01-19',
      category: 'Rent',
      status: 'completed'
    },
    {
      id: 'TXN-003',
      description: 'Software subscription',
      amount: -299.00,
      type: 'withdrawal',
      account: 'Business Credit Card',
      date: '2024-01-18',
      category: 'Software',
      status: 'pending'
    },
    {
      id: 'TXN-004',
      description: 'Client deposit',
      amount: 2500.00,
      type: 'deposit',
      account: 'Business Checking',
      date: '2024-01-17',
      category: 'Income',
      status: 'completed'
    }
  ]);

  const bankingStats = [
    { label: 'Total Balance', value: '$165,246.80', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { label: 'Monthly Transactions', value: '127', icon: ChartBarIcon, color: 'text-blue-600' },
    { label: 'Pending Payments', value: '8', icon: ClockIcon, color: 'text-yellow-600' },
    { label: 'Credit Score', value: '785', icon: ShieldCheckIcon, color: 'text-purple-600' }
  ];

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? 
      <ArrowUpIcon className="h-5 w-5 text-green-500" /> : 
      <ArrowDownIcon className="h-5 w-5 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Business
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Banking</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Comprehensive business banking solutions with integrated financial management. 
              Manage accounts, payments, and cash flow all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Banking Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {bankingStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Overview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Account Overview</h2>
              <p className="text-lg text-gray-600 mt-2">Manage all your business accounts and transactions</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Add Account
            </button>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {account.type === 'Credit Card' ? (
                      <CreditCardIcon className="h-8 w-8 text-purple-600" />
                    ) : (
                      <BuildingLibraryIcon className="h-8 w-8 text-blue-600" />
                    )}
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">{account.bank}</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {account.status}
                  </span>
                </div>
                <div className="mb-4">
                  <div className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {account.balance < 0 ? '-' : ''}${Math.abs(account.balance).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Account: {account.accountNumber}</div>
                </div>
                <div className="text-xs text-gray-500">
                  Last transaction: {account.lastTransaction}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </div>
                            <div className="text-sm text-gray-500">{transaction.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.account}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'deposit' ? '+' : ''}${transaction.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'completed' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                          {transaction.status === 'pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                          {transaction.status === 'failed' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Banking Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Banking Features</h2>
            <p className="text-lg text-gray-600">Everything you need to manage your business finances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Account Management</h3>
              <p className="text-gray-600">Connect and manage multiple business accounts, credit cards, and loans in one dashboard.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <ArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Transfers</h3>
              <p className="text-gray-600">Make instant transfers between accounts, pay vendors, and manage cash flow in real-time.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Business Credit Cards</h3>
              <p className="text-gray-600">Apply for and manage business credit cards with expense tracking and spending controls.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Reconciliation</h3>
              <p className="text-gray-600">Automatically match transactions with invoices and receipts for seamless reconciliation.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fraud Protection</h3>
              <p className="text-gray-600">Advanced fraud detection and protection with real-time alerts and transaction monitoring.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cash Flow Analytics</h3>
              <p className="text-gray-600">Detailed cash flow analysis and forecasting to help you make informed financial decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Solutions */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Solutions</h2>
            <p className="text-lg text-gray-600">Accept payments from customers and pay vendors efficiently</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Accept Payments</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-4 mt-1">
                    <BanknotesIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Online Invoicing</h4>
                    <p className="text-gray-600">Send professional invoices with integrated payment links for faster collection.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg mr-4 mt-1">
                    <CreditCardIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Processing</h4>
                    <p className="text-gray-600">Accept credit cards, ACH transfers, and digital wallets with competitive rates.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg mr-4 mt-1">
                    <ArrowDownIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Recurring Billing</h4>
                    <p className="text-gray-600">Set up automated recurring payments for subscriptions and services.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Make Payments</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg mr-4 mt-1">
                    <ArrowUpIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Vendor Payments</h4>
                    <p className="text-gray-600">Pay vendors and suppliers with ACH, wire transfers, or virtual cards.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-4 mt-1">
                    <DocumentTextIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Bill Pay</h4>
                    <p className="text-gray-600">Automated bill payment with approval workflows and payment scheduling.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-600 rounded-lg mr-4 mt-1">
                    <ClockIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Scheduled Payments</h4>
                    <p className="text-gray-600">Schedule future payments and set up automatic recurring payments.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Upgrade Your Business Banking?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Get integrated business banking with advanced financial management tools. 
            Apply for business accounts and credit cards today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Apply Now
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Speak with Banker
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
