'use client';

import { useState } from 'react';
import { 
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  UserGroupIcon,
  CogIcon,
  ReceiptRefundIcon,
  DocumentCheckIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  Bars3Icon,
  SparklesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const navigationItems = [
  { id: 'overview', name: 'Overview', icon: HomeIcon, href: '#overview' },
  { id: 'practice', name: 'Practice Dashboard', icon: BuildingOfficeIcon, href: '/practice' },
  { id: 'transactions', name: 'Transactions', icon: DocumentTextIcon, href: '#transactions' },
  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, href: '#analytics' },
  { id: 'ai-assistant', name: 'AI Assistant', icon: SparklesIcon, href: '/ai-assistant' },
  { id: 'kpi-builder', name: 'KPI Builder', icon: PresentationChartLineIcon, href: '/kpi-builder' },
  { id: 'tax-calendar', name: 'Tax Calendar', icon: CalculatorIcon, href: '/tax-calendar' },
  { id: 'currency', name: 'Currency Management', icon: CurrencyDollarIcon, href: '/currency' },
  { id: 'reports', name: 'Reports', icon: PresentationChartLineIcon, href: '#reports' },
  { id: 'budget', name: 'Budget', icon: CalculatorIcon, href: '#budget' },
  { id: 'invoices', name: 'Invoices', icon: DocumentCheckIcon, href: '#invoices' },
  { id: 'expenses', name: 'Expenses', icon: ReceiptRefundIcon, href: '#expenses' },
  { id: 'clients', name: 'Clients', icon: UserGroupIcon, href: '#clients' },
  { id: 'client-portal', name: 'Client Portal', icon: UserGroupIcon, href: '/client-portal' },
  { id: 'banking', name: 'Banking', icon: BanknotesIcon, href: '#banking' },
  { id: 'settings', name: 'Settings', icon: CogIcon, href: '#settings' },
];

export default function Navigation({ activeTab, onTabChange, sidebarOpen, onSidebarToggle }: NavigationProps) {
  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        onClick={onSidebarToggle}
      >
        <span className="sr-only">Open sidebar</span>
        {sidebarOpen ? (
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VG</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">VeriGrade</h1>
                <p className="text-xs text-gray-500">AI Bookkeeping</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.href?.startsWith('/')) {
                      // Handle external routes
                      window.location.href = item.href;
                    } else {
                      onTabChange(item.id);
                      onSidebarToggle(); // Close mobile menu after selection
                    }
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">JD</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">John Doe</p>
                <p className="text-xs text-gray-500">john@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={onSidebarToggle}
        />
      )}
    </>
  );
}




