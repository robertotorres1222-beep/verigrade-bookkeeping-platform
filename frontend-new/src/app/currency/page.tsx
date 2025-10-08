'use client';

import { useState } from 'react';
import { 
  CurrencyDollarIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CalculatorIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function CurrencyPage() {
  const [supportedCurrencies] = useState([
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.00, change: '+0.00%' },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85, change: '-0.12%' },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73, change: '+0.08%' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.35, change: '-0.05%' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52, change: '+0.15%' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.25, change: '-0.03%' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.92, change: '+0.02%' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45, change: '-0.08%' }
  ]);

  const [transactions] = useState([
    {
      id: 'TXN001',
      date: '2024-01-15',
      description: 'Client Payment - UK Project',
      amount: '£5,000.00',
      baseAmount: '$6,849.32',
      currency: 'GBP',
      rate: 0.73,
      status: 'completed'
    },
    {
      id: 'TXN002',
      date: '2024-01-14',
      description: 'Software License - EU Vendor',
      amount: '€2,500.00',
      baseAmount: '$2,941.18',
      currency: 'EUR',
      rate: 0.85,
      status: 'completed'
    },
    {
      id: 'TXN003',
      date: '2024-01-13',
      description: 'Office Rent - Canada',
      amount: 'C$3,200.00',
      baseAmount: '$2,370.37',
      currency: 'CAD',
      rate: 1.35,
      status: 'pending'
    },
    {
      id: 'TXN004',
      date: '2024-01-12',
      description: 'Marketing Services - Australia',
      amount: 'A$1,800.00',
      baseAmount: '$1,184.21',
      currency: 'AUD',
      rate: 1.52,
      status: 'completed'
    }
  ]);

  const [conversionHistory] = useState([
    {
      date: '2024-01-15',
      from: 'EUR',
      to: 'USD',
      rate: 1.176,
      amount: 1000,
      converted: 1176
    },
    {
      date: '2024-01-15',
      from: 'GBP',
      to: 'USD',
      rate: 1.370,
      amount: 500,
      converted: 685
    },
    {
      date: '2024-01-14',
      from: 'CAD',
      to: 'USD',
      rate: 0.741,
      amount: 2000,
      converted: 1482
    }
  ]);

  const [currencySummary] = useState({
    totalCurrencies: 8,
    activeTransactions: 24,
    totalConverted: '$45,230.50',
    lastUpdate: '2024-01-15 10:30 AM',
    baseCurrency: 'USD'
  });

  const [conversionForm, setConversionForm] = useState({
    amount: '',
    fromCurrency: 'USD',
    toCurrency: 'EUR'
  });

  const [conversionResult, setConversionResult] = useState<number | null>(null);

  const handleConversion = () => {
    const fromRate = supportedCurrencies.find(c => c.code === conversionForm.fromCurrency)?.rate || 1;
    const toRate = supportedCurrencies.find(c => c.code === conversionForm.toCurrency)?.rate || 1;
    const amount = parseFloat(conversionForm.amount);
    
    if (amount && fromRate && toRate) {
      const result = (amount / fromRate) * toRate;
      setConversionResult(result);
    }
  };

  const getChangeColor = (change: string) => {
    return change.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Multi-Currency
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Support</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Handle transactions in multiple currencies with real-time exchange rates, 
              automatic conversions, and comprehensive multi-currency reporting for global businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Currency Overview */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Supported Currencies</p>
                  <p className="text-2xl font-bold text-gray-900">{currencySummary.totalCurrencies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{currencySummary.activeTransactions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Converted</p>
                  <p className="text-2xl font-bold text-gray-900">{currencySummary.totalConverted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Update</p>
                  <p className="text-lg font-bold text-gray-900">{currencySummary.lastUpdate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Currency Converter */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Currency Converter</h2>
            <p className="text-lg text-gray-600">Convert between currencies with real-time exchange rates</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={conversionForm.amount}
                  onChange={(e) => setConversionForm({ ...conversionForm, amount: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <select
                  value={conversionForm.fromCurrency}
                  onChange={(e) => setConversionForm({ ...conversionForm, fromCurrency: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {supportedCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <select
                  value={conversionForm.toCurrency}
                  onChange={(e) => setConversionForm({ ...conversionForm, toCurrency: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {supportedCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleConversion}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                <CalculatorIcon className="h-5 w-5" />
                Convert Currency
              </button>
            </div>

            {conversionResult && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    {parseFloat(conversionForm.amount).toLocaleString()} {conversionForm.fromCurrency} =
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {conversionResult.toLocaleString()} {conversionForm.toCurrency}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Supported Currencies</h2>
            <p className="text-lg text-gray-600">Real-time exchange rates updated every hour</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Exchange Rates (Base: {currencySummary.baseCurrency})</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Last updated: {currencySummary.lastUpdate}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change (24h)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supportedCurrencies.map((currency) => (
                    <tr key={currency.code}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{currency.code}</div>
                          <div className="ml-2 text-sm text-gray-500">{currency.symbol}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{currency.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{currency.rate.toFixed(4)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getChangeColor(currency.change)}`}>
                          {currency.change}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
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

      {/* Multi-Currency Transactions */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Multi-Currency Transactions</h2>
            <p className="text-lg text-gray-600">Track transactions in different currencies with automatic conversions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Multi-Currency Transactions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-4">
                        <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">{transaction.date} • Rate: {transaction.rate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{transaction.amount}</div>
                      <div className="text-sm text-gray-600">{transaction.baseAmount} USD</div>
                      <div className="mt-1">
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

      {/* Currency Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Multi-Currency Features</h2>
            <p className="text-lg text-gray-600">Powerful tools for global business operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <ArrowPathIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Rates</h3>
              <p className="text-gray-600 mb-4">Exchange rates updated hourly from multiple financial data providers.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Live rate updates</li>
                <li>• Historical rate data</li>
                <li>• Rate alerts</li>
                <li>• API integration</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <CalculatorIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Conversion</h3>
              <p className="text-gray-600 mb-4">Automatic currency conversion for reports and financial statements.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Base currency reporting</li>
                <li>• Multi-currency P&L</li>
                <li>• Balance sheet conversion</li>
                <li>• Tax reporting</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Currency Analytics</h3>
              <p className="text-gray-600 mb-4">Track currency exposure and analyze exchange rate impact.</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Currency exposure reports</li>
                <li>• Exchange rate impact</li>
                <li>• Historical analysis</li>
                <li>• Risk assessment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Go Global with Multi-Currency Support
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Handle international transactions with confidence. Real-time exchange rates, 
            automatic conversions, and comprehensive multi-currency reporting.
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
              Talk to Currency Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

