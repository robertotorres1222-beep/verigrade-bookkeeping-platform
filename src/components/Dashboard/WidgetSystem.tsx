'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  Cog6ToothIcon, 
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface Widget {
  id: string;
  type: string;
  title: string;
  icon: React.ComponentType<any>;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data?: any;
  config?: any;
}

interface WidgetSystemProps {
  initialWidgets?: Widget[];
  onLayoutChange?: (widgets: Widget[]) => void;
  onWidgetAdd?: (widget: Widget) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetConfigure?: (widgetId: string, config: any) => void;
}

const defaultWidgets: Widget[] = [
  {
    id: 'revenue-chart',
    type: 'chart',
    title: 'Revenue Overview',
    icon: ChartBarIcon,
    size: 'large',
    position: { x: 0, y: 0 },
    data: { type: 'line', data: [] }
  },
  {
    id: 'total-revenue',
    type: 'metric',
    title: 'Total Revenue',
    icon: CurrencyDollarIcon,
    size: 'small',
    position: { x: 0, y: 1 },
    data: { value: '$0', change: '+0%' }
  },
  {
    id: 'recent-transactions',
    type: 'list',
    title: 'Recent Transactions',
    icon: DocumentTextIcon,
    size: 'medium',
    position: { x: 1, y: 0 },
    data: { items: [] }
  },
  {
    id: 'active-customers',
    type: 'metric',
    title: 'Active Customers',
    icon: UserGroupIcon,
    size: 'small',
    position: { x: 1, y: 1 },
    data: { value: '0', change: '+0%' }
  }
];

const availableWidgets = [
  {
    type: 'chart',
    title: 'Chart Widget',
    icon: ChartBarIcon,
    description: 'Display data in various chart formats'
  },
  {
    type: 'metric',
    title: 'Metric Widget',
    icon: CurrencyDollarIcon,
    description: 'Show key performance indicators'
  },
  {
    type: 'list',
    title: 'List Widget',
    icon: DocumentTextIcon,
    description: 'Display lists of data'
  },
  {
    type: 'clock',
    title: 'Clock Widget',
    icon: ClockIcon,
    description: 'Show current time and date'
  }
];

export default function WidgetSystem({ 
  initialWidgets = defaultWidgets,
  onLayoutChange,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetConfigure 
}: WidgetSystemProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);

  const gridCols = 12;
  const gridRows = 8;

  const getWidgetSize = (size: string) => {
    switch (size) {
      case 'small': return { width: 3, height: 2 };
      case 'medium': return { width: 6, height: 4 };
      case 'large': return { width: 9, height: 6 };
      default: return { width: 6, height: 4 };
    }
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragEnd = (widgetId: string, newPosition: { x: number; y: number }) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, position: newPosition }
        : widget
    ));
    setDraggedWidget(null);
    onLayoutChange?.(widgets);
  };

  const handleAddWidget = (widgetType: string) => {
    const newWidget: Widget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: `${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)} Widget`,
      icon: ChartBarIcon,
      size: 'medium',
      position: { x: 0, y: 0 },
      data: {}
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setShowAddWidget(false);
    onWidgetAdd?.(newWidget);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    onWidgetRemove?.(widgetId);
  };

  const handleConfigureWidget = (widgetId: string, config: any) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, config: { ...widget.config, ...config } }
        : widget
    ));
    setEditingWidget(null);
    onWidgetConfigure?.(widgetId, config);
  };

  const renderWidget = (widget: Widget) => {
    const { width, height } = getWidgetSize(widget.size);
    
    return (
      <motion.div
        key={widget.id}
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow`}
        style={{
          gridColumn: `${widget.position.x + 1} / span ${width}`,
          gridRow: `${widget.position.y + 1} / span ${height}`
        }}
        drag
        dragMomentum={false}
        onDragStart={() => handleDragStart(widget.id)}
        onDragEnd={(_, info) => {
          const newX = Math.max(0, Math.min(gridCols - width, Math.round(info.point.x / 100)));
          const newY = Math.max(0, Math.min(gridRows - height, Math.round(info.point.y / 100)));
          handleDragEnd(widget.id, { x: newX, y: newY });
        }}
        whileDrag={{ scale: 1.05, zIndex: 1000 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <widget.icon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{widget.title}</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setEditingWidget(widget.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Cog6ToothIcon className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => handleRemoveWidget(widget.id)}
              className="p-1 hover:bg-red-100 rounded text-red-500"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-full">
          {widget.type === 'chart' && (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chart Widget</p>
              </div>
            </div>
          )}
          
          {widget.type === 'metric' && (
            <div className="h-full flex flex-col justify-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {widget.data?.value || '$0'}
              </div>
              <div className="flex items-center text-sm">
                {widget.data?.change?.startsWith('+') ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={widget.data?.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {widget.data?.change || '+0%'}
                </span>
              </div>
            </div>
          )}
          
          {widget.type === 'list' && (
            <div className="h-full">
              <div className="space-y-2">
                {widget.data?.items?.length > 0 ? (
                  widget.data.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-sm">
                    No data available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Customize your dashboard with widgets</p>
        </div>
        <button
          onClick={() => setShowAddWidget(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Widget</span>
        </button>
      </div>

      {/* Widget Grid */}
      <div 
        className="grid gap-4 h-full"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          minHeight: '600px'
        }}
      >
        <AnimatePresence>
          {widgets.map(renderWidget)}
        </AnimatePresence>
      </div>

      {/* Add Widget Modal */}
      <AnimatePresence>
        {showAddWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowAddWidget(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Widget</h3>
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {availableWidgets.map((widget) => (
                  <motion.button
                    key={widget.type}
                    onClick={() => handleAddWidget(widget.type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <widget.icon className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{widget.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{widget.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Configuration Modal */}
      <AnimatePresence>
        {editingWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setEditingWidget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Configure Widget</h3>
                <button
                  onClick={() => setEditingWidget(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Widget Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter widget title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Widget Size
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingWidget(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfigureWidget(editingWidget, {})}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
