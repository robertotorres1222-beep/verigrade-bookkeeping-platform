'use client'

import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useDashboardData } from '@/hooks/useDashboardData'

// Lazy load heavy components
const AnalyticsChart = lazy(() => import('./AnalyticsChart'))
const ReportsViewer = lazy(() => import('./ReportsViewer'))
const MCPIntegration = lazy(() => import('./MCPIntegration'))

export default function PerformanceOptimizedDashboard() {
  const { data: dashboardData, isLoading, error } = useDashboardData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        <p className="text-red-600">Failed to load dashboard data</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Dashboard content with smooth animations */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded" />}>
        <AnalyticsChart data={dashboardData} />
      </Suspense>
      
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded" />}>
        <ReportsViewer data={dashboardData} />
      </Suspense>
      
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-24 rounded" />}>
        <MCPIntegration />
      </Suspense>
    </motion.div>
  )
}





