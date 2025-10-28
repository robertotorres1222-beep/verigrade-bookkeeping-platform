'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'transaction' | 'invoice' | 'expense' | 'user' | 'security';
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: any;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Invoice Paid',
    message: 'Invoice #INV-2024-001 has been paid by John Smith',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    priority: 'medium',
    category: 'invoice',
    action: {
      label: 'View Invoice',
      onClick: () => console.log('View invoice')
    }
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Balance Alert',
    message: 'Your checking account balance is below $1,000',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    priority: 'high',
    category: 'system',
    action: {
      label: 'View Account',
      onClick: () => console.log('View account')
    }
  },
  {
    id: '3',
    type: 'info',
    title: 'New Transaction',
    message: 'A new transaction of $250.00 has been imported from your bank',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: true,
    priority: 'low',
    category: 'transaction',
    action: {
      label: 'Categorize',
      onClick: () => console.log('Categorize transaction')
    }
  },
  {
    id: '4',
    type: 'error',
    title: 'Bank Connection Failed',
    message: 'Failed to sync with Chase Bank. Please reconnect your account.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: false,
    priority: 'urgent',
    category: 'system',
    action: {
      label: 'Reconnect',
      onClick: () => console.log('Reconnect bank')
    }
  },
  {
    id: '5',
    type: 'success',
    title: 'Expense Approved',
    message: 'Your expense report for $150.00 has been approved',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    priority: 'low',
    category: 'expense'
  }
];

const getNotificationIcon = (type: string, category: string) => {
  if (category === 'invoice') return CurrencyDollarIcon;
  if (category === 'transaction') return DocumentTextIcon;
  if (category === 'user') return UserIcon;
  
  switch (type) {
    case 'success': return CheckCircleIcon;
    case 'warning': return ExclamationTriangleIcon;
    case 'error': return XCircleIcon;
    default: return InformationCircleIcon;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'border-red-500 bg-red-50';
    case 'high': return 'border-orange-500 bg-orange-50';
    case 'medium': return 'border-blue-500 bg-blue-50';
    case 'low': return 'border-gray-300 bg-gray-50';
    default: return 'border-gray-300 bg-gray-50';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    default: return 'text-blue-600';
  }
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
        {urgentCount > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 bg-red-500 rounded-full h-2 w-2"
          />
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-2 mb-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  <option value="system">System</option>
                  <option value="transaction">Transaction</option>
                  <option value="invoice">Invoice</option>
                  <option value="expense">Expense</option>
                  <option value="user">User</option>
                  <option value="security">Security</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <BellIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type, notification.category);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                          !notification.read ? 'bg-blue-50' : 'bg-white'
                        } hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 ${getTypeColor(notification.type)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                  notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {notification.priority}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                  {notification.category}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                    title="Mark as read"
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {notification.action && (
                                  <button
                                    onClick={notification.action.onClick}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    {notification.action.label}
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
                                  title="Delete"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{filteredNotifications.length} notifications</span>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
