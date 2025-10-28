'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../lib/apiConfig';

interface Practice {
  id: string;
  name: string;
  description: string;
  logo: string;
  brandColor: string;
  customDomain: string;
  emailSignature: string;
}

interface Client {
  id: string;
  name: string;
  industry: string;
  status: string;
  monthlyFee: number;
  startDate: string;
  organization: {
    id: string;
    name: string;
    industry: string;
    isActive: boolean;
  };
  assignedStaff: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

interface Staff {
  id: string;
  role: string;
  hourlyRate: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLoginAt: string;
  };
  assignedClients: Array<{
    organization: {
      id: string;
      name: string;
    };
  }>;
}

interface Metrics {
  totalClients: number;
  activeClients: number;
  totalStaff: number;
  totalRevenue: number;
}

export default function PracticeDashboard() {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPracticeData();
  }, []);

  const fetchPracticeData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll use mock data
      // In production, this would fetch from the API
      const mockPractice: Practice = {
        id: 'practice-1',
        name: 'VeriGrade Accounting',
        description: 'Professional bookkeeping and advisory services',
        logo: '/logo.png',
        brandColor: '#3B82F6',
        customDomain: 'portal.verigrade.com',
        emailSignature: 'Best regards,\nVeriGrade Team',
      };

      const mockClients: Client[] = [
        {
          id: 'client-1',
          name: 'TechStart Inc',
          industry: 'Technology',
          status: 'ACTIVE',
          monthlyFee: 2500,
          startDate: '2024-01-15',
          organization: {
            id: 'org-1',
            name: 'TechStart Inc',
            industry: 'Technology',
            isActive: true,
          },
          assignedStaff: [
            {
              user: {
                id: 'staff-1',
                firstName: 'Sarah',
                lastName: 'Johnson',
              },
            },
          ],
        },
        {
          id: 'client-2',
          name: 'RetailCorp',
          industry: 'Retail',
          status: 'ACTIVE',
          monthlyFee: 1800,
          startDate: '2024-02-01',
          organization: {
            id: 'org-2',
            name: 'RetailCorp',
            industry: 'Retail',
            isActive: true,
          },
          assignedStaff: [
            {
              user: {
                id: 'staff-2',
                firstName: 'Mike',
                lastName: 'Chen',
              },
            },
          ],
        },
        {
          id: 'client-3',
          name: 'ConsultingPro',
          industry: 'Professional Services',
          status: 'ONBOARDING',
          monthlyFee: 3200,
          startDate: '2024-03-01',
          organization: {
            id: 'org-3',
            name: 'ConsultingPro',
            industry: 'Professional Services',
            isActive: true,
          },
          assignedStaff: [],
        },
      ];

      const mockStaff: Staff[] = [
        {
          id: 'staff-1',
          role: 'SENIOR_ACCOUNTANT',
          hourlyRate: 150,
          user: {
            id: 'user-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@verigrade.com',
            lastLoginAt: '2024-01-20T10:30:00Z',
          },
          assignedClients: [
            {
              organization: {
                id: 'org-1',
                name: 'TechStart Inc',
              },
            },
          ],
        },
        {
          id: 'staff-2',
          role: 'ACCOUNTANT',
          hourlyRate: 120,
          user: {
            id: 'user-2',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike@verigrade.com',
            lastLoginAt: '2024-01-20T09:15:00Z',
          },
          assignedClients: [
            {
              organization: {
                id: 'org-2',
                name: 'RetailCorp',
              },
            },
          ],
        },
      ];

      const mockMetrics: Metrics = {
        totalClients: 3,
        activeClients: 2,
        totalStaff: 2,
        totalRevenue: 7500,
      };

      setPractice(mockPractice);
      setClients(mockClients);
      setStaff(mockStaff);
      setMetrics(mockMetrics);
    } catch (err) {
      setError('Failed to load practice data');
      console.error('Error fetching practice data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <button
            onClick={fetchPracticeData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{practice?.name}</h1>
                <p className="text-gray-600">{practice?.description}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Client
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Metrics Cards with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                      {metrics?.totalClients}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-blue-600">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">+2</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors duration-300">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Clients</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                      {metrics?.activeClients}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">+1</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{width: '67%'}}></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-300">
                    <UserGroupIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                      {metrics?.totalStaff}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-purple-600">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">+1</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{width: '50%'}}></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors duration-300">
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors duration-300">
                      ${metrics?.totalRevenue?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-yellow-600">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">+15%</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Professional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-600">Last 6 months</p>
              </div>
              <div className="flex items-center text-green-600">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">+24%</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[65, 72, 58, 85, 78, 92].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-1000 hover:from-green-600 hover:to-green-500 cursor-pointer"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Client Health Score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Client Health Score</h3>
                <p className="text-sm text-gray-600">Overall satisfaction</p>
              </div>
              <div className="flex items-center text-blue-600">
                <span className="text-2xl font-bold">92%</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { name: 'TechStart Inc', score: 95, color: 'bg-green-500' },
                { name: 'RetailCorp', score: 88, color: 'bg-blue-500' },
                { name: 'ConsultingPro', score: 92, color: 'bg-purple-500' }
              ].map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${client.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{client.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${client.color} transition-all duration-1000`}
                        style={{ width: `${client.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{client.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Clients List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Client Portfolio</h2>
                    <p className="text-sm text-gray-600">Manage your client relationships</p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Client
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {clients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.industry}</p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              client.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {client.status === 'ACTIVE' ? 'Active' : 'Onboarding'}
                            </span>
                            {client.assignedStaff.length > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                Assigned to {client.assignedStaff[0].user.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${client.monthlyFee.toLocaleString()}/mo
                          </p>
                          <p className="text-sm text-gray-500">Monthly fee</p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Showing {clients.length} clients</p>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    View all clients →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Team & Quick Actions */}
          <div className="space-y-6">
            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <p className="text-sm text-gray-600">Your practice team</p>
              </div>
              <div className="divide-y divide-gray-100">
                {staff.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-indigo-300 transition-all duration-300">
                            <span className="text-sm font-bold text-purple-700">
                              {member.user.firstName[0]}{member.user.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{member.role.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-400">${member.hourlyRate}/hr</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {member.assignedClients.length} clients
                        </p>
                        <div className="flex items-center text-green-600 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          <span className="text-xs">Online</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
              </div>
              <div className="p-6 space-y-3">
                <button className="group w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200 mr-3">
                    <PlusIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Add New Client</p>
                    <p className="text-xs text-gray-500">Onboard a new client</p>
                  </div>
                </button>
                <button className="group w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all duration-200 border border-transparent hover:border-purple-200">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200 mr-3">
                    <UserGroupIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Invite Team Member</p>
                    <p className="text-xs text-gray-500">Add staff to your practice</p>
                  </div>
                </button>
                <button className="group w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200 mr-3">
                    <ChartBarIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Generate Reports</p>
                    <p className="text-xs text-gray-500">Create financial reports</p>
                  </div>
                </button>
                <button className="group w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-all duration-200 border border-transparent hover:border-yellow-200">
                  <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors duration-200 mr-3">
                    <BellIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Notifications</p>
                    <p className="text-xs text-gray-500">Check alerts and updates</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
