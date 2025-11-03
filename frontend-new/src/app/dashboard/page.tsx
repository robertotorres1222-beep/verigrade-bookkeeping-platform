'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WidgetSystem from '@/components/Dashboard/WidgetSystem';
import AdvancedCharts from '@/components/Dashboard/AdvancedCharts';
import NotificationCenter from '@/components/Dashboard/NotificationCenter';
import QuickActionsMenu from '@/components/Dashboard/QuickActionsMenu';
import EnhancedCommandPalette from '@/components/Dashboard/EnhancedCommandPalette';
import CurrencySelector from '@/components/CurrencySelector';
import CurrencyConverter from '@/components/CurrencyConverter';
import { StatCard } from '@/components/ui/StatCard';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  Cog6ToothIcon,
  BellIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeCustomers: number;
  pendingInvoices: number;
  overduePayments: number;
  monthlyGrowth: number;
  cashFlow: number;
}

const mockStats: DashboardStats = {
  totalRevenue: 125000,
  totalExpenses: 45000,
  netProfit: 80000,
  activeCustomers: 156,
  pendingInvoices: 23,
  overduePayments: 8,
  monthlyGrowth: 12.5,
  cashFlow: 35000
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [showWidgets, setShowWidgets] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatValue = (val: number, format: 'currency' | 'number' | 'percentage' = 'currency') => {
    switch (format) {
      case 'currency': return formatCurrency(val);
      case 'percentage': return `${val.toFixed(1)}%`;
      default: return val.toLocaleString();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timeframe Selector */}
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              {/* View Toggle */}
              <button
                onClick={() => setShowWidgets(!showWidgets)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                <span>{showWidgets ? 'Hide' : 'Show'} Widgets</span>
              </button>

              {/* Notifications */}
              <NotificationCenter />

              {/* Command Palette */}
              <EnhancedCommandPalette />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total Revenue"
              value={formatValue(stats.totalRevenue)}
              change={8.2}
              trend="up"
              icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
              color="success"
              variant="elevated"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Total Expenses"
              value={formatValue(stats.totalExpenses)}
              change={2.1}
              trend="down"
              icon={<ArrowTrendingDownIcon className="w-6 h-6" />}
              color="error"
              variant="elevated"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Net Profit"
              value={formatValue(stats.netProfit)}
              change={15.3}
              trend="up"
              icon={<CurrencyDollarIcon className="w-6 h-6" />}
              color="primary"
              variant="elevated"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Active Customers"
              value={stats.activeCustomers.toLocaleString()}
              change={5.7}
              trend="up"
              icon={<UserGroupIcon className="w-6 h-6" />}
              color="secondary"
              variant="elevated"
            />
          </motion.div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StatCard
              title="Pending Invoices"
              value={stats.pendingInvoices.toString()}
              icon={<DocumentTextIcon className="w-6 h-6" />}
              color="warning"
              variant="default"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <StatCard
              title="Overdue Payments"
              value={stats.overduePayments.toString()}
              icon={<ReceiptRefundIcon className="w-6 h-6" />}
              color="error"
              variant="default"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <StatCard
              title="Cash Flow"
              value={formatValue(stats.cashFlow)}
              change={12.8}
              trend="up"
              icon={<ClockIcon className="w-6 h-6" />}
              color="primary"
              variant="default"
            />
          </motion.div>
        </div>

        {/* Currency Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CurrencyConverter />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Currency Converter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Currency
                </label>
                <CurrencySelector
                  selectedCurrency="USD"
                  onCurrencyChange={() => {}}
                  showRates={true}
                />
              </div>
              <div className="text-sm text-gray-500">
                <p>Current rates are updated in real-time</p>
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AdvancedCharts
            title="Revenue Trends"
            type="line"
            height={300}
            showPredictions={true}
          />
          <AdvancedCharts
            title="Expense Breakdown"
            type="pie"
            height={300}
          />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AdvancedCharts
            title="Monthly Performance"
            type="bar"
            height={250}
          />
          <AdvancedCharts
            title="Customer Distribution"
            type="treemap"
            height={250}
          />
          <AdvancedCharts
            title="Sales Funnel"
            type="funnel"
            height={250}
          />
        </div>

        {/* Widget System */}
        {showWidgets && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WidgetSystem />
          </motion.div>
        )}
      </div>

      {/* Quick Actions Menu */}
      <QuickActionsMenu />
    </div>
  );
}