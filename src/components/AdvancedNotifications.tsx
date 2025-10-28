'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actions?: {
    label: string
    action: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
  autoClose?: boolean
  duration?: number
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClearNotification: (id: string) => void
  onClearAll: () => void
  maxNotifications?: number
}

export default function AdvancedNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  onClearAll,
  maxNotifications = 50
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set())

  const filteredNotifications = notifications
    .filter(notification => {
      switch (filter) {
        case 'unread':
          return !notification.read
        case 'high':
          return notification.priority === 'high'
        default:
          return true
      }
    })
    .slice(0, maxNotifications)

  const unreadCount = notifications.filter(n => !n.read).length
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircleIcon
      case 'warning':
        return ExclamationTriangleIcon
      case 'error':
        return ExclamationTriangleIcon
      case 'info':
        return InformationCircleIcon
      default:
        return BellIcon
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const toggleDetails = (id: string) => {
    setShowDetails(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

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
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
        {highPriorityCount > 0 && unreadCount === 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
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
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {unreadCount} unread
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2 mt-3">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'high', label: 'High Priority' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filter === filterOption.key
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Mark all as read
                </button>
                <button
                  onClick={onClearAll}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type)
                    const isExpanded = showDetails.has(notification.id)

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Priority Indicator */}
                          <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`} />

                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimestamp(notification.timestamp)}
                                </p>

                                {/* Actions */}
                                {notification.actions && notification.actions.length > 0 && (
                                  <div className="flex items-center space-x-2 mt-3">
                                    {notification.actions.map((action, actionIndex) => (
                                      <button
                                        key={actionIndex}
                                        onClick={action.action}
                                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                          action.variant === 'primary'
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : action.variant === 'danger'
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                      >
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => toggleDetails(notification.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                >
                                  {isExpanded ? (
                                    <EyeSlashIcon className="w-4 h-4" />
                                  ) : (
                                    <EyeIcon className="w-4 h-4" />
                                  )}
                                </button>
                                {!notification.read && (
                                  <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => onClearNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 pt-3 border-t border-gray-200"
                                >
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <div>Type: {notification.type}</div>
                                    <div>Priority: {notification.priority}</div>
                                    <div>ID: {notification.id}</div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{notifications.length} total notifications</span>
                <button className="text-indigo-600 hover:text-indigo-700">
                  View all
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto-remove if specified
    if (notification.autoClose) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
      }, notification.duration || 5000)
    }

    return newNotification.id
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const clearRead = () => {
    setNotifications(prev => prev.filter(n => !n.read))
  }

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    clearRead
  }
}

// Demo notifications generator
export const generateDemoNotifications = (): Notification[] => {
  return [
    {
      id: '1',
      type: 'success',
      title: 'Payment Received',
      message: 'Your invoice #INV-2024-001 has been paid successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      priority: 'medium',
      actions: [
        { label: 'View Invoice', action: () => console.log('View invoice') }
      ]
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Balance Alert',
      message: 'Your business account balance is below $1,000.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      priority: 'high',
      actions: [
        { label: 'Add Funds', action: () => console.log('Add funds') },
        { label: 'View Account', action: () => console.log('View account') }
      ]
    },
    {
      id: '3',
      type: 'info',
      title: 'Monthly Report Ready',
      message: 'Your January 2024 financial report is now available.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      priority: 'low',
      actions: [
        { label: 'Download', action: () => console.log('Download report') }
      ]
    },
    {
      id: '4',
      type: 'error',
      title: 'Sync Failed',
      message: 'Failed to sync with bank account. Please check your credentials.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: false,
      priority: 'high',
      actions: [
        { label: 'Retry Sync', action: () => console.log('Retry sync') },
        { label: 'Update Credentials', action: () => console.log('Update credentials') }
      ]
    }
  ]
}












