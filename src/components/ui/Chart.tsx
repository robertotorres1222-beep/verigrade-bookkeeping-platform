'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  DollarSign,
  Users,
  Calendar,
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
  trend?: number;
}

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  data: ChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

export default function Chart({
  type,
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  animated = true,
  className = ''
}: ChartProps) {
  const [hoveredItem, setHoveredItem] = useState<ChartData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawChart();
    }
  }, [data, type, height, isFullscreen]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, rect.width, height);

    // Set up chart area
    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i <= 5; i++) {
        const x = padding + (chartWidth / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(rect.width - padding, y);
        ctx.stroke();
      }
    }

    // Draw chart based on type
    switch (type) {
      case 'line':
        drawLineChart(ctx, data, padding, chartWidth, chartHeight, animated);
        break;
      case 'bar':
        drawBarChart(ctx, data, padding, chartWidth, chartHeight, animated);
        break;
      case 'pie':
        drawPieChart(ctx, data, rect.width / 2, height / 2, Math.min(rect.width, height) / 3, animated);
        break;
      case 'area':
        drawAreaChart(ctx, data, padding, chartWidth, chartHeight, animated);
        break;
      case 'radar':
        drawRadarChart(ctx, data, rect.width / 2, height / 2, Math.min(rect.width, height) / 3, animated);
        break;
    }
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, data: ChartData[], padding: number, width: number, height: number, animated: boolean) => {
    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    
    data.forEach((item, index) => {
      const x = padding + (width / (data.length - 1)) * index;
      const y = padding + height - ((item.value - minValue) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    data.forEach((item, index) => {
      const x = padding + (width / (data.length - 1)) * index;
      const y = padding + height - ((item.value - minValue) / range) * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, data: ChartData[], padding: number, width: number, height: number, animated: boolean) => {
    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;

    data.forEach((item, index) => {
      const x = padding + (width / data.length) * index + barSpacing / 2;
      const barHeight = (item.value / maxValue) * height;
      const y = padding + height - barHeight;

      ctx.fillStyle = item.color || '#3b82f6';
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  };

  const drawPieChart = (ctx: CanvasRenderingContext2D, data: ChartData[], centerX: number, centerY: number, radius: number, animated: boolean) => {
    if (data.length === 0) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`;
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
  };

  const drawAreaChart = (ctx: CanvasRenderingContext2D, data: ChartData[], padding: number, width: number, height: number, animated: boolean) => {
    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Draw area
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.beginPath();
    ctx.moveTo(padding, padding + height);
    
    data.forEach((item, index) => {
      const x = padding + (width / (data.length - 1)) * index;
      const y = padding + height - ((item.value - minValue) / range) * height;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(padding + width, padding + height);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((item, index) => {
      const x = padding + (width / (data.length - 1)) * index;
      const y = padding + height - ((item.value - minValue) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  };

  const drawRadarChart = (ctx: CanvasRenderingContext2D, data: ChartData[], centerX: number, centerY: number, radius: number, animated: boolean) => {
    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.value));
    const angleStep = (2 * Math.PI) / data.length;

    // Draw grid circles
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const r = (radius / 5) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw data line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const valueRadius = (item.value / maxValue) * radius;
      const x = centerX + Math.cos(angle) * valueRadius;
      const y = centerY + Math.sin(angle) * valueRadius;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.stroke();

    // Fill area
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line': return <LineChart className="w-5 h-5" />;
      case 'bar': return <BarChart3 className="w-5 h-5" />;
      case 'pie': return <PieChart className="w-5 h-5" />;
      case 'area': return <Activity className="w-5 h-5" />;
      case 'radar': return <TrendingUp className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const exportChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title || 'chart'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <motion.div
      ref={containerRef}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                {getChartIcon()}
                <span>{title}</span>
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportChart}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export chart"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full"
          onMouseMove={(e) => {
            if (showTooltip) {
              // Calculate which data point is being hovered
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                // Simple hover detection logic
                setHoveredItem(data[Math.floor((x / rect.width) * data.length)] || null);
              }
            }
          }}
          onMouseLeave={() => setHoveredItem(null)}
        />
        
        {/* Tooltip */}
        {hoveredItem && showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-10"
            style={{
              left: '50%',
              top: '20px',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-medium">{hoveredItem.label}</div>
            <div className="text-gray-300">
              {hoveredItem.value.toLocaleString()}
              {hoveredItem.trend && (
                <span className={`ml-2 ${hoveredItem.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {hoveredItem.trend > 0 ? '+' : ''}{hoveredItem.trend}%
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      {showLegend && data.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)` }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
                {item.trend && (
                  <span className={`text-xs ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend > 0 ? '+' : ''}{item.trend}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

