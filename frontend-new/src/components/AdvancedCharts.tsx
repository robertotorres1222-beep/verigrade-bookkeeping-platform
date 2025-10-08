'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

interface AdvancedChartsProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'radar'
  data: ChartData
  title?: string
  height?: number
  animated?: boolean
  showLegend?: boolean
  showTooltips?: boolean
}

export default function AdvancedCharts({
  type,
  data,
  title,
  height = 300,
  animated = true,
  showLegend = true,
  showTooltips = true
}: AdvancedChartsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Simulate chart rendering with canvas
  const renderChart = () => {
    const canvas = canvasRef.current
    if (!canvas || !isLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Chart dimensions
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    switch (type) {
      case 'line':
        renderLineChart(ctx, chartWidth, chartHeight, padding)
        break
      case 'bar':
        renderBarChart(ctx, chartWidth, chartHeight, padding)
        break
      case 'pie':
        renderPieChart(ctx, chartWidth, chartHeight, padding)
        break
      case 'area':
        renderAreaChart(ctx, chartWidth, chartHeight, padding)
        break
      default:
        renderLineChart(ctx, chartWidth, chartHeight, padding)
    }
  }

  const renderLineChart = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) => {
    const maxValue = Math.max(...data.datasets[0].data)
    const minValue = Math.min(...data.datasets[0].data)
    const range = maxValue - minValue || 1

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + width, y)
      ctx.stroke()
    }

    // Draw line
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.beginPath()

    data.datasets[0].data.forEach((value, index) => {
      const x = padding + (width / (data.labels.length - 1)) * index
      const y = padding + height - ((value - minValue) / range) * height
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    ctx.fillStyle = '#3b82f6'
    data.datasets[0].data.forEach((value, index) => {
      const x = padding + (width / (data.labels.length - 1)) * index
      const y = padding + height - ((value - minValue) / range) * height
      
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const renderBarChart = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) => {
    const maxValue = Math.max(...data.datasets[0].data)
    const barWidth = width / data.labels.length * 0.6
    const barSpacing = width / data.labels.length

    data.datasets[0].data.forEach((value, index) => {
      const barHeight = (value / maxValue) * height
      const x = padding + barSpacing * index + (barSpacing - barWidth) / 2
      const y = padding + height - barHeight

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
      gradient.addColorStop(0, '#3b82f6')
      gradient.addColorStop(1, '#1d4ed8')

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Bar border
      ctx.strokeStyle = '#1e40af'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)
    })
  }

  const renderPieChart = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) => {
    const centerX = width / 2 + padding
    const centerY = height / 2 + padding
    const radius = Math.min(width, height) / 2 - 20

    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0)
    let currentAngle = -Math.PI / 2

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

    data.datasets[0].data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      // Draw slice
      ctx.fillStyle = colors[index % colors.length]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      currentAngle += sliceAngle
    })
  }

  const renderAreaChart = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number) => {
    const maxValue = Math.max(...data.datasets[0].data)
    const minValue = Math.min(...data.datasets[0].data)
    const range = maxValue - minValue || 1

    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + height)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)')

    // Draw area
    ctx.fillStyle = gradient
    ctx.beginPath()

    data.datasets[0].data.forEach((value, index) => {
      const x = padding + (width / (data.labels.length - 1)) * index
      const y = padding + height - ((value - minValue) / range) * height
      
      if (index === 0) {
        ctx.moveTo(x, padding + height)
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(padding + width, padding + height)
    ctx.closePath()
    ctx.fill()

    // Draw line
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()

    data.datasets[0].data.forEach((value, index) => {
      const x = padding + (width / (data.labels.length - 1)) * index
      const y = padding + height - ((value - minValue) / range) * height
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  useEffect(() => {
    renderChart()
  }, [isLoaded, data, type])

  const getChartIcon = () => {
    switch (type) {
      case 'line':
      case 'area':
        return ArrowTrendingUpIcon
      case 'bar':
        return ChartBarIcon
      case 'pie':
      case 'doughnut':
        return CurrencyDollarIcon
      default:
        return ChartBarIcon
    }
  }

  const ChartIcon = getChartIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ChartIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {showTooltips && (
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <CalendarIcon className="w-4 h-4" />
              </button>
            )}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={height}
          className="w-full h-full"
          style={{ maxWidth: '100%', height: `${height}px` }}
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
          </div>
        )}
      </div>

      {showLegend && data.datasets[0] && (
        <div className="mt-4 flex flex-wrap items-center justify-center space-x-6">
          {data.labels.map((label, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: Array.isArray(data.datasets[0].backgroundColor)
                    ? data.datasets[0].backgroundColor[index]
                    : data.datasets[0].backgroundColor || '#3b82f6'
                }}
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Tooltips */}
      {showTooltips && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Hover over chart for details</span>
            <span className="text-gray-500">
              {data.labels.length} data points
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Chart Data Generator for Demo
export const generateChartData = (type: string): ChartData => {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  
  switch (type) {
    case 'revenue':
      return {
        labels,
        datasets: [{
          label: 'Revenue',
          data: [12000, 15000, 18000, 14000, 22000, 25000, 28000],
          backgroundColor: '#3b82f6',
          borderColor: '#1d4ed8',
          borderWidth: 2
        }]
      }
    
    case 'expenses':
      return {
        labels,
        datasets: [{
          label: 'Expenses',
          data: [8000, 9500, 11000, 9200, 12000, 13500, 15000],
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderWidth: 2
        }]
      }
    
    case 'profit':
      return {
        labels,
        datasets: [{
          label: 'Profit',
          data: [4000, 5500, 7000, 4800, 10000, 11500, 13000],
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 2
        }]
      }
    
    case 'categories':
      return {
        labels: ['Marketing', 'Operations', 'Development', 'Sales', 'Support'],
        datasets: [{
          label: 'Expense Categories',
          data: [25, 20, 30, 15, 10],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        }]
      }
    
    default:
      return {
        labels,
        datasets: [{
          label: 'Default',
          data: [100, 150, 200, 175, 250, 300, 350],
          backgroundColor: '#3b82f6'
        }]
      }
  }
}
