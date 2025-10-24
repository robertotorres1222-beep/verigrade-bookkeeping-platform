'use client'

import { motion } from 'framer-motion'

interface AnalyticsChartProps {
  data?: any
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Chart</h3>
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Chart visualization will be implemented here</p>
      </div>
    </motion.div>
  )
}












