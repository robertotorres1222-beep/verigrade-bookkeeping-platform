'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

export default function JobCostingPage() {
  const [jobs] = useState([
    {
      id: 'JOB-001',
      name: 'Office Building Construction',
      client: 'ABC Development Corp',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      status: 'in-progress',
      budget: 2500000.00,
      actualCost: 1850000.00,
      estimatedCost: 2400000.00,
      hoursWorked: 2450,
      estimatedHours: 3000,
      profitMargin: 26.0,
      teamMembers: 12
    },
    {
      id: 'JOB-002',
      name: 'Residential Renovation',
      client: 'Smith Family',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      status: 'planning',
      budget: 85000.00,
      actualCost: 0.00,
      estimatedCost: 82000.00,
      hoursWorked: 0,
      estimatedHours: 480,
      profitMargin: 3.5,
      teamMembers: 3
    },
    {
      id: 'JOB-003',
      name: 'Retail Store Fit-out',
      client: 'Fashion Forward',
      startDate: '2023-11-01',
      endDate: '2024-01-15',
      status: 'completed',
      budget: 125000.00,
      actualCost: 118500.00,
      estimatedCost: 122000.00,
      hoursWorked: 680,
      estimatedHours: 720,
      profitMargin: 5.2,
      teamMembers: 5
    }
  ]);

  const [costBreakdowns] = useState([
    {
      jobId: 'JOB-001',
      category: 'Labor',
      budgeted: 1200000.00,
      actual: 980000.00,
      variance: -220000.00,
      percentage: 53.0
    },
    {
      jobId: 'JOB-001',
      category: 'Materials',
      budgeted: 800000.00,
      actual: 720000.00,
      variance: -80000.00,
      percentage: 38.9
    },
    {
      jobId: 'JOB-001',
      category: 'Equipment',
      budgeted: 300000.00,
      actual: 100000.00,
      variance: -200000.00,
      percentage: 5.4
    },
    {
      jobId: 'JOB-001',
      category: 'Subcontractors',
      budgeted: 200000.00,
      actual: 50000.00,
      variance: -150000.00,
      percentage: 2.7
    }
  ]);

  const costingStats = [
    { label: 'Active Jobs', value: '12', icon: ChartBarIcon, color: 'text-blue-600' },
    { label: 'Total Budget', value: '$3.2M', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { label: 'Avg. Profit Margin', value: '18.5%', icon: ArrowTrendingUpIcon, color: 'text-purple-600' },
    { label: 'Cost Variance', value: '-$125K', icon: ArrowTrendingDownIcon, color: 'text-red-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarianceColor = (variance: number) => {
    return variance < 0 ? 'text-red-600' : 'text-green-600';
  };

  const getVarianceIcon = (variance: number) => {
    return variance < 0 ? 
      <ArrowTrendingDownIcon className="h-4 w-4" /> : 
      <ArrowTrendingUpIcon className="h-4 w-4" />;
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Job
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600"> Costing</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Track project costs, monitor profitability, and optimize resource allocation. 
              Detailed job costing with real-time budget tracking and variance analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Costing Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {costingStats.map((stat, index) => (
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

      {/* Jobs Overview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Job Overview</h2>
              <p className="text-lg text-gray-600 mt-2">Track costs and profitability across all projects</p>
            </div>
            <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              New Job
            </button>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{job.name}</h3>
                    <p className="text-sm text-gray-500">{job.client}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                {/* Budget vs Actual */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Budget vs Actual</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${job.actualCost.toLocaleString()} / ${job.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${(job.actualCost / job.budget) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{((job.actualCost / job.budget) * 100).toFixed(1)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Estimated Cost</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ${job.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Hours Worked</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {job.hoursWorked.toLocaleString()} / {job.estimatedHours.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Team Members</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{job.teamMembers}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profit Margin</span>
                      <span className={`text-lg font-bold ${job.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {job.profitMargin > 0 ? '+' : ''}{job.profitMargin}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cost Breakdown Analysis</h2>
            <p className="text-lg text-gray-600">Detailed cost analysis for Office Building Construction project</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cost Categories</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budgeted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costBreakdowns.map((cost, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cost.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            ${cost.budgeted.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            ${cost.actual.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center ${getVarianceColor(cost.variance)}`}>
                          {getVarianceIcon(cost.variance)}
                          <span className="ml-1 text-sm font-medium">
                            ${Math.abs(cost.variance).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${cost.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{cost.percentage}%</span>
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

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Job Costing Features</h2>
            <p className="text-lg text-gray-600">Comprehensive project cost tracking and analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                <CalculatorIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Cost Tracking</h3>
              <p className="text-gray-600">Track labor, materials, equipment, and overhead costs in real-time as work progresses.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Budget vs Actual Analysis</h3>
              <p className="text-gray-600">Compare budgeted vs actual costs with detailed variance analysis and trend reporting.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Profitability Analysis</h3>
              <p className="text-gray-600">Monitor job profitability with margin analysis and cost-to-complete projections.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Labor Cost Tracking</h3>
              <p className="text-gray-600">Track labor hours and costs by employee, trade, and project phase for accurate costing.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Material Management</h3>
              <p className="text-gray-600">Track material costs, inventory, and usage across multiple job sites and projects.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cost Overrun Alerts</h3>
              <p className="text-gray-600">Receive alerts when costs exceed budget thresholds to take corrective action.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Optimize Your Project Profitability
          </h2>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Track costs accurately, monitor profitability, and make data-driven decisions. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
