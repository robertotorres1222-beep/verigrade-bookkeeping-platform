'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  CalculatorIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  shortcut?: string;
  category: 'transaction' | 'invoice' | 'expense' | 'customer' | 'report' | 'settings';
  action: () => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-invoice',
    title: 'Create Invoice',
    description: 'Generate a new invoice for a customer',
    icon: DocumentTextIcon,
    color: 'bg-blue-500',
    shortcut: 'Ctrl+I',
    category: 'invoice',
    action: () => console.log('Create invoice')
  },
  {
    id: 'add-expense',
    title: 'Add Expense',
    description: 'Record a new business expense',
    icon: ReceiptRefundIcon,
    color: 'bg-red-500',
    shortcut: 'Ctrl+E',
    category: 'expense',
    action: () => console.log('Add expense')
  },
  {
    id: 'add-customer',
    title: 'Add Customer',
    description: 'Create a new customer profile',
    icon: UserGroupIcon,
    color: 'bg-green-500',
    shortcut: 'Ctrl+C',
    category: 'customer',
    action: () => console.log('Add customer')
  },
  {
    id: 'record-transaction',
    title: 'Record Transaction',
    description: 'Manually enter a transaction',
    icon: CurrencyDollarIcon,
    color: 'bg-purple-500',
    shortcut: 'Ctrl+T',
    category: 'transaction',
    action: () => console.log('Record transaction')
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create a financial report',
    icon: ChartBarIcon,
    color: 'bg-indigo-500',
    shortcut: 'Ctrl+R',
    category: 'report',
    action: () => console.log('Generate report')
  },
  {
    id: 'bank-reconciliation',
    title: 'Bank Reconciliation',
    description: 'Reconcile bank transactions',
    icon: BanknotesIcon,
    color: 'bg-yellow-500',
    shortcut: 'Ctrl+B',
    category: 'transaction',
    action: () => console.log('Bank reconciliation')
  },
  {
    id: 'time-tracking',
    title: 'Time Tracking',
    description: 'Start/stop time tracking',
    icon: ClockIcon,
    color: 'bg-pink-500',
    shortcut: 'Ctrl+Shift+T',
    category: 'transaction',
    action: () => console.log('Time tracking')
  },
  {
    id: 'tax-calculator',
    title: 'Tax Calculator',
    description: 'Calculate tax amounts',
    icon: CalculatorIcon,
    color: 'bg-teal-500',
    shortcut: 'Ctrl+Shift+C',
    category: 'settings',
    action: () => console.log('Tax calculator')
  }
];

const categories = {
  transaction: 'Transactions',
  invoice: 'Invoicing',
  expense: 'Expenses',
  customer: 'Customers',
  report: 'Reports',
  settings: 'Settings'
};

export default function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentActions, setRecentActions] = useState<string[]>([]);

  const filteredActions = quickActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActionClick = (action: QuickAction) => {
    action.action();
    setRecentActions(prev => [action.id, ...prev.filter(id => id !== action.id)].slice(0, 5));
    setIsOpen(false);
    setSearchQuery('');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open quick actions with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Execute actions with shortcuts
      if (isOpen) {
        const action = quickActions.find(a => a.shortcut === `${e.ctrlKey ? 'Ctrl+' : ''}${e.key.toUpperCase()}`);
        if (action) {
          e.preventDefault();
          handleActionClick(action);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <PlusIcon className="w-6 h-6 mx-auto" />
      </motion.button>

      {/* Quick Actions Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(categories).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === key
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions List */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {filteredActions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No actions found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredActions.map((action) => (
                      <motion.button
                        key={action.id}
                        onClick={() => handleActionClick(action)}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        whileHover={{ x: 4 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {action.shortcut && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {action.shortcut}
                            </span>
                          )}
                          <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Actions */}
              {recentActions.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentActions.map(actionId => {
                      const action = quickActions.find(a => a.id === actionId);
                      if (!action) return null;
                      
                      return (
                        <button
                          key={actionId}
                          onClick={() => handleActionClick(action)}
                          className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <action.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{action.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+K</kbd> to open</span>
                    <span>Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd> to close</span>
                  </div>
                  <span>{filteredActions.length} actions available</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
