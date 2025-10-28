'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-month');
  const [selectedReport, setSelectedReport] = useState('profit-loss');

  const [reportTypes] = useState([
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Income, expenses, and net profit for the selected period',
      icon: ArrowTrendingUpIcon,
      category: 'Financial',
      popular: true
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity at a point in time',
      icon: ChartBarIcon,
      category: 'Financial',
      popular: true
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows from operations',
      icon: CurrencyDollarIcon,
      category: 'Financial',
      popular: true
    },
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'Tax-deductible expenses and income for tax filing',
      icon: DocumentTextIcon,
      category: 'Tax',
      popular: false
    },
    {
      id: 'expense-report',
      name: 'Expense Report',
      description: 'Detailed breakdown of business expenses by category',
      icon: ArrowTrendingDownIcon,
      category: 'Expenses',
      popular: false
    },
    {
      id: 'revenue-report',
      name: 'Revenue Report',
      description: 'Income analysis by source and time period',
      icon: ArrowTrendingUpIcon,
      category: 'Income',
      popular: false
    }
  ]);

  const [sampleData] = useState({
    profitLoss: {
      revenue: 125000,
      cogs: 45000,
      grossProfit: 80000,
      operatingExpenses: 35000,
      operatingIncome: 45000,
      otherIncome: 2000,
      otherExpenses: 1000,
      netIncome: 46000
    },
    balanceSheet: {
      assets: {
        currentAssets: 75000,
        fixedAssets: 125000,
        totalAssets: 200000
      },
      liabilities: {
        currentLiabilities: 25000,
        longTermDebt: 50000,
        totalLiabilities: 75000
      },
      equity: 125000
    },
    cashFlow: {
      operatingCashFlow: 52000,
      investingCashFlow: -15000,
      financingCashFlow: -5000,
      netCashFlow: 32000
    }
  });

  const [recentReports] = useState([
    {
      id: 'RPT001',
      name: 'Q4 2023 Profit & Loss',
      type: 'Profit & Loss Statement',
      generated: '2024-01-15',
      period: 'Oct 1 - Dec 31, 2023',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 'RPT002',
      name: 'December 2023 Balance Sheet',
      type: 'Balance Sheet',
      generated: '2024-01-01',
      period: 'Dec 31, 2023',
      size: '1.8 MB',
      format: 'Excel'
    },
    {
      id: 'RPT003',
      name: 'Annual Tax Report 2023',
      type: 'Tax Report',
      generated: '2023-12-31',
      period: 'Jan 1 - Dec 31, 2023',
      size: '3.2 MB',
      format: 'PDF'
    }
  ]);

  const periods = [
    { id: 'today', name: 'Today' },
    { id: 'this-week', name: 'This Week' },
    { id: 'last-week', name: 'Last Week' },
    { id: 'this-month', name: 'This Month' },
    { id: 'last-month', name: 'Last Month' },
    { id: 'this-quarter', name: 'This Quarter' },
    { id: 'last-quarter', name: 'Last Quarter' },
    { id: 'this-year', name: 'This Year' },
    { id: 'last-year', name: 'Last Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const categories = ['All', 'Financial', 'Tax', 'Expenses', 'Income'];

  const selectedReportData = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Financial
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Reports</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Comprehensive financial reporting with customizable reports, real-time data, 
              and professional formatting. Make informed business decisions with detailed insights.
            </p>
          </div>
        </div>
      </section>

      {/* Report Controls */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Types Grid */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Reports</h2>
            <p className="text-lg text-gray-600">Choose from a comprehensive selection of financial reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.popular && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Popular
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {report.category}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                      Preview
                    </button>
                    <button className="bg-blue-600 text-white py-1 px-3 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
                      Generate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sample Report Preview */}
      {selectedReportData && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Preview</h2>
              <p className="text-lg text-gray-600">
                Preview of {selectedReportData.name} for {periods.find(p => p.id === selectedPeriod)?.name}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedReportData.name}</h3>
                  <p className="text-gray-600">Period: {periods.find(p => p.id === selectedPeriod)?.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    Preview
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Export PDF
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-500 transition-colors flex items-center gap-2">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Export Excel
                  </button>
                </div>
              </div>

              {selectedReport === 'profit-loss' && (
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-900">Total Revenue</span>
                    <span className="font-bold text-green-600">${sampleData.profitLoss.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Cost of Goods Sold</span>
                    <span className="text-red-600">-${sampleData.profitLoss.cogs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b-2 border-gray-400">
                    <span className="font-medium text-gray-900">Gross Profit</span>
                    <span className="font-bold text-gray-900">${sampleData.profitLoss.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Operating Expenses</span>
                    <span className="text-red-600">-${sampleData.profitLoss.operatingExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-900">Operating Income</span>
                    <span className="font-bold text-gray-900">${sampleData.profitLoss.operatingIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Other Income</span>
                    <span className="text-green-600">${sampleData.profitLoss.otherIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700">Other Expenses</span>
                    <span className="text-red-600">-${sampleData.profitLoss.otherExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-4">
                    <span className="text-lg font-bold text-gray-900">Net Income</span>
                    <span className="text-lg font-bold text-green-600">${sampleData.profitLoss.netIncome.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {selectedReport === 'balance-sheet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Assets</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Assets</span>
                        <span>${sampleData.balanceSheet.assets.currentAssets.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fixed Assets</span>
                        <span>${sampleData.balanceSheet.assets.fixedAssets.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Assets</span>
                        <span>${sampleData.balanceSheet.assets.totalAssets.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Liabilities & Equity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Liabilities</span>
                        <span>${sampleData.balanceSheet.liabilities.currentLiabilities.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Long-term Debt</span>
                        <span>${sampleData.balanceSheet.liabilities.longTermDebt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Liabilities</span>
                        <span>${sampleData.balanceSheet.liabilities.totalLiabilities.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Equity</span>
                        <span>${sampleData.balanceSheet.equity.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Recent Reports */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Reports</h2>
            <p className="text-lg text-gray-600">Access and manage your previously generated reports</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentReports.map((report) => (
                <div key={report.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-4">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-600">{report.type} • {report.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm text-gray-600">
                        <div>Generated: {report.generated}</div>
                        <div>{report.format} • {report.size}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-500 p-2">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-500 p-2">
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-500 p-2">
                          <ShareIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Make Data-Driven Decisions
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Generate professional financial reports in seconds. Export to PDF or Excel, 
            share with stakeholders, and gain insights to grow your business.
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
              Talk to Financial Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
