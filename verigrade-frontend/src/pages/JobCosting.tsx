'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  projectName: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  startDate: string;
  endDate?: string;
  budget: number;
  hourlyRate?: number;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  tags: string[];
  totalHours: number;
  totalExpenses: number;
  profitability: {
    grossMargin: number;
    grossProfit: number;
    profitabilityScore: number;
  };
}

interface TimeEntry {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  hourlyRate?: number;
}

interface ProjectExpense {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  billable: boolean;
  receiptUrl?: string;
}

const JobCostingPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'time' | 'expenses' | 'profitability'>('overview');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTimeEntry, setShowCreateTimeEntry] = useState(false);
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        projectName: 'Website Redesign',
        description: 'Complete redesign of company website',
        clientName: 'Acme Corp',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        budget: 25000,
        hourlyRate: 150,
        status: 'active',
        tags: ['web', 'design', 'frontend'],
        totalHours: 120,
        totalExpenses: 5000,
        profitability: {
          grossMargin: 35.2,
          grossProfit: 8750,
          profitabilityScore: 85
        }
      },
      {
        id: '2',
        projectName: 'Mobile App Development',
        description: 'iOS and Android app development',
        clientName: 'TechStart Inc',
        startDate: '2024-02-01',
        endDate: '2024-06-01',
        budget: 50000,
        hourlyRate: 175,
        status: 'active',
        tags: ['mobile', 'development', 'ios', 'android'],
        totalHours: 200,
        totalExpenses: 8000,
        profitability: {
          grossMargin: 42.8,
          grossProfit: 21400,
          profitabilityScore: 92
        }
      },
      {
        id: '3',
        projectName: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution',
        clientName: 'Retail Plus',
        startDate: '2023-11-01',
        endDate: '2024-01-31',
        budget: 75000,
        hourlyRate: 200,
        status: 'completed',
        tags: ['ecommerce', 'fullstack', 'backend'],
        totalHours: 300,
        totalExpenses: 12000,
        profitability: {
          grossMargin: 38.5,
          grossProfit: 28875,
          profitabilityScore: 88
        }
      }
    ];

    setProjects(mockProjects);
    setSelectedProject(mockProjects[0]);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfitabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitabilityIcon = (score: number) => {
    if (score >= 80) return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-600" />;
    return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Costing</h1>
              <p className="mt-2 text-gray-600">Track project costs, time, and profitability</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateProject(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Project
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Projects</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedProject?.id === project.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{project.projectName}</h4>
                        <p className="text-sm text-gray-500">{project.clientName}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className="text-xs text-gray-500">${project.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getProfitabilityIcon(project.profitability.profitabilityScore)}
                        <span className={`text-sm font-medium ${getProfitabilityColor(project.profitability.profitabilityScore)}`}>
                          {project.profitability.profitabilityScore}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {selectedProject && (
              <div className="bg-white rounded-lg shadow">
                {/* Project Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedProject.projectName}</h2>
                      <p className="text-sm text-gray-600">{selectedProject.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">${selectedProject.budget.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Budget</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {[
                      { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                      { id: 'time', name: 'Time Tracking', icon: ClockIcon },
                      { id: 'expenses', name: 'Expenses', icon: CurrencyDollarIcon },
                      { id: 'profitability', name: 'Profitability', icon: ArrowTrendingUpIcon },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-5 w-5 inline mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <ClockIcon className="h-8 w-8 text-blue-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Total Hours</p>
                              <p className="text-2xl font-semibold text-gray-900">{selectedProject.totalHours}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                              <p className="text-2xl font-semibold text-gray-900">${selectedProject.totalExpenses.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-500">Gross Margin</p>
                              <p className="text-2xl font-semibold text-gray-900">{selectedProject.profitability.grossMargin}%</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Project Details</h4>
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Client</dt>
                              <dd className="text-sm text-gray-900">{selectedProject.clientName}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                              <dd className="text-sm text-gray-900">{new Date(selectedProject.startDate).toLocaleDateString()}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">End Date</dt>
                              <dd className="text-sm text-gray-900">
                                {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Ongoing'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
                              <dd className="text-sm text-gray-900">${selectedProject.hourlyRate}/hour</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'time' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Time Entries</h4>
                        <button
                          onClick={() => setShowCreateTimeEntry(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Time Entry
                        </button>
                      </div>
                      <div className="text-center py-8 text-gray-500">
                        <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No time entries recorded yet</p>
                        <p className="text-sm">Start tracking time to see entries here</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'expenses' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">Project Expenses</h4>
                        <button
                          onClick={() => setShowCreateExpense(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Expense
                        </button>
                      </div>
                      <div className="text-center py-8 text-gray-500">
                        <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No expenses recorded yet</p>
                        <p className="text-sm">Add project expenses to track costs</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'profitability' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-green-800">Gross Profit</p>
                              <p className="text-2xl font-semibold text-green-900">
                                ${selectedProject.profitability.grossProfit.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-800">Profitability Score</p>
                              <p className="text-2xl font-semibold text-blue-900">
                                {selectedProject.profitability.profitabilityScore}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Profitability Analysis</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Gross Margin</span>
                            <span className="text-sm font-medium text-gray-900">{selectedProject.profitability.grossMargin}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Revenue</span>
                            <span className="text-sm font-medium text-gray-900">${selectedProject.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Costs</span>
                            <span className="text-sm font-medium text-gray-900">${(selectedProject.budget - selectedProject.profitability.grossProfit).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCostingPage;

