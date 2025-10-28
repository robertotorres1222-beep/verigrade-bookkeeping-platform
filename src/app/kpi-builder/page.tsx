'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  PlusIcon,
  CogIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface KPI {
  id: string;
  name: string;
  description: string;
  formula: string;
  category: string;
  targetValue: number;
  unit: string;
  frequency: string;
  isActive: boolean;
  currentValue?: number;
  targetAchievement?: number;
}

export default function KPIBuilder() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    formula: '',
    category: 'Financial',
    targetValue: 0,
    unit: '',
    frequency: 'Monthly',
  });

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      // Mock data for demo
      const mockKPIs: KPI[] = [
        {
          id: 'kpi-1',
          name: 'Monthly Recurring Revenue (MRR)',
          description: 'Total recurring revenue from all clients',
          formula: 'SUM(monthly_fees)',
          category: 'Financial',
          targetValue: 50000,
          unit: 'USD',
          frequency: 'Monthly',
          isActive: true,
          currentValue: 45230,
          targetAchievement: 90.5,
        },
        {
          id: 'kpi-2',
          name: 'Client Satisfaction Score',
          description: 'Average client satisfaction rating',
          formula: 'AVG(satisfaction_ratings)',
          category: 'Client',
          targetValue: 4.5,
          unit: 'Rating',
          frequency: 'Quarterly',
          isActive: true,
          currentValue: 4.7,
          targetAchievement: 104.4,
        },
        {
          id: 'kpi-3',
          name: 'Average Processing Time',
          description: 'Average time to process client transactions',
          formula: 'AVG(processing_time)',
          category: 'Operational',
          targetValue: 2,
          unit: 'Days',
          frequency: 'Weekly',
          isActive: true,
          currentValue: 1.8,
          targetAchievement: 111.1,
        },
        {
          id: 'kpi-4',
          name: 'Client Retention Rate',
          description: 'Percentage of clients retained annually',
          formula: '(retained_clients / total_clients) * 100',
          category: 'Client',
          targetValue: 95,
          unit: 'Percentage',
          frequency: 'Annually',
          isActive: true,
          currentValue: 97.2,
          targetAchievement: 102.3,
        },
      ];
      setKpis(mockKPIs);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    }
  };

  const createKPI = async () => {
    if (!newKPI.name || !newKPI.formula) return;

    try {
      const kpi: KPI = {
        id: `kpi-${Date.now()}`,
        name: newKPI.name,
        description: newKPI.description,
        formula: newKPI.formula,
        category: newKPI.category,
        targetValue: newKPI.targetValue,
        unit: newKPI.unit,
        frequency: newKPI.frequency,
        isActive: true,
        currentValue: Math.random() * 100,
        targetAchievement: Math.random() * 120,
      };

      setKpis(prev => [kpi, ...prev]);
      setNewKPI({
        name: '',
        description: '',
        formula: '',
        category: 'Financial',
        targetValue: 0,
        unit: '',
        frequency: 'Monthly',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating KPI:', error);
    }
  };

  const filteredKPIs = selectedCategory === 'all' 
    ? kpis 
    : kpis.filter(kpi => kpi.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(kpis.map(kpi => kpi.category)))];

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 100) return 'text-green-600 bg-green-100';
    if (achievement >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4">
                    <ChartBarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">KPI Dashboard Builder</h1>
                    <p className="text-purple-100 text-lg">Create and manage custom KPIs for your practice</p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm text-purple-100">Interactive dashboard builder</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-sm text-purple-100">Active KPIs</p>
                      <p className="text-2xl font-bold">{kpis.filter(k => k.isActive).length}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center font-semibold"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New KPI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create KPI Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New KPI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KPI Name
                </label>
                <input
                  type="text"
                  value={newKPI.name}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly Recurring Revenue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newKPI.category}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Financial">Financial</option>
                  <option value="Client">Client</option>
                  <option value="Operational">Operational</option>
                  <option value="Growth">Growth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formula
                </label>
                <input
                  type="text"
                  value={newKPI.formula}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, formula: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SUM(monthly_fees)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  value={newKPI.targetValue}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={newKPI.unit}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., USD, Percentage, Days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={newKPI.frequency}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newKPI.description}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe what this KPI measures..."
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
                onClick={createKPI}
                disabled={!newKPI.name || !newKPI.formula}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create KPI
              </button>
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKPIs.map((kpi) => (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                    <p className="text-sm text-gray-600">{kpi.category}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpi.currentValue?.toLocaleString()} {kpi.unit}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Target Achievement</p>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAchievementColor(kpi.targetAchievement || 0)}`}>
                      {kpi.targetAchievement?.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Target</p>
                  <p className="text-sm text-gray-900">
                    {kpi.targetValue.toLocaleString()} {kpi.unit}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Frequency</p>
                  <p className="text-sm text-gray-900">{kpi.frequency}</p>
                </div>

                {kpi.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{kpi.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Formula</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
                    {kpi.formula}
                  </code>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredKPIs.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs found</h3>
            <p className="text-gray-600">Create your first KPI to start tracking your practice metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
