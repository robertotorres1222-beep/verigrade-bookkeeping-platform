'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ReportsPage() {
  const { token } = useAuth()
  const [activeReport, setActiveReport] = useState('profit-loss')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const generateReport = async (reportType: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (reportType !== 'balance-sheet') {
        params.append('startDate', dateRange.startDate)
        params.append('endDate', dateRange.endDate)
      } else {
        params.append('asOfDate', dateRange.endDate)
      }

      const response = await fetch(`${API_BASE}/api/reports/${reportType}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
    setLoading(false)
  }

  const reports = [
    { id: 'profit-loss', name: 'Profit & Loss', icon: '📊', description: 'Revenue, expenses, and profit analysis' },
    { id: 'balance-sheet', name: 'Balance Sheet', icon: '⚖️', description: 'Assets, liabilities, and equity' },
    { id: 'cash-flow', name: 'Cash Flow', icon: '💰', description: 'Cash inflows and outflows' },
    { id: 'aging', name: 'Aging Report', icon: '📅', description: 'Outstanding invoices by age' }
  ]

  const renderReportContent = () => {
    if (!reportData) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a report to generate
          </h3>
          <p className="text-gray-600">
            Choose a financial report from the sidebar to view your business analytics.
          </p>
        </div>
      )
    }

    switch (activeReport) {
      case 'profit-loss':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Profit & Loss Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${reportData.revenue.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    ${reportData.expenses.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${reportData.profit.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${reportData.profit.net.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Net Profit</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4">Expenses by Category</h4>
              <div className="space-y-2">
                {reportData.expenses.categories.map((category: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{category.category || 'Uncategorized'}</span>
                    <span className="font-medium">${category._sum.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'balance-sheet':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Balance Sheet</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Assets</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Assets</span>
                      <span>${reportData.assets.current.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 font-semibold">
                      <div className="flex justify-between">
                        <span>Total Assets</span>
                        <span>${reportData.assets.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Liabilities & Equity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Liabilities</span>
                      <span>${reportData.liabilities.current.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retained Earnings</span>
                      <span>${reportData.equity.retained.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 font-semibold">
                      <div className="flex justify-between">
                        <span>Total Liabilities & Equity</span>
                        <span>${reportData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'cash-flow':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Cash Flow Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    ${reportData.operating.net.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Operating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">
                    ${reportData.investing.net.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Investing</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">
                    ${reportData.financing.net.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Financing</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${reportData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${reportData.netCashFlow.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Net Cash Flow</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'aging':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Aging Summary</h3>
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    ${reportData.agingBuckets.current.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    ${reportData.agingBuckets['1-30'].toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">1-30 Days</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">
                    ${reportData.agingBuckets['31-60'].toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">31-60 Days</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">
                    ${reportData.agingBuckets['61-90'].toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">61-90 Days</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-800">
                    ${reportData.agingBuckets['90+'].toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">90+ Days</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4">Outstanding Invoices</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Invoice #</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-right py-2">Amount</th>
                      <th className="text-right py-2">Days Overdue</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.details.map((invoice: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{invoice.invoiceNumber}</td>
                        <td className="py-2">{invoice.customerName}</td>
                        <td className="py-2 text-right">${invoice.amount.toLocaleString()}</td>
                        <td className="py-2 text-right">{invoice.daysPastDue}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            invoice.status === 'SENT' ? 'bg-yellow-100 text-yellow-800' :
                            invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate and view comprehensive financial reports
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Report Types</h3>
              <div className="space-y-2">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      activeReport === report.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{report.icon}</span>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Date Range</h4>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <button
                  onClick={() => generateReport(activeReport)}
                  disabled={loading}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {renderReportContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
