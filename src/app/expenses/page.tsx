'use client';

import { useState } from 'react';
import { 
  ReceiptPercentIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

export default function ExpensesPage() {
  const [expenses] = useState([
    {
      id: 'EXP-001',
      description: 'Office supplies',
      amount: 125.50,
      category: 'Office',
      vendor: 'Office Depot',
      date: '2024-01-20',
      status: 'approved',
      receipt: true,
      employee: 'John Doe',
      project: 'Website Redesign'
    },
    {
      id: 'EXP-002',
      description: 'Client dinner',
      amount: 89.75,
      category: 'Entertainment',
      vendor: 'Restaurant XYZ',
      date: '2024-01-19',
      status: 'pending',
      receipt: true,
      employee: 'Jane Smith',
      project: 'Acme Corp'
    },
    {
      id: 'EXP-003',
      description: 'Software subscription',
      amount: 299.00,
      category: 'Software',
      vendor: 'Adobe',
      date: '2024-01-18',
      status: 'approved',
      receipt: false,
      employee: 'Mike Johnson',
      project: 'General'
    },
    {
      id: 'EXP-004',
      description: 'Travel expenses',
      amount: 450.00,
      category: 'Travel',
      vendor: 'Airline ABC',
      date: '2024-01-17',
      status: 'rejected',
      receipt: true,
      employee: 'Sarah Wilson',
      project: 'Client Meeting'
    }
  ]);

  const expenseStats = [
    { label: 'Total Expenses', value: '$2,847', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { label: 'Pending Approval', value: '8', icon: ClockIcon, color: 'text-yellow-600' },
    { label: 'This Month', value: '$1,234', icon: CalendarIcon, color: 'text-blue-600' },
    { label: 'Receipts Uploaded', value: '24', icon: PhotoIcon, color: 'text-purple-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Expense
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Streamline expense tracking, approval workflows, and reimbursement processing. 
              Capture receipts, categorize expenses, and maintain compliance with automated expense management.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {expenseStats.map((stat, index) => (
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

      {/* Expense Management */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Expense Tracking</h2>
              <p className="text-lg text-gray-600 mt-2">Manage all business expenses with automated workflows</p>
            </div>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Add Expense
            </button>
          </div>

          {/* Expense Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                          <div className="text-sm text-gray-500">{expense.vendor}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            ${expense.amount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{expense.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{expense.employee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{expense.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          <span className="ml-1 capitalize">{expense.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expense.receipt ? (
                            <div className="flex items-center text-green-600">
                              <PhotoIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs">Yes</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <PhotoIcon className="h-4 w-4 mr-1" />
                              <span className="text-xs">No</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-500">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-500">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-500">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Expense Categories */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Expense Categories</h2>
            <p className="text-lg text-gray-600">Organize expenses by category for better tracking and reporting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Office Supplies', amount: '$1,245', count: 24, color: 'bg-blue-100 text-blue-600' },
              { name: 'Travel', amount: '$3,420', count: 12, color: 'bg-green-100 text-green-600' },
              { name: 'Meals & Entertainment', amount: '$890', count: 18, color: 'bg-purple-100 text-purple-600' },
              { name: 'Software', amount: '$2,100', count: 8, color: 'bg-yellow-100 text-yellow-600' },
              { name: 'Marketing', amount: '$1,650', count: 15, color: 'bg-red-100 text-red-600' },
              { name: 'Professional Services', amount: '$4,200', count: 6, color: 'bg-indigo-100 text-indigo-600' },
              { name: 'Equipment', amount: '$2,800', count: 4, color: 'bg-pink-100 text-pink-600' },
              { name: 'Utilities', amount: '$1,120', count: 12, color: 'bg-gray-100 text-gray-600' }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {category.count} items
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{category.amount}</div>
                <div className="text-sm text-gray-500">Total spent this month</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approval Workflow */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Approval Workflow</h2>
            <p className="text-lg text-gray-600">Streamlined expense approval process with automated workflows</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <ReceiptPercentIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Receipt Capture</h3>
              <p className="text-gray-600 mb-4">Employees can easily capture receipts using their mobile device or upload images directly.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Mobile receipt scanning</li>
                <li>• OCR text extraction</li>
                <li>• Automatic data entry</li>
                <li>• Duplicate detection</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Approval</h3>
              <p className="text-gray-600 mb-4">Set up approval rules based on amount, category, or employee level for automatic processing.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Rule-based approvals</li>
                <li>• Manager notifications</li>
                <li>• Escalation workflows</li>
                <li>• Audit trail tracking</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reimbursement</h3>
              <p className="text-gray-600 mb-4">Process reimbursements quickly with direct deposit and automated payment processing.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Direct deposit processing</li>
                <li>• Batch payment processing</li>
                <li>• Tax form generation</li>
                <li>• Payment tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Expense Management Features</h2>
            <p className="text-lg text-gray-600">Complete solution for business expense management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <PhotoIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Receipt Management</h3>
              <p className="text-gray-600">Capture, store, and organize receipts with AI-powered data extraction and categorization.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <TagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Categorization</h3>
              <p className="text-gray-600">Automatically categorize expenses using AI to reduce manual data entry and improve accuracy.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Approval Workflows</h3>
              <p className="text-gray-600">Customizable approval processes with automated routing and notification systems.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reimbursement Processing</h3>
              <p className="text-gray-600">Streamlined reimbursement with direct deposit and automated payment processing.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <DocumentTextIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compliance & Reporting</h3>
              <p className="text-gray-600">Generate compliance reports and maintain audit trails for tax and regulatory requirements.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Policy Enforcement</h3>
              <p className="text-gray-600">Enforce company expense policies with automated validation and policy violation alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Streamline Expense Management?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Automate expense tracking, approval workflows, and reimbursement processing. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
