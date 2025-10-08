'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  CalculatorIcon,
  DocumentCheckIcon,
  ReceiptRefundIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import AIResearchAssistant from './AIResearchAssistant';
import PWAInstaller from './PWAInstaller';
import MCPIntegration from './MCPIntegration';
import LocalAnalyticsViewer from './LocalAnalyticsViewer';
import AnalyticsTester from './AnalyticsTester';

interface User {
  name: string;
  email: string;
  company: string;
}

export default function StartupDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Enhanced analytics tracking
  const trackEvent = async (eventName: string, properties?: any) => {
    try {
      // Try PostHog first, fallback to local analytics
      try {
        const { trackEvent: trackPostHog } = await import('../lib/posthog');
        trackPostHog(eventName, properties);
      } catch (error) {
        // PostHog not available, use local analytics
        const localAnalytics = await import('../lib/localAnalytics');
        localAnalytics.default.track(eventName, properties);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const handleTabChange = async (tabId: string) => {
    setActiveTab(tabId);
    
    // Track tab change
    await trackEvent('dashboard_tab_change', {
      previous_tab: activeTab,
      new_tab: tabId,
      timestamp: new Date().toISOString()
    });
  };

  // Mock data
  const [transactions] = useState([
    {
      id: '1',
      type: 'income',
      description: 'Website Design Project',
      amount: 2500,
      date: '2024-01-15',
      category: 'Services',
      status: 'completed'
    },
    {
      id: '2',
      type: 'expense',
      description: 'Office Supplies',
      amount: 125.50,
      date: '2024-01-14',
      category: 'Office',
      status: 'completed'
    },
    {
      id: '3',
      type: 'income',
      description: 'Mobile App Development',
      amount: 5000,
      date: '2024-01-13',
      category: 'Services',
      status: 'pending'
    }
  ]);

  const [dashboardStats] = useState({
    totalRevenue: 7500,
    totalExpenses: 125.50,
    profit: 7374.50,
    pendingInvoices: 1,
    totalCustomers: 12
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const orgData = localStorage.getItem('organization');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        let organization: any = {};
        
        // Safely parse organization data
        if (orgData && orgData !== 'undefined' && orgData !== 'null') {
          organization = JSON.parse(orgData);
        }
        
        setUser({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          company: organization.name || 'My Company'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Set default user data if parsing fails
        setUser({
          name: 'User',
          email: 'user@example.com',
          company: 'My Company'
        });
      }
    } else {
      // Set default user data if no user data exists
      setUser({
        name: 'User',
        email: 'user@example.com',
        company: 'My Company'
      });
    }
  }, []);

  const handleLogout = async () => {
    // Track logout event
    await trackEvent('user_logout', {
      user: user?.email,
      company: user?.company,
      timestamp: new Date().toISOString()
    });
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    
    // Clear cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to login
    window.location.href = '/login';
  };

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: HomeIcon },
    { id: 'transactions', name: 'Transactions', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'reports', name: 'Reports', icon: PresentationChartLineIcon },
    { id: 'budget', name: 'Budget', icon: CalculatorIcon },
    { id: 'invoices', name: 'Invoices', icon: DocumentCheckIcon },
    { id: 'expenses', name: 'Expenses', icon: ReceiptRefundIcon },
    { id: 'clients', name: 'Clients', icon: UserGroupIcon },
    { id: 'banking', name: 'Banking', icon: BuildingOfficeIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="startup-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'total_revenue',
              value: dashboardStats.totalRevenue,
              timestamp: new Date().toISOString()
            });
            console.log('Revenue card clicked');
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${dashboardStats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="startup-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'total_expenses',
              value: dashboardStats.totalExpenses,
              timestamp: new Date().toISOString()
            });
            console.log('Expenses card clicked');
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ReceiptRefundIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${dashboardStats.totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="startup-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'net_profit',
              value: dashboardStats.profit,
              timestamp: new Date().toISOString()
            });
            console.log('Profit card clicked');
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${dashboardStats.profit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="startup-card cursor-pointer hover:shadow-lg transition-shadow"
          onClick={async () => {
            await trackEvent('stats_card_clicked', {
              card_type: 'total_customers',
              value: dashboardStats.totalCustomers,
              timestamp: new Date().toISOString()
            });
            console.log('Customers card clicked');
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.totalCustomers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="startup-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button 
            className="startup-btn-secondary"
            onClick={async () => {
              await trackEvent('add_transaction_clicked', {
                location: 'recent_transactions_section',
                timestamp: new Date().toISOString()
              });
              // Add your transaction creation logic here
              console.log('Add Transaction clicked from Recent Transactions');
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={async () => {
                          await trackEvent('transaction_view_clicked', {
                            transaction_id: transaction.id,
                            transaction_type: transaction.type,
                            timestamp: new Date().toISOString()
                          });
                          console.log('View transaction:', transaction.id);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={async () => {
                          await trackEvent('transaction_edit_clicked', {
                            transaction_id: transaction.id,
                            transaction_type: transaction.type,
                            timestamp: new Date().toISOString()
                          });
                          console.log('Edit transaction:', transaction.id);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={async () => {
                          await trackEvent('transaction_delete_clicked', {
                            transaction_id: transaction.id,
                            transaction_type: transaction.type,
                            timestamp: new Date().toISOString()
                          });
                          console.log('Delete transaction:', transaction.id);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="startup-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          <button 
            className="startup-btn-primary"
            onClick={async () => {
              await trackEvent('add_transaction_clicked', {
                location: 'all_transactions_section',
                timestamp: new Date().toISOString()
              });
              // Add your transaction creation logic here
              console.log('Add Transaction clicked from All Transactions');
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
        <p className="text-gray-600">Transaction management functionality will be implemented here.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'transactions':
        return renderTransactions();
      default:
        return (
          <div className="startup-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {navigationItems.find(item => item.id === activeTab)?.name}
            </h3>
            <p className="text-gray-600">
              This feature is coming soon. The {navigationItems.find(item => item.id === activeTab)?.name.toLowerCase()} 
              functionality will be implemented in the next update.
            </p>
          </div>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={async () => {
                  setSidebarOpen(!sidebarOpen);
                  await trackEvent('sidebar_toggle', {
                    action: sidebarOpen ? 'close' : 'open',
                    timestamp: new Date().toISOString()
                  });
                }}
                className="text-gray-500 hover:text-gray-600 lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-indigo-600 ml-4">VeriGrade</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-600">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.company}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-600"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-64 lg:flex-shrink-0`}>
          <div className="h-full bg-white shadow-sm">
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      activeTab === item.id
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name.split(' ')[0]}!
              </h2>
              <p className="text-gray-600">
                Here's what's happening with your business today.
              </p>
            </div>

            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* AI Research Assistant */}
      <AIResearchAssistant />
      
      {/* PWA Installer */}
      <PWAInstaller />
      
      {/* MCP Integration */}
      <MCPIntegration />

      {/* Analytics Tester */}
      <AnalyticsTester />

      {/* Local Analytics Viewer (for when PostHog is blocked) */}
      <LocalAnalyticsViewer />
    </div>
  );
}
