'use client'

import React, { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'

interface QueryField {
  id: string
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  source: string
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
}

interface QueryFilter {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in'
  value: any
  value2?: any
}

interface QueryGroupBy {
  id: string
  field: string
  order: 'asc' | 'desc'
}

interface VisualQueryBuilderProps {
  onQueryChange: (query: any) => void
  initialQuery?: any
}

const availableFields: QueryField[] = [
  { id: 'amount', name: 'Amount', type: 'number', source: 'transactions.amount' },
  { id: 'description', name: 'Description', type: 'string', source: 'transactions.description' },
  { id: 'date', name: 'Date', type: 'date', source: 'transactions.date' },
  { id: 'category', name: 'Category', type: 'string', source: 'transactions.category' },
  { id: 'vendor', name: 'Vendor', type: 'string', source: 'transactions.vendor' },
  { id: 'status', name: 'Status', type: 'string', source: 'transactions.status' },
  { id: 'customer_name', name: 'Customer Name', type: 'string', source: 'customers.name' },
  { id: 'invoice_number', name: 'Invoice Number', type: 'string', source: 'invoices.invoiceNumber' },
  { id: 'due_date', name: 'Due Date', type: 'date', source: 'invoices.dueDate' },
  { id: 'total', name: 'Total', type: 'number', source: 'invoices.total' }
]

const operatorOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' }
]

export default function VisualQueryBuilder({ onQueryChange, initialQuery }: VisualQueryBuilderProps) {
  const [selectedFields, setSelectedFields] = useState<QueryField[]>(initialQuery?.fields || [])
  const [filters, setFilters] = useState<QueryFilter[]>(initialQuery?.filters || [])
  const [groupBy, setGroupBy] = useState<QueryGroupBy[]>(initialQuery?.groupBy || [])
  const [orderBy, setOrderBy] = useState<QueryGroupBy[]>(initialQuery?.orderBy || [])
  const [showFieldSelector, setShowFieldSelector] = useState(false)

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId, type } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === 'FIELD') {
      const field = availableFields.find(f => f.id === draggableId)
      if (field && !selectedFields.find(f => f.id === field.id)) {
        setSelectedFields(prev => [...prev, field])
      }
    }
  }, [selectedFields])

  const removeField = (fieldId: string) => {
    setSelectedFields(prev => prev.filter(f => f.id !== fieldId))
  }

  const addFilter = () => {
    const newFilter: QueryFilter = {
      id: `filter_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: ''
    }
    setFilters(prev => [...prev, newFilter])
  }

  const updateFilter = (filterId: string, updates: Partial<QueryFilter>) => {
    setFilters(prev => prev.map(f => f.id === filterId ? { ...f, ...updates } : f))
  }

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId))
  }

  const addGroupBy = () => {
    const newGroupBy: QueryGroupBy = {
      id: `group_${Date.now()}`,
      field: '',
      order: 'asc'
    }
    setGroupBy(prev => [...prev, newGroupBy])
  }

  const updateGroupBy = (groupId: string, updates: Partial<QueryGroupBy>) => {
    setGroupBy(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g))
  }

  const removeGroupBy = (groupId: string) => {
    setGroupBy(prev => prev.filter(g => g.id !== groupId))
  }

  const addOrderBy = () => {
    const newOrderBy: QueryGroupBy = {
      id: `order_${Date.now()}`,
      field: '',
      order: 'asc'
    }
    setOrderBy(prev => [...prev, newOrderBy])
  }

  const updateOrderBy = (orderId: string, updates: Partial<QueryGroupBy>) => {
    setOrderBy(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o))
  }

  const removeOrderBy = (orderId: string) => {
    setOrderBy(prev => prev.filter(o => o.id !== orderId))
  }

  const generateQuery = () => {
    const query = {
      fields: selectedFields,
      filters: filters.filter(f => f.field && f.value),
      groupBy: groupBy.filter(g => g.field),
      orderBy: orderBy.filter(o => o.field)
    }
    onQueryChange(query)
  }

  React.useEffect(() => {
    generateQuery()
  }, [selectedFields, filters, groupBy, orderBy])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Query Builder</h3>
        <p className="text-sm text-gray-600">Drag and drop fields to build your custom report query</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Fields */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Available Fields</h4>
            <Droppable droppableId="available-fields" type="FIELD">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 min-h-[200px] p-3 border-2 border-dashed border-gray-300 rounded-lg"
                >
                  {availableFields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">{field.name}</span>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {field.type}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Selected Fields */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Selected Fields</h4>
            <Droppable droppableId="selected-fields" type="FIELD">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 min-h-[200px] p-3 border-2 border-dashed border-green-300 rounded-lg bg-green-50"
                >
                  {selectedFields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-3 bg-white border border-green-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{field.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                        </div>
                        <button
                          onClick={() => removeField(field.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900">Filters</h4>
            <button
              onClick={addFilter}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Add Filter
            </button>
          </div>
          <div className="space-y-3">
            {filters.map((filter) => (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Field</option>
                    {availableFields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {operatorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    placeholder="Value"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Group By */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900">Group By</h4>
            <button
              onClick={addGroupBy}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Add Group By
            </button>
          </div>
          <div className="space-y-3">
            {groupBy.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={group.field}
                    onChange={(e) => updateGroupBy(group.id, { field: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Field</option>
                    {availableFields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={group.order}
                    onChange={(e) => updateGroupBy(group.id, { order: e.target.value as 'asc' | 'desc' })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  
                  <button
                    onClick={() => removeGroupBy(group.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order By */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900">Order By</h4>
            <button
              onClick={addOrderBy}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
            >
              Add Order By
            </button>
          </div>
          <div className="space-y-3">
            {orderBy.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={order.field}
                    onChange={(e) => updateOrderBy(order.id, { field: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Field</option>
                    {availableFields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={order.order}
                    onChange={(e) => updateOrderBy(order.id, { order: e.target.value as 'asc' | 'desc' })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  
                  <button
                    onClick={() => removeOrderBy(order.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}

