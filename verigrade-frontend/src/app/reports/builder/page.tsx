'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import VisualQueryBuilder from '@/components/VisualQueryBuilder'
import { useAuth } from '@/contexts/AuthContext'
import {
  DocumentTextIcon,
  PlayIcon,
  SaveIcon,
  ShareIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface ReportBuilder {
  id?: string
  name: string
  description?: string
  fields: any[]
  filters: any[]
  groupBy: any[]
  orderBy: any[]
  isTemplate?: boolean
  isPublic?: boolean
}

export default function ReportBuilderPage() {
  const { user, token } = useAuth()
  const [reportBuilder, setReportBuilder] = useState<ReportBuilder>({
    name: '',
    description: '',
    fields: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    isTemplate: false,
    isPublic: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const handleQueryChange = (query: any) => {
    setReportBuilder(prev => ({
      ...prev,
      fields: query.fields,
      filters: query.filters,
      groupBy: query.groupBy,
      orderBy: query.orderBy
    }))
  }

  const handleSave = async () => {
    if (!reportBuilder.name.trim()) {
      setError('Report name is required')
      return
    }

    if (reportBuilder.fields.length === 0) {
      setError('At least one field is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/report-builders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportBuilder)
      })

      if (response.ok) {
        const savedReport = await response.json()
        setReportBuilder(prev => ({ ...prev, id: savedReport.data.id }))
        alert('Report saved successfully!')
      } else {
        setError('Failed to save report')
      }
    } catch (error) {
      setError('Error saving report')
    }

    setLoading(false)
  }

  const handlePreview = async () => {
    if (reportBuilder.fields.length === 0) {
      setError('At least one field is required for preview')
      return
    }

    setLoading(true)
    setError('')

    try {
      // For preview, we'll use mock data
      const mockData = [
        { id: 1, amount: 1000, description: 'Sample Transaction 1', date: '2024-01-01', category: 'Office Supplies' },
        { id: 2, amount: 2000, description: 'Sample Transaction 2', date: '2024-01-02', category: 'Travel' },
        { id: 3, amount: 1500, description: 'Sample Transaction 3', date: '2024-01-03', category: 'Marketing' },
        { id: 4, amount: 3000, description: 'Sample Transaction 4', date: '2024-01-04', category: 'Equipment' },
        { id: 5, amount: 800, description: 'Sample Transaction 5', date: '2024-01-05', category: 'Software' }
      ]

      setPreviewData(mockData)
      setShowPreview(true)
    } catch (error) {
      setError('Error generating preview')
    }

    setLoading(false)
  }

  const handleExecute = async () => {
    if (!reportBuilder.id) {
      setError('Please save the report first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/report-builders/${reportBuilder.id}/execute`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setPreviewData(result.data.results)
        setShowPreview(true)
      } else {
        setError('Failed to execute report')
      }
    } catch (error) {
      setError('Error executing report')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Builder</h1>
              <p className="mt-2 text-gray-600">Create custom reports with drag-and-drop query builder</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePreview}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                Preview
              </button>
              <button
                onClick={handleExecute}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Execute
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                <SaveIcon className="w-5 h-5 mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={reportBuilder.name}
                    onChange={(e) => setReportBuilder(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={reportBuilder.description || ''}
                    onChange={(e) => setReportBuilder(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report description"
                  />
                </div>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportBuilder.isTemplate}
                      onChange={(e) => setReportBuilder(prev => ({ ...prev, isTemplate: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Save as Template</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportBuilder.isPublic}
                      onChange={(e) => setReportBuilder(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Make Public</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fields:</span>
                  <span className="text-sm font-medium">{reportBuilder.fields.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Filters:</span>
                  <span className="text-sm font-medium">{reportBuilder.filters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Group By:</span>
                  <span className="text-sm font-medium">{reportBuilder.groupBy.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order By:</span>
                  <span className="text-sm font-medium">{reportBuilder.orderBy.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Query Builder */}
        <div className="mb-8">
          <VisualQueryBuilder
            onQueryChange={handleQueryChange}
            initialQuery={reportBuilder}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Report Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-auto max-h-[70vh]">
                {previewData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {reportBuilder.fields.map((field) => (
                            <th
                              key={field.id}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {field.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.map((row, index) => (
                          <tr key={index}>
                            {reportBuilder.fields.map((field) => (
                              <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {row[field.id] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No data available for preview</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

