'use client'

import { motion } from 'framer-motion'

interface ReportsViewerProps {
  data?: any
}

export default function ReportsViewer({ data }: ReportsViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">Reports Viewer</h3>
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Reports viewer will be implemented here</p>
      </div>
    </motion.div>
  )
}


