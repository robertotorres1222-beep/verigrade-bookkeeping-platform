'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AdvancedChartsProps {
  data?: ChartData[];
  type?: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'treemap' | 'funnel';
  title?: string;
  height?: number;
  showPredictions?: boolean;
  showHeatmap?: boolean;
  interactive?: boolean;
  onDataPointClick?: (data: any) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// Sample data generators
const generateTimeSeriesData = (days: number = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 10000) + 5000,
      expenses: Math.floor(Math.random() * 5000) + 2000,
      profit: Math.floor(Math.random() * 5000) + 3000,
      predicted: Math.floor(Math.random() * 10000) + 5000
    });
  }
  
  return data;
};

const generatePieData = () => [
  { name: 'Revenue', value: 4000, color: '#3B82F6' },
  { name: 'Expenses', value: 3000, color: '#EF4444' },
  { name: 'Profit', value: 1000, color: '#10B981' },
  { name: 'Taxes', value: 500, color: '#F59E0B' }
];

const generateTreemapData = () => [
  { name: 'Sales', size: 4000, color: '#3B82F6' },
  { name: 'Marketing', size: 2000, color: '#10B981' },
  { name: 'Operations', size: 1500, color: '#F59E0B' },
  { name: 'R&D', size: 1000, color: '#8B5CF6' },
  { name: 'Admin', size: 500, color: '#EF4444' }
];

const generateFunnelData = () => [
  { name: 'Leads', value: 1000, fill: '#3B82F6' },
  { name: 'Qualified', value: 800, fill: '#10B981' },
  { name: 'Proposals', value: 600, fill: '#F59E0B' },
  { name: 'Negotiations', value: 400, fill: '#8B5CF6' },
  { name: 'Closed', value: 200, fill: '#EF4444' }
];

export default function AdvancedCharts({
  data,
  type = 'line',
  title = 'Chart',
  height = 300,
  showPredictions = false,
  showHeatmap = false,
  interactive = true,
  onDataPointClick
}: AdvancedChartsProps) {
  const [chartData, setChartData] = useState<any[]>(data || generateTimeSeriesData());
  const [selectedData, setSelectedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState(type);

  useEffect(() => {
    if (!data) {
      setChartData(generateTimeSeriesData());
    }
  }, [data]);

  const handleDataPointClick = (data: any) => {
    setSelectedData(data);
    onDataPointClick?.(data);
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
          onClick={handleDataPointClick}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#EF4444" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
          onClick={handleDataPointClick}
        />
        {showPredictions && (
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stackId="1" 
          stroke="#3B82F6" 
          fill="#3B82F6"
          fillOpacity={0.6}
        />
        <Area 
          type="monotone" 
          dataKey="expenses" 
          stackId="1" 
          stroke="#EF4444" 
          fill="#EF4444"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData.slice(-7)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    const pieData = generatePieData();
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onClick={handleDataPointClick}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="revenue" name="Revenue" />
        <YAxis dataKey="expenses" name="Expenses" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Scatter 
          dataKey="profit" 
          fill="#3B82F6" 
          onClick={handleDataPointClick}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderTreemap = () => {
    const treemapData = generateTreemapData();
    return (
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={treemapData}
          dataKey="size"
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
        />
      </ResponsiveContainer>
    );
  };

  const renderFunnelChart = () => {
    const funnelData = generateFunnelData();
    return (
      <ResponsiveContainer width="100%" height={height}>
        <FunnelChart data={funnelData}>
          <Funnel
            dataKey="value"
            isAnimationActive
            labelLine={false}
          >
            <LabelList position="center" fill="#fff" stroke="none" />
          </Funnel>
          <Tooltip />
        </FunnelChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line': return renderLineChart();
      case 'area': return renderAreaChart();
      case 'bar': return renderBarChart();
      case 'pie': return renderPieChart();
      case 'scatter': return renderScatterChart();
      case 'treemap': return renderTreemap();
      case 'funnel': return renderFunnelChart();
      default: return renderLineChart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Interactive data visualization</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
            <option value="scatter">Scatter</option>
            <option value="treemap">Treemap</option>
            <option value="funnel">Funnel</option>
          </select>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderChart()}
        </motion.div>
      </div>

      {/* Selected Data Display */}
      {selectedData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <h4 className="font-semibold text-blue-900 mb-2">Selected Data Point</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(selectedData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key}:</span>
                <span className="font-medium text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chart Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={(e) => {/* Handle predictions toggle */}}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show Predictions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => {/* Handle heatmap toggle */}}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Heatmap</span>
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <EyeIcon className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowTrendingUpIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom content component for Treemap
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 60 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
    </g>
  );
};
