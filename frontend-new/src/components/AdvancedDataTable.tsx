'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'

interface Column {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface AdvancedDataTableProps {
  data: any[]
  columns: Column[]
  title?: string
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  selectable?: boolean
  actions?: {
    view?: (row: any) => void
    edit?: (row: any) => void
    delete?: (row: any) => void
  }
}

export default function AdvancedDataTable({
  data,
  columns,
  title = "Data Table",
  searchable = true,
  filterable = true,
  exportable = true,
  selectable = true,
  actions = {}
}: AdvancedDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Advanced filtering and sorting
  const filteredAndSortedData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(column =>
          String(row[column.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, sortConfig, filters, columns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => String(index))))
    }
  }

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    const indexStr = String(index)
    
    if (newSelected.has(indexStr)) {
      newSelected.delete(indexStr)
    } else {
      newSelected.add(indexStr)
    }
    
    setSelectedRows(newSelected)
  }

  const handleExport = (format: 'csv' | 'json') => {
    const exportData = selectedRows.size > 0 
      ? paginatedData.filter((_, index) => selectedRows.has(String(index)))
      : paginatedData

    if (format === 'csv') {
      const csvContent = [
        columns.map(col => col.label).join(','),
        ...exportData.map(row => 
          columns.map(col => `"${row[col.key]}"`).join(',')
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const jsonContent = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyle = (status: string) => {
      switch (status.toLowerCase()) {
        case 'active':
        case 'completed':
        case 'success':
          return 'bg-green-100 text-green-800'
        case 'pending':
        case 'processing':
          return 'bg-yellow-100 text-yellow-800'
        case 'inactive':
        case 'failed':
        case 'error':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
        {status}
      </span>
    )
  }

  const CurrencyCell = ({ value }: { value: number }) => (
    <span className={`font-mono ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {value >= 0 ? '+' : ''}${Math.abs(value).toLocaleString()}
    </span>
  )

  const DateCell = ({ value }: { value: string }) => (
    <span className="text-gray-600">
      {new Date(value).toLocaleDateString()}
    </span>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            {exportable && (
              <div className="relative">
                <button className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <DocumentArrowDownIcon className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export JSON
                  </button>
                </div>
              </div>
            )}
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          {searchable && (
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
          
          {filterable && (
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <ChevronUpDownIcon className="w-4 h-4" />
                    )}
                    {sortConfig?.key === column.key && (
                      <span className="text-indigo-600">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {Object.keys(actions).length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedRows.has(String(index)) ? 'bg-indigo-50' : ''
                }`}
              >
                {selectable && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(String(index))}
                      onChange={() => handleSelectRow(index)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      <span className="text-sm text-gray-900">{row[column.key]}</span>
                    )}
                  </td>
                ))}
                {Object.keys(actions).length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {actions.view && (
                        <button
                          onClick={() => actions.view!(row)}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      )}
                      {actions.edit && (
                        <button
                          onClick={() => actions.edit!(row)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      {actions.delete && (
                        <button
                          onClick={() => actions.delete!(row)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedData.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export components for reuse
export { AdvancedDataTable }
export type { Column, AdvancedDataTableProps }
