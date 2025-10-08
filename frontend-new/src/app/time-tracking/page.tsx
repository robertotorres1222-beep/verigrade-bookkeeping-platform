'use client';

import { useState } from 'react';
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function TimeTrackingPage() {
  const [timeEntries] = useState([
    {
      id: 'TIME-001',
      project: 'Website Redesign',
      task: 'Frontend Development',
      employee: 'John Doe',
      startTime: '09:00 AM',
      endTime: '12:30 PM',
      duration: '3h 30m',
      date: '2024-01-20',
      billable: true,
      rate: 75.00,
      amount: 262.50,
      status: 'completed'
    },
    {
      id: 'TIME-002',
      project: 'Mobile App',
      task: 'UI/UX Design',
      employee: 'Jane Smith',
      startTime: '10:15 AM',
      endTime: '02:45 PM',
      duration: '4h 30m',
      date: '2024-01-20',
      billable: true,
      rate: 85.00,
      amount: 382.50,
      status: 'completed'
    },
    {
      id: 'TIME-003',
      project: 'Client Support',
      task: 'Bug Fixes',
      employee: 'Mike Johnson',
      startTime: '02:00 PM',
      endTime: '03:15 PM',
      duration: '1h 15m',
      date: '2024-01-20',
      billable: true,
      rate: 65.00,
      amount: 81.25,
      status: 'in-progress'
    },
    {
      id: 'TIME-004',
      project: 'Training',
      task: 'Team Training',
      employee: 'Sarah Wilson',
      startTime: '09:30 AM',
      endTime: '11:00 AM',
      duration: '1h 30m',
      date: '2024-01-19',
      billable: false,
      rate: 0.00,
      amount: 0.00,
      status: 'completed'
    }
  ]);

  const [projects] = useState([
    {
      id: 'PROJ-001',
      name: 'Website Redesign',
      client: 'Acme Corp',
      totalHours: 45.5,
      billableHours: 42.0,
      totalAmount: 3150.00,
      status: 'active',
      teamMembers: 3
    },
    {
      id: 'PROJ-002',
      name: 'Mobile App',
      client: 'TechStart Inc',
      totalHours: 78.25,
      billableHours: 75.0,
      totalAmount: 6375.00,
      status: 'active',
      teamMembers: 2
    },
    {
      id: 'PROJ-003',
      name: 'Client Support',
      client: 'Various',
      totalHours: 23.75,
      billableHours: 20.5,
      totalAmount: 1332.50,
      status: 'active',
      teamMembers: 2
    }
  ]);

  const timeStats = [
    { label: 'Total Hours Today', value: '8h 45m', icon: ClockIcon, color: 'text-blue-600' },
    { label: 'Billable Hours', value: '6h 30m', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { label: 'Active Projects', value: '3', icon: ChartBarIcon, color: 'text-purple-600' },
    { label: 'Team Members', value: '8', icon: UserIcon, color: 'text-indigo-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'in-progress': return <PlayIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Time
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Tracking</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Track time across projects, manage team productivity, and ensure accurate billing. 
              Monitor hours, generate reports, and optimize project profitability.
            </p>
          </div>
        </div>
      </section>

      {/* Time Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {timeStats.map((stat, index) => (
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

      {/* Active Timer */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Currently Tracking</h2>
                <p className="text-purple-100">Client Support - Bug Fixes</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold mb-2">1h 15m</div>
                <p className="text-purple-100">Started at 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                <PauseIcon className="h-5 w-5" />
                Pause
              </button>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-500 transition-colors flex items-center gap-2">
                <StopIcon className="h-5 w-5" />
                Stop
              </button>
              <button className="bg-transparent text-white border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors flex items-center gap-2">
                <PlusIcon className="h-5 w-5" />
                New Timer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Time Entries */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Time Entries</h2>
              <p className="text-lg text-gray-600 mt-2">Track and manage all time entries across projects</p>
            </div>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-colors flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              Add Entry
            </button>
          </div>

          {/* Time Entries Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Time Entries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project/Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.project}</div>
                          <div className="text-sm text-gray-500">{entry.task}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{entry.employee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{entry.startTime}</div>
                            <div className="text-sm text-gray-500">{entry.endTime}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.duration}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.billable ? `$${entry.rate}/hr` : 'Non-billable'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {entry.billable ? `$${entry.amount}` : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {getStatusIcon(entry.status)}
                          <span className="ml-1 capitalize">{entry.status}</span>
                        </span>
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

      {/* Project Overview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Overview</h2>
            <p className="text-lg text-gray-600">Track time and profitability across all projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.client}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {project.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Total Hours</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{project.totalHours}h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Billable Hours</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{project.billableHours}h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Team Members</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{project.teamMembers}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">${project.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Time Tracking Features</h2>
            <p className="text-lg text-gray-600">Comprehensive time tracking and project management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <PlayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Timer Functionality</h3>
              <p className="text-gray-600">Start, pause, and stop timers with one click. Track time in real-time across multiple projects.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Project Analytics</h3>
              <p className="text-gray-600">Detailed analytics on time spent, project profitability, and team productivity metrics.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Billing Integration</h3>
              <p className="text-gray-600">Automatically calculate billable amounts and integrate with invoicing and accounting systems.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time Reports</h3>
              <p className="text-gray-600">Generate detailed time reports for clients, projects, and team members with customizable formats.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <UserIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Team Management</h3>
              <p className="text-gray-600">Manage team members, assign projects, and track individual and team productivity.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scheduling</h3>
              <p className="text-gray-600">Schedule time blocks, set reminders, and plan project timelines with integrated calendar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-purple-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Tracking Time Today
          </h2>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Improve project profitability and team productivity with accurate time tracking. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <a
              href="/contact"
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
