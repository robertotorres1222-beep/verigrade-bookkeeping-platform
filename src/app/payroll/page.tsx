'use client';

import { useState } from 'react';
import { 
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function PayrollPage() {
  const [employees] = useState([
    {
      id: 'EMP001',
      name: 'John Smith',
      position: 'Software Engineer',
      salary: '$75,000',
      hourlyRate: '$36.06',
      hoursWorked: 40,
      grossPay: '$2,884.62',
      deductions: '$645.23',
      netPay: '$2,239.39',
      status: 'active',
      lastPayDate: '2024-01-15'
    },
    {
      id: 'EMP002',
      name: 'Sarah Johnson',
      position: 'Marketing Manager',
      salary: '$65,000',
      hourlyRate: '$31.25',
      hoursWorked: 40,
      grossPay: '$2,500.00',
      deductions: '$487.50',
      netPay: '$2,012.50',
      status: 'active',
      lastPayDate: '2024-01-15'
    },
    {
      id: 'EMP003',
      name: 'Mike Davis',
      position: 'Sales Representative',
      salary: '$55,000',
      hourlyRate: '$26.44',
      hoursWorked: 42,
      grossPay: '$2,650.96',
      deductions: '$452.15',
      netPay: '$2,198.81',
      status: 'active',
      lastPayDate: '2024-01-15'
    }
  ]);

  const [payrollSummary] = useState({
    totalEmployees: 12,
    activeEmployees: 10,
    totalGrossPay: '$28,450.00',
    totalDeductions: '$5,234.67',
    totalNetPay: '$23,215.33',
    nextPayrollDate: '2024-02-01',
    payrollFrequency: 'Bi-weekly'
  });

  const [payrollHistory] = useState([
    {
      id: 'PAY001',
      payPeriod: 'Jan 1-15, 2024',
      payDate: '2024-01-15',
      employees: 10,
      grossPay: '$28,450.00',
      netPay: '$23,215.33',
      status: 'completed'
    },
    {
      id: 'PAY002',
      payPeriod: 'Dec 16-31, 2023',
      payDate: '2023-12-31',
      employees: 10,
      grossPay: '$27,890.00',
      netPay: '$22,745.50',
      status: 'completed'
    },
    {
      id: 'PAY003',
      payPeriod: 'Dec 1-15, 2023',
      payDate: '2023-12-15',
      employees: 9,
      grossPay: '$25,100.00',
      netPay: '$20,450.75',
      status: 'completed'
    }
  ]);

  const [deductions] = useState([
    {
      type: 'Federal Income Tax',
      percentage: '22%',
      amount: '$6,259.00',
      description: 'Federal tax withholding'
    },
    {
      type: 'Social Security',
      percentage: '6.2%',
      amount: '$1,763.90',
      description: 'Social Security tax'
    },
    {
      type: 'Medicare',
      percentage: '1.45%',
      amount: '$412.53',
      description: 'Medicare tax'
    },
    {
      type: 'State Tax',
      percentage: '4.5%',
      amount: '$1,280.25',
      description: 'State income tax'
    },
    {
      type: 'Health Insurance',
      percentage: '3.2%',
      amount: '$910.40',
      description: 'Employee health insurance'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
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
              Payroll
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Management</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Complete payroll processing with automated calculations, tax deductions, 
              direct deposits, and compliance reporting. Streamline your employee compensation management.
            </p>
          </div>
        </div>
      </section>

      {/* Payroll Overview */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollSummary.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gross Pay</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollSummary.totalGrossPay}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mr-4">
                  <BanknotesIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Pay</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollSummary.totalNetPay}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mr-4">
                  <CalendarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollSummary.nextPayrollDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Payroll */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Employee Payroll</h2>
              <p className="text-lg text-gray-600">Manage individual employee payroll and compensation</p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Add Employee
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Current Payroll Period</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.position}</div>
                        <div className="text-sm text-gray-500">{employee.salary}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.hoursWorked} hrs</div>
                        <div className="text-sm text-gray-500">@{employee.hourlyRate}/hr</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.grossPay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.deductions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.netPay}</div>
                        <div className="text-sm text-gray-500">Last paid: {employee.lastPayDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-500 flex items-center gap-1">
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Payroll History */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payroll History</h2>
            <p className="text-lg text-gray-600">Track all previous payroll runs and payments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {payrollHistory.map((payroll) => (
              <div key={payroll.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
                    {payroll.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{payroll.payPeriod}</h3>
                <p className="text-sm text-gray-600 mb-4">Pay Date: {payroll.payDate}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium text-gray-900">{payroll.employees}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gross Pay:</span>
                    <span className="font-medium text-gray-900">{payroll.grossPay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Net Pay:</span>
                    <span className="font-medium text-gray-900">{payroll.netPay}</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deductions Breakdown */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payroll Deductions</h2>
            <p className="text-lg text-gray-600">Breakdown of all payroll deductions and taxes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Current Period Deductions</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {deductions.map((deduction, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{deduction.type}</h4>
                      <p className="text-sm text-gray-600">{deduction.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{deduction.amount}</div>
                      <div className="text-sm text-gray-500">{deduction.percentage}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">Total Deductions</div>
                <div className="text-lg font-bold text-gray-900">{payrollSummary.totalDeductions}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payroll Tools */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payroll Tools & Features</h2>
            <p className="text-lg text-gray-600">Powerful tools to streamline your payroll process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Tracking</h3>
              <p className="text-gray-600 mb-4">Track employee hours and overtime automatically.</p>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Set Up
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <BanknotesIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Deposit</h3>
              <p className="text-gray-600 mb-4">Set up automated direct deposits for employees.</p>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Configure
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Forms</h3>
              <p className="text-gray-600 mb-4">Generate W-2s, 1099s, and other tax forms.</p>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Generate
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance</h3>
              <p className="text-gray-600 mb-4">Ensure compliance with labor laws and regulations.</p>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors">
                Check Status
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Streamline Your Payroll Process
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Automate payroll calculations, tax deductions, and compliance reporting. 
            Save time and reduce errors with our comprehensive payroll management system.
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
              Talk to Payroll Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}