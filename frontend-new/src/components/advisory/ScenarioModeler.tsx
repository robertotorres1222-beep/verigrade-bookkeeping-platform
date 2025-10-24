'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  PlusIcon,
  PlayIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface Scenario {
  id: string;
  name: string;
  description: string;
  baseScenario: boolean;
  assumptions: Record<string, any>;
  variables: Record<string, any>;
  timeHorizon: number;
  isActive: boolean;
}

interface ScenarioResult {
  scenarioId: string;
  name: string;
  timeHorizon: number;
  projections: Array<{
    month: number;
    revenue: number;
    expenses: number;
    profit: number;
    cashFlow: number;
  }>;
  keyMetrics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    roi: number;
  };
}

export default function ScenarioModeler() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [results, setResults] = useState<ScenarioResult | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    timeHorizon: 12,
    assumptions: {},
    variables: {},
  });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      // Mock data for demo
      const mockScenarios: Scenario[] = [
        {
          id: 'scenario-1',
          name: 'Conservative Growth',
          description: 'Modest 5% annual growth with controlled expenses',
          baseScenario: true,
          assumptions: {
            revenueGrowth: 0.05,
            expenseGrowth: 0.03,
            inflation: 0.02,
          },
          variables: {
            newClients: 2,
            averageClientValue: 5000,
          },
          timeHorizon: 12,
          isActive: true,
        },
        {
          id: 'scenario-2',
          name: 'Aggressive Expansion',
          description: 'Rapid 20% growth with increased marketing spend',
          baseScenario: false,
          assumptions: {
            revenueGrowth: 0.20,
            expenseGrowth: 0.15,
            inflation: 0.02,
          },
          variables: {
            newClients: 8,
            averageClientValue: 7500,
          },
          timeHorizon: 12,
          isActive: true,
        },
        {
          id: 'scenario-3',
          name: 'Economic Downturn',
          description: 'Conservative approach during economic uncertainty',
          baseScenario: false,
          assumptions: {
            revenueGrowth: -0.05,
            expenseGrowth: 0.01,
            inflation: 0.03,
          },
          variables: {
            newClients: 0,
            averageClientValue: 4000,
          },
          timeHorizon: 12,
          isActive: true,
        },
      ];
      setScenarios(mockScenarios);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const createScenario = async () => {
    if (!newScenario.name) return;

    try {
      const scenario: Scenario = {
        id: `scenario-${Date.now()}`,
        name: newScenario.name,
        description: newScenario.description,
        baseScenario: scenarios.length === 0,
        assumptions: newScenario.assumptions,
        variables: newScenario.variables,
        timeHorizon: newScenario.timeHorizon,
        isActive: true,
      };

      setScenarios(prev => [scenario, ...prev]);
      setNewScenario({
        name: '',
        description: '',
        timeHorizon: 12,
        assumptions: {},
        variables: {},
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating scenario:', error);
    }
  };

  const runScenarioAnalysis = async (scenarioId: string) => {
    try {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) return;

      // Mock analysis results
      const mockResults: ScenarioResult = {
        scenarioId: scenario.id,
        name: scenario.name,
        timeHorizon: scenario.timeHorizon,
        projections: Array.from({ length: scenario.timeHorizon }, (_, i) => ({
          month: i + 1,
          revenue: Math.random() * 100000 + 50000,
          expenses: Math.random() * 80000 + 30000,
          profit: Math.random() * 20000 + 10000,
          cashFlow: Math.random() * 15000 + 5000,
        })),
        keyMetrics: {
          totalRevenue: Math.random() * 1200000 + 600000,
          totalExpenses: Math.random() * 960000 + 360000,
          netProfit: Math.random() * 240000 + 120000,
          profitMargin: Math.random() * 20 + 10,
          roi: Math.random() * 30 + 15,
        },
      };

      setResults(mockResults);
      setSelectedScenario(scenarioId);
    } catch (error) {
      console.error('Error running scenario analysis:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scenario Modeler</h1>
              <p className="mt-2 text-gray-600">Create and analyze financial scenarios for your practice</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Scenario
            </button>
          </div>
        </div>

        {/* Create Scenario Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Scenario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={newScenario.name}
                  onChange={(e) => setNewScenario(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Conservative Growth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Horizon (months)
                </label>
                <input
                  type="number"
                  value={newScenario.timeHorizon}
                  onChange={(e) => setNewScenario(prev => ({ ...prev, timeHorizon: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newScenario.description}
                  onChange={(e) => setNewScenario(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe this scenario..."
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
                onClick={createScenario}
                disabled={!newScenario.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Scenario
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scenarios List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scenarios</h2>
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 bg-white rounded-lg shadow-sm border ${
                    selectedScenario === scenario.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{scenario.name}</h3>
                      {scenario.baseScenario && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Base Scenario
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => runScenarioAnalysis(scenario.id)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Analyze
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Time Horizon:</span>
                      <span className="ml-1 font-medium">{scenario.timeHorizon} months</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-1 font-medium ${scenario.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {scenario.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
            {results ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(results.keyMetrics.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(results.keyMetrics.totalExpenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Profit</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(results.keyMetrics.netProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profit Margin</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPercentage(results.keyMetrics.profitMargin)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Monthly Projections */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Projections</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-sm font-medium text-gray-600">Month</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Expenses</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.projections.slice(0, 6).map((projection) => (
                          <tr key={projection.month} className="border-b border-gray-100">
                            <td className="py-2 text-sm text-gray-900">Month {projection.month}</td>
                            <td className="py-2 text-sm text-gray-900 text-right">
                              {formatCurrency(projection.revenue)}
                            </td>
                            <td className="py-2 text-sm text-gray-900 text-right">
                              {formatCurrency(projection.expenses)}
                            </td>
                            <td className="py-2 text-sm text-green-600 text-right">
                              {formatCurrency(projection.profit)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
                <p className="text-gray-600">Select a scenario and click "Analyze" to see projections.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

