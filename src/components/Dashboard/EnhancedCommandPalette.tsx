'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CommandLineIcon,
  ArrowRightIcon,
  XMarkIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CalculatorIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  ClockIcon,
  FolderIcon,
  CogIcon,
  UserIcon,
  BellIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  TableCellsIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  KeyIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  keywords: string[];
  shortcut?: string;
  action: () => void;
  subCommands?: Command[];
}

const commands: Command[] = [
  // Navigation Commands
  {
    id: 'nav-dashboard',
    title: 'Go to Dashboard',
    description: 'Navigate to the main dashboard',
    icon: ChartBarIcon,
    category: 'Navigation',
    keywords: ['dashboard', 'home', 'main'],
    shortcut: 'Ctrl+1',
    action: () => console.log('Navigate to dashboard')
  },
  {
    id: 'nav-transactions',
    title: 'Go to Transactions',
    description: 'View and manage transactions',
    icon: CurrencyDollarIcon,
    category: 'Navigation',
    keywords: ['transactions', 'money', 'payments'],
    shortcut: 'Ctrl+2',
    action: () => console.log('Navigate to transactions')
  },
  {
    id: 'nav-invoices',
    title: 'Go to Invoices',
    description: 'Create and manage invoices',
    icon: DocumentTextIcon,
    category: 'Navigation',
    keywords: ['invoices', 'billing', 'payments'],
    shortcut: 'Ctrl+3',
    action: () => console.log('Navigate to invoices')
  },
  {
    id: 'nav-expenses',
    title: 'Go to Expenses',
    description: 'Track and categorize expenses',
    icon: ReceiptRefundIcon,
    category: 'Navigation',
    keywords: ['expenses', 'costs', 'receipts'],
    shortcut: 'Ctrl+4',
    action: () => console.log('Navigate to expenses')
  },
  {
    id: 'nav-customers',
    title: 'Go to Customers',
    description: 'Manage customer information',
    icon: UserGroupIcon,
    category: 'Navigation',
    keywords: ['customers', 'clients', 'contacts'],
    shortcut: 'Ctrl+5',
    action: () => console.log('Navigate to customers')
  },
  {
    id: 'nav-reports',
    title: 'Go to Reports',
    description: 'Generate and view reports',
    icon: ChartPieIcon,
    category: 'Navigation',
    keywords: ['reports', 'analytics', 'data'],
    shortcut: 'Ctrl+6',
    action: () => console.log('Navigate to reports')
  },

  // Quick Actions
  {
    id: 'create-invoice',
    title: 'Create Invoice',
    description: 'Generate a new invoice for a customer',
    icon: DocumentTextIcon,
    category: 'Quick Actions',
    keywords: ['invoice', 'create', 'new', 'billing'],
    shortcut: 'Ctrl+I',
    action: () => console.log('Create invoice')
  },
  {
    id: 'add-expense',
    title: 'Add Expense',
    description: 'Record a new business expense',
    icon: ReceiptRefundIcon,
    category: 'Quick Actions',
    keywords: ['expense', 'add', 'record', 'cost'],
    shortcut: 'Ctrl+E',
    action: () => console.log('Add expense')
  },
  {
    id: 'add-customer',
    title: 'Add Customer',
    description: 'Create a new customer profile',
    icon: UserGroupIcon,
    category: 'Quick Actions',
    keywords: ['customer', 'add', 'create', 'client'],
    shortcut: 'Ctrl+C',
    action: () => console.log('Add customer')
  },
  {
    id: 'record-transaction',
    title: 'Record Transaction',
    description: 'Manually enter a transaction',
    icon: CurrencyDollarIcon,
    category: 'Quick Actions',
    keywords: ['transaction', 'record', 'enter', 'money'],
    shortcut: 'Ctrl+T',
    action: () => console.log('Record transaction')
  },

  // Data Management
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Export data to CSV, Excel, or PDF',
    icon: ArrowDownTrayIcon,
    category: 'Data Management',
    keywords: ['export', 'download', 'csv', 'excel', 'pdf'],
    action: () => console.log('Export data')
  },
  {
    id: 'import-data',
    title: 'Import Data',
    description: 'Import data from CSV, Excel, or other sources',
    icon: ArrowUpTrayIcon,
    category: 'Data Management',
    keywords: ['import', 'upload', 'csv', 'excel', 'data'],
    action: () => console.log('Import data')
  },
  {
    id: 'backup-data',
    title: 'Backup Data',
    description: 'Create a backup of your data',
    icon: ShieldCheckIcon,
    category: 'Data Management',
    keywords: ['backup', 'save', 'export', 'security'],
    action: () => console.log('Backup data')
  },

  // Reports & Analytics
  {
    id: 'profit-loss',
    title: 'Profit & Loss Report',
    description: 'Generate a profit and loss statement',
    icon: ChartPieIcon,
    category: 'Reports',
    keywords: ['profit', 'loss', 'p&l', 'income', 'statement'],
    action: () => console.log('Generate P&L report')
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Report',
    description: 'Generate a cash flow statement',
    icon: ArrowPathIcon,
    category: 'Reports',
    keywords: ['cash', 'flow', 'statement', 'liquidity'],
    action: () => console.log('Generate cash flow report')
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    description: 'Generate a balance sheet report',
    icon: TableCellsIcon,
    category: 'Reports',
    keywords: ['balance', 'sheet', 'assets', 'liabilities'],
    action: () => console.log('Generate balance sheet')
  },
  {
    id: 'tax-report',
    title: 'Tax Report',
    description: 'Generate tax-related reports',
    icon: DocumentCheckIcon,
    category: 'Reports',
    keywords: ['tax', 'report', 'filing', 'compliance'],
    action: () => console.log('Generate tax report')
  },

  // Settings & Configuration
  {
    id: 'settings',
    title: 'Settings',
    description: 'Open application settings',
    icon: CogIcon,
    category: 'Settings',
    keywords: ['settings', 'preferences', 'configuration'],
    shortcut: 'Ctrl+,',
    action: () => console.log('Open settings')
  },
  {
    id: 'profile',
    title: 'User Profile',
    description: 'View and edit your profile',
    icon: UserIcon,
    category: 'Settings',
    keywords: ['profile', 'user', 'account', 'personal'],
    action: () => console.log('Open profile')
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage notification settings',
    icon: BellIcon,
    category: 'Settings',
    keywords: ['notifications', 'alerts', 'settings'],
    action: () => console.log('Open notifications')
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Manage security and privacy settings',
    icon: ShieldCheckIcon,
    category: 'Settings',
    keywords: ['security', 'privacy', 'password', '2fa'],
    action: () => console.log('Open security settings')
  },

  // Help & Support
  {
    id: 'help',
    title: 'Help Center',
    description: 'Access help documentation and support',
    icon: InformationCircleIcon,
    category: 'Help',
    keywords: ['help', 'support', 'documentation', 'guide'],
    shortcut: 'F1',
    action: () => console.log('Open help')
  },
  {
    id: 'contact-support',
    title: 'Contact Support',
    description: 'Get in touch with our support team',
    icon: EnvelopeIcon,
    category: 'Help',
    keywords: ['support', 'contact', 'help', 'ticket'],
    action: () => console.log('Contact support')
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'View all available keyboard shortcuts',
    icon: KeyIcon,
    category: 'Help',
    keywords: ['shortcuts', 'keyboard', 'hotkeys', 'keys'],
    action: () => console.log('Show shortcuts')
  }
];

export default function EnhancedCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(command => {
    const matchesQuery = command.title.toLowerCase().includes(query.toLowerCase()) ||
                        command.description.toLowerCase().includes(query.toLowerCase()) ||
                        command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || command.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(commands.map(c => c.category)))];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          setSelectedIndex(0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
            setQuery('');
            setSelectedIndex(0);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeCommand = (command: Command) => {
    command.action();
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  return (
    <>
      {/* Command Palette Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <CommandLineIcon className="w-4 h-4" />
        <span>Search or run command...</span>
        <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">⌘K</kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search commands..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(0);
                    }}
                    className="flex-1 text-lg border-none outline-none placeholder-gray-400"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="flex space-x-2 mt-3">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedIndex(0);
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'All' : category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <CommandLineIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No commands found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Try a different search term or category
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredCommands.map((command, index) => (
                      <motion.button
                        key={command.id}
                        onClick={() => executeCommand(command)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                          index === selectedIndex
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        whileHover={{ x: 4 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          index === selectedIndex ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <command.icon className={`w-5 h-5 ${
                            index === selectedIndex ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold ${
                            index === selectedIndex ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {command.title}
                          </h3>
                          <p className={`text-sm ${
                            index === selectedIndex ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {command.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              index === selectedIndex 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {command.category}
                            </span>
                            {command.shortcut && (
                              <kbd className={`text-xs px-2 py-1 rounded ${
                                index === selectedIndex 
                                  ? 'bg-blue-200 text-blue-800' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {command.shortcut}
                              </kbd>
                            )}
                          </div>
                        </div>
                        
                        <ArrowRightIcon className={`w-5 h-5 ${
                          index === selectedIndex ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>Esc Close</span>
                  </div>
                  <span>{filteredCommands.length} commands</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
