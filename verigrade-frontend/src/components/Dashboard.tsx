'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import Link from 'next/link'
import InvoiceForm from './InvoiceForm'
import ExpenseForm from './ExpenseForm'
import CustomerForm from './CustomerForm'
import ReportsPage from './ReportsPage'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'invoices', name: 'Invoices', icon: '📄' },
    { id: 'expenses', name: 'Expenses', icon: '💳' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'reports', name: 'Reports', icon: '📈' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">VeriGrade</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.organization.name} Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your business finances with ease
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">$0.00</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">📄</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Open Invoices</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">💳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">$0.00</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Welcome to VeriGrade!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Your account is set up and ready to use. Start by creating your first invoice or tracking an expense.
                      </p>
                      <div className="space-x-4">
                        <button
                          onClick={() => setShowInvoiceForm(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                          Create Invoice
                        </button>
                        <button
                          onClick={() => setShowExpenseForm(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                          Track Expense
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'invoices' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
                      <button 
                        onClick={() => setShowInvoiceForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Create Invoice
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📄</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No invoices yet
                      </h3>
                      <p className="text-gray-600">
                        Create your first invoice to get started with billing your customers.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'expenses' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
                      <button 
                        onClick={() => setShowExpenseForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Add Expense
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💳</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No expenses yet
                      </h3>
                      <p className="text-gray-600">
                        Start tracking your business expenses to better manage your finances.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'customers' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Customers</h2>
                      <button 
                        onClick={() => setShowCustomerForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Add Customer
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No customers yet
                      </h3>
                      <p className="text-gray-600">
                        Add your customers to start creating invoices and managing relationships.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div>
                    <ReportsPage />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Organization</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Name:</strong> {user.organization.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>ID:</strong> {user.organization.id}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Account</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {user.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Name:</strong> {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Forms */}
      {showInvoiceForm && (
        <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
      )}
      {showExpenseForm && (
        <ExpenseForm onClose={() => setShowExpenseForm(false)} />
      )}
      {showCustomerForm && (
        <CustomerForm onClose={() => setShowCustomerForm(false)} />
      )}
    </div>
  )
}
