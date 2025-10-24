'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  StopIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'manual';
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  frequency: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  recipients: string[];
  createdAt: Date;
}

const ReportTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  // Mock data
  useEffect(() => {
    setTemplates([
      {
        id: '1',
        name: 'Monthly P&L Summary',
        description: 'Comprehensive profit and loss statement with key metrics',
        category: 'Financial',
        frequency: 'monthly',
        isActive: true,
        lastRun: new Date('2024-01-15'),
        nextRun: new Date('2024-02-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Cash Flow Analysis',
        description: 'Weekly cash flow analysis with projections',
        category: 'Financial',
        frequency: 'weekly',
        isActive: true,
        lastRun: new Date('2024-01-20'),
        nextRun: new Date('2024-01-27'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '3',
        name: 'Tax Preparation Summary',
        description: 'Quarterly tax preparation summary for filing',
        category: 'Tax',
        frequency: 'quarterly',
        isActive: false,
        lastRun: new Date('2023-12-31'),
        nextRun: new Date('2024-03-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]);

    setScheduledReports([
      {
        id: '1',
        templateId: '1',
        templateName: 'Monthly P&L Summary',
        frequency: 'monthly',
        isActive: true,
        lastRun: new Date('2024-01-15'),
        nextRun: new Date('2024-02-15'),
        recipients: ['admin@company.com', 'cfo@company.com'],
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        templateId: '2',
        templateName: 'Cash Flow Analysis',
        frequency: 'weekly',
        isActive: true,
        lastRun: new Date('2024-01-20'),
        nextRun: new Date('2024-01-27'),
        recipients: ['admin@company.com'],
        createdAt: new Date('2024-01-01')
      }
    ]);
  }, []);

  const categories = ['Financial', 'Tax', 'Operational', 'Compliance', 'Custom'];

  const getFrequencyColor = (frequency: string) => {
    const colors = {
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800',
      quarterly: 'bg-orange-100 text-orange-800',
      yearly: 'bg-red-100 text-red-800',
      manual: 'bg-gray-100 text-gray-800'
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Templates & Scheduling</h1>
          <p className="mt-2 text-gray-600">
            Create, manage, and schedule automated reports for your business
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateTemplate(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Create Template
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateSchedule(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <CalendarIcon className="h-5 w-5" />
            Schedule Report
          </motion.button>
        </div>

        {/* Templates Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.isActive)}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(template.frequency)}`}>
                    {template.frequency}
                  </span>
                </div>

                {template.lastRun && (
                  <div className="text-xs text-gray-500 mb-2">
                    Last run: {template.lastRun.toLocaleDateString()}
                  </div>
                )}

                {template.nextRun && (
                  <div className="text-xs text-gray-500 mb-4">
                    Next run: {template.nextRun.toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTemplate(template)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Scheduled Reports</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scheduledReports.map((report) => (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.templateName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(report.frequency)}`}>
                          {report.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.isActive)}`}>
                          {report.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.lastRun ? report.lastRun.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.nextRun ? report.nextRun.toLocaleDateString() : 'Not scheduled'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <StopIcon className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplatesPage;

