'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface TaxDeadline {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: 'UPCOMING' | 'OVERDUE' | 'COMPLETED';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  clientId: string;
  year: number;
  reminders: Array<{
    date: string;
    message: string;
  }>;
}

export default function TaxCalendar() {
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    type: 'INDIVIDUAL',
    dueDate: '',
    priority: 'MEDIUM',
    description: '',
    clientId: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchDeadlines();
  }, [selectedMonth, selectedYear, filter]);

  const fetchDeadlines = async () => {
    try {
      // Mock data for demo
      const mockDeadlines: TaxDeadline[] = [
        {
          id: 'deadline-1',
          title: 'Individual Tax Returns (Form 1040)',
          type: 'INDIVIDUAL',
          dueDate: '2024-04-15',
          status: 'UPCOMING',
          priority: 'HIGH',
          description: 'Deadline for filing individual tax returns',
          clientId: 'client-1',
          year: 2023,
          reminders: [
            { date: '2024-03-15', message: '30 days until deadline' },
            { date: '2024-04-01', message: '14 days until deadline' },
            { date: '2024-04-10', message: '5 days until deadline' },
          ],
        },
        {
          id: 'deadline-2',
          title: 'Corporate Tax Returns (Form 1120)',
          type: 'CORPORATE',
          dueDate: '2024-03-15',
          status: 'OVERDUE',
          priority: 'URGENT',
          description: 'Deadline for filing corporate tax returns',
          clientId: 'client-2',
          year: 2023,
          reminders: [],
        },
        {
          id: 'deadline-3',
          title: 'Quarterly Estimated Tax Payment (Q1)',
          type: 'ESTIMATED_TAX',
          dueDate: '2024-04-15',
          status: 'UPCOMING',
          priority: 'MEDIUM',
          description: 'First quarter estimated tax payment',
          clientId: 'client-3',
          year: 2024,
          reminders: [
            { date: '2024-04-01', message: '14 days until payment due' },
          ],
        },
        {
          id: 'deadline-4',
          title: 'Payroll Tax Returns (Form 941)',
          type: 'PAYROLL',
          dueDate: '2024-04-30',
          status: 'UPCOMING',
          priority: 'HIGH',
          description: 'Quarterly payroll tax return',
          clientId: 'client-1',
          year: 2024,
          reminders: [
            { date: '2024-04-15', message: '15 days until deadline' },
          ],
        },
        {
          id: 'deadline-5',
          title: 'Sales Tax Return',
          type: 'SALES_TAX',
          dueDate: '2024-04-20',
          status: 'UPCOMING',
          priority: 'MEDIUM',
          description: 'Monthly sales tax return',
          clientId: 'client-2',
          year: 2024,
          reminders: [
            { date: '2024-04-10', message: '10 days until deadline' },
          ],
        },
      ];
      setDeadlines(mockDeadlines);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  };

  const createDeadline = async () => {
    if (!newDeadline.title || !newDeadline.dueDate) return;

    try {
      const deadline: TaxDeadline = {
        id: `deadline-${Date.now()}`,
        title: newDeadline.title,
        type: newDeadline.type,
        dueDate: newDeadline.dueDate,
        status: 'UPCOMING',
        priority: newDeadline.priority as any,
        description: newDeadline.description,
        clientId: newDeadline.clientId,
        year: newDeadline.year,
        reminders: [],
      };

      setDeadlines(prev => [deadline, ...prev]);
      setNewDeadline({
        title: '',
        type: 'INDIVIDUAL',
        dueDate: '',
        priority: 'MEDIUM',
        description: '',
        clientId: '',
        year: new Date().getFullYear(),
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating deadline:', error);
    }
  };

  const updateDeadlineStatus = async (deadlineId: string, status: TaxDeadline['status']) => {
    try {
      setDeadlines(prev => prev.map(deadline => 
        deadline.id === deadlineId 
          ? { ...deadline, status }
          : deadline
      ));
    } catch (error) {
      console.error('Error updating deadline status:', error);
    }
  };

  const filteredDeadlines = deadlines.filter(deadline => {
    if (filter !== 'all' && deadline.status !== filter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'OVERDUE': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'UPCOMING': return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default: return <CalendarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'OVERDUE': return 'text-red-600 bg-red-100';
      case 'UPCOMING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDeadline = (dueDate: string) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4">
                    <CalendarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Tax Calendar</h1>
                    <p className="text-blue-100 text-lg">Manage tax deadlines and compliance requirements</p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm text-blue-100">Real-time deadline tracking</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-100">Upcoming Deadlines</p>
                      <p className="text-2xl font-bold">{deadlines.filter(d => d.status === 'UPCOMING').length}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center font-semibold"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Deadline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Deadline Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Tax Deadline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Individual Tax Returns"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newDeadline.type}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="ESTIMATED_TAX">Estimated Tax</option>
                  <option value="PAYROLL">Payroll</option>
                  <option value="SALES_TAX">Sales Tax</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newDeadline.priority}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe the deadline requirements..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={createDeadline}
                disabled={!newDeadline.title || !newDeadline.dueDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Deadline
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'UPCOMING', 'OVERDUE', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'All Deadlines' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Deadlines List */}
        <div className="space-y-4">
          {filteredDeadlines.map((deadline) => (
            <motion.div
              key={deadline.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(deadline.status)}
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{deadline.title}</h3>
                    <p className="text-sm text-gray-600">{deadline.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deadline.status)}`}>
                    {deadline.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deadline.priority)}`}>
                    {deadline.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(deadline.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Remaining</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getDaysUntilDeadline(deadline.dueDate)} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-sm font-medium text-gray-900">{deadline.type}</p>
                </div>
              </div>

              {deadline.reminders.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Reminders</p>
                  <div className="space-y-1">
                    {deadline.reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {reminder.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {deadline.status !== 'COMPLETED' && (
                    <button
                      onClick={() => updateDeadlineStatus(deadline.id, 'COMPLETED')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      Mark Complete
                    </button>
                  )}
                  {deadline.status === 'UPCOMING' && (
                    <button
                      onClick={() => updateDeadlineStatus(deadline.id, 'OVERDUE')}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Mark Overdue
                    </button>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDeadlines.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deadlines found</h3>
            <p className="text-gray-600">Create your first tax deadline to start tracking compliance requirements.</p>
          </div>
        )}
      </div>
    </div>
  );
}
