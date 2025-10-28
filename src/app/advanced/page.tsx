'use client'

import AdvancedDashboard from '@/components/AdvancedDashboard'
import AdvancedDataTable from '@/components/AdvancedDataTable'
import AdvancedCharts, { generateChartData } from '@/components/AdvancedCharts'
import AdvancedNotifications, { useNotifications, generateDemoNotifications } from '@/components/AdvancedNotifications'
import { Column } from '@/components/AdvancedDataTable'

// Sample data for the advanced data table
const sampleData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15',
    amount: 1500
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Pending',
    lastLogin: '2024-01-14',
    amount: -250
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2024-01-13',
    amount: 3200
  }
]

const columns: Column[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    filterable: true
  },
  {
    key: 'role',
    label: 'Role',
    sortable: true,
    filterable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: string) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        value === 'Active' 
          ? 'bg-green-100 text-green-800'
          : value === 'Pending'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'lastLogin',
    label: 'Last Login',
    sortable: true,
    render: (value: string) => (
      <span className="text-gray-600">
        {new Date(value).toLocaleDateString()}
      </span>
    )
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: (value: number) => (
      <span className={`font-mono ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}
      </span>
    )
  }
]

export default function AdvancedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Notifications */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Features Demo</h1>
              <p className="text-gray-600">Showcasing advanced UI components and interactions</p>
            </div>
            <div className="flex items-center space-x-4">
              <AdvancedNotifications
                notifications={generateDemoNotifications()}
                onMarkAsRead={(id) => console.log('Mark as read:', id)}
                onMarkAllAsRead={() => console.log('Mark all as read')}
                onClearNotification={(id) => console.log('Clear notification:', id)}
                onClearAll={() => console.log('Clear all notifications')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Advanced Dashboard */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Dashboard</h2>
            <AdvancedDashboard />
          </section>

          {/* Advanced Charts */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Charts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdvancedCharts
                type="line"
                data={generateChartData('revenue')}
                title="Revenue Trend"
                height={250}
              />
              <AdvancedCharts
                type="bar"
                data={generateChartData('expenses')}
                title="Expenses Breakdown"
                height={250}
              />
              <AdvancedCharts
                type="pie"
                data={generateChartData('categories')}
                title="Expense Categories"
                height={250}
              />
            </div>
          </section>

          {/* Advanced Data Table */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Data Table</h2>
            <AdvancedDataTable
              data={sampleData}
              columns={columns}
              title="User Management"
              searchable={true}
              filterable={true}
              exportable={true}
              selectable={true}
              actions={{
                view: (row) => console.log('View:', row),
                edit: (row) => console.log('Edit:', row),
                delete: (row) => console.log('Delete:', row)
              }}
            />
          </section>

          {/* Advanced Features Grid */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Real-time Updates */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Real-time Updates</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Live data synchronization with WebSocket connections and automatic UI updates.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Data sync</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last update</span>
                    <span className="text-gray-700">2 seconds ago</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="w-4 h-4 bg-purple-600 rounded-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Machine learning-powered analytics and intelligent recommendations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">AI Model</span>
                    <span className="text-purple-600 font-medium">GPT-4</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Accuracy</span>
                    <span className="text-gray-700">94.2%</span>
                  </div>
                </div>
              </div>

              {/* Advanced Security */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <div className="w-4 h-4 bg-red-600 rounded-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Security</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Enterprise-grade security with multi-factor authentication and encryption.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Encryption</span>
                    <span className="text-green-600 font-medium">AES-256</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">MFA</span>
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <div className="w-4 h-4 bg-blue-600 rounded-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Optimized for speed with advanced caching and lazy loading.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Load time</span>
                    <span className="text-green-600 font-medium">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Cache hit</span>
                    <span className="text-gray-700">98.5%</span>
                  </div>
                </div>
              </div>

              {/* Integration Hub */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Connect with 100+ third-party services and APIs.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Connected</span>
                    <span className="text-green-600 font-medium">12 services</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Available</span>
                    <span className="text-gray-700">100+ APIs</span>
                  </div>
                </div>
              </div>

              {/* Analytics Engine */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Advanced analytics with custom dashboards and reporting.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Reports</span>
                    <span className="text-indigo-600 font-medium">24/7</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Data points</span>
                    <span className="text-gray-700">10M+</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
