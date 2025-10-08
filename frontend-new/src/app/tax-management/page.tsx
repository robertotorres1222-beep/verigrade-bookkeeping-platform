'use client';

import { useState } from 'react';
import { 
  CalculatorIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

export default function TaxManagementPage() {
  const [taxTypes] = useState([
    {
      name: 'Sales Tax',
      rate: '8.25%',
      collected: '$12,450.00',
      owed: '$12,450.00',
      status: 'up-to-date',
      dueDate: '2024-02-15'
    },
    {
      name: 'Federal Income Tax',
      rate: '21%',
      collected: '$45,200.00',
      owed: '$45,200.00',
      status: 'up-to-date',
      dueDate: '2024-04-15'
    },
    {
      name: 'State Income Tax',
      rate: '6%',
      collected: '$8,900.00',
      owed: '$8,900.00',
      status: 'up-to-date',
      dueDate: '2024-04-15'
    },
    {
      name: 'Payroll Tax',
      rate: '15.3%',
      collected: '$18,750.00',
      owed: '$18,750.00',
      status: 'up-to-date',
      dueDate: '2024-02-28'
    }
  ]);

  const [taxReports] = useState([
    {
      name: 'Quarterly Sales Tax Report',
      period: 'Q4 2023',
      status: 'filed',
      dueDate: '2024-01-31',
      amount: '$12,450.00'
    },
    {
      name: 'Annual Income Tax Return',
      period: '2023',
      status: 'pending',
      dueDate: '2024-04-15',
      amount: '$54,100.00'
    },
    {
      name: 'Payroll Tax Report',
      period: 'January 2024',
      status: 'filed',
      dueDate: '2024-02-15',
      amount: '$6,250.00'
    }
  ]);

  const [upcomingDeadlines] = useState([
    {
      name: 'Sales Tax Payment',
      dueDate: '2024-02-15',
      amount: '$12,450.00',
      type: 'payment',
      priority: 'high'
    },
    {
      name: 'Federal Tax Return',
      dueDate: '2024-04-15',
      amount: '$45,200.00',
      type: 'filing',
      priority: 'high'
    },
    {
      name: 'State Tax Return',
      dueDate: '2024-04-15',
      amount: '$8,900.00',
      type: 'filing',
      priority: 'medium'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up-to-date':
      case 'filed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
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
              Tax
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Comprehensive tax management system with automated calculations, compliance tracking, 
              and filing assistance. Stay compliant and save time with our intelligent tax tools.
            </p>
          </div>
        </div>
      </section>

      {/* Tax Overview Cards */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tax Collected</p>
                  <p className="text-2xl font-bold text-gray-900">$85,300.00</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Status</p>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports Filed</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Types */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tax Types & Calculations</h2>
            <p className="text-lg text-gray-600">Automated tax calculations across all applicable tax types</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {taxTypes.map((tax, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{tax.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tax.status)}`}>
                    {tax.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium text-gray-900">{tax.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collected:</span>
                    <span className="font-medium text-gray-900">{tax.collected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Owed:</span>
                    <span className="font-medium text-gray-900">{tax.owed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium text-gray-900">{tax.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Tax Deadlines</h2>
            <p className="text-lg text-gray-600">Stay ahead of important tax filing and payment deadlines</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Critical Deadlines</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-4">
                        <CalculatorIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{deadline.name}</h4>
                        <p className="text-sm text-gray-600">Due: {deadline.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{deadline.amount}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority} priority
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {deadline.type}
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

      {/* Tax Reports */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tax Reports & Filings</h2>
            <p className="text-lg text-gray-600">Manage and track all your tax reports and filings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {taxReports.map((report, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">Period: {report.period}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">{report.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium text-gray-900">{report.dueDate}</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Download Report
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tax Tools */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tax Tools & Resources</h2>
            <p className="text-lg text-gray-600">Powerful tools to simplify your tax management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <CalculatorIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Calculator</h3>
              <p className="text-gray-600 mb-4">Calculate taxes for any transaction with our intelligent tax calculator.</p>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Open Calculator
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Forms</h3>
              <p className="text-gray-600 mb-4">Generate and fill out tax forms automatically based on your data.</p>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Generate Forms
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Analytics</h3>
              <p className="text-gray-600 mb-4">Analyze your tax patterns and optimize your tax strategy.</p>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Simplify Your Tax Management
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Let VeriGrade handle your tax calculations, compliance tracking, and filing assistance. 
            Focus on growing your business while we ensure tax compliance.
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
              Talk to Tax Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

