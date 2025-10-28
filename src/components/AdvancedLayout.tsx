'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  UserGroupIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  showSidebar?: boolean
  showHeader?: boolean
  showFooter?: boolean
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
  badge?: string | number
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    href: '/dashboard'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ChartBarIcon,
    href: '/analytics',
    badge: 'New'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: DocumentTextIcon,
    href: '/documents',
    children: [
      { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon, href: '/documents/invoices' },
      { id: 'receipts', label: 'Receipts', icon: DocumentTextIcon, href: '/documents/receipts' },
      { id: 'reports', label: 'Reports', icon: DocumentTextIcon, href: '/documents/reports' }
    ]
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: UserGroupIcon,
    href: '/customers'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: CogIcon,
    href: '/settings'
  }
]

export default function AdvancedLayout({
  children,
  title,
  showSidebar = true,
  showHeader = true,
  showFooter = true
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else if (newTheme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: level * 0.1 }}
        >
          <a
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
              level > 0 ? 'ml-6' : ''
            } ${
              typeof window !== 'undefined' && window.location.pathname === item.href
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault()
                toggleExpanded(item.id)
              }
            }}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </motion.div>
              )}
            </div>
          </a>
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-1"
            >
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {showSidebar && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl lg:translate-x-0 lg:static lg:inset-0"
        >
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">VeriGrade</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigationItems.map(item => renderNavigationItem(item))}
            </nav>

            {/* Sidebar footer */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">JD</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
                </div>
              </div>
              <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className={`${showSidebar ? 'lg:pl-64' : ''}`}>
        {/* Header */}
        {showHeader && (
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  {showSidebar && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Bars3Icon className="w-5 h-5" />
                    </button>
                  )}
                  
                  {title && (
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative hidden md:block">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Notifications */}
                  <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Theme selector */}
                  <div className="relative">
                    <select
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value as any)}
                      className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="light">
                        <SunIcon className="w-4 h-4 inline mr-2" />
                        Light
                      </option>
                      <option value="dark">
                        <MoonIcon className="w-4 h-4 inline mr-2" />
                        Dark
                      </option>
                      <option value="system">
                        <ComputerDesktopIcon className="w-4 h-4 inline mr-2" />
                        System
                      </option>
                    </select>
                  </div>

                  {/* Add button */}
                  <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Add New</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main content area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  © 2024 VeriGrade. All rights reserved.
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</a>
                  <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
                  <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Support</a>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
