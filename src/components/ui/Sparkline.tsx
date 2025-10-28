'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SparklineData {
  value: number;
  timestamp?: Date;
  label?: string;
}

interface SparklineProps {
  data: SparklineData[];
  type?: 'line' | 'bar' | 'area';
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showTrend?: boolean;
  animated?: boolean;
  className?: string;
}

export default function Sparkline({
  data,
  type = 'line',
  width = 120,
  height = 30,
  color = '#3b82f6',
  showDots = false,
  showTrend = true,
  animated = true,
  className = ''
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: SparklineData } | null>(null);

  useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      drawSparkline();
    }
  }, [data, type, width, height, color, showDots, animated]);

  const drawSparkline = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const padding = 2;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Calculate points
    const points = data.map((item, index) => ({
      x: padding + (chartWidth / (data.length - 1)) * index,
      y: padding + chartHeight - ((item.value - minValue) / range) * chartHeight,
      data: item
    }));

    // Draw based on type
    switch (type) {
      case 'line':
        drawLineSparkline(ctx, points, color, showDots, animated);
        break;
      case 'bar':
        drawBarSparkline(ctx, points, color, chartWidth, chartHeight, padding, animated);
        break;
      case 'area':
        drawAreaSparkline(ctx, points, color, chartHeight, padding, animated);
        break;
    }
  };

  const drawLineSparkline = (
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number; data: SparklineData }>,
    color: string,
    showDots: boolean,
    animated: boolean
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // Draw dots
    if (showDots) {
      ctx.fillStyle = color;
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  const drawBarSparkline = (
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number; data: SparklineData }>,
    color: string,
    chartWidth: number,
    chartHeight: number,
    padding: number,
    animated: boolean
  ) => {
    const barWidth = chartWidth / points.length * 0.8;
    const barSpacing = chartWidth / points.length * 0.2;

    points.forEach((point, index) => {
      const x = padding + (chartWidth / points.length) * index + barSpacing / 2;
      const barHeight = point.y - padding;
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  };

  const drawAreaSparkline = (
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number; data: SparklineData }>,
    color: string,
    chartHeight: number,
    padding: number,
    animated: boolean
  ) => {
    // Draw area
    ctx.fillStyle = `${color}20`;
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding + chartHeight);
    
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    
    ctx.lineTo(points[points.length - 1].x, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };

  const getTrend = () => {
    if (data.length < 2) return 0;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    return ((last - first) / first) * 100;
  };

  const getTrendIcon = () => {
    const trend = getTrend();
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  const getTrendColor = () => {
    const trend = getTrend();
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest point
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const padding = 2;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    let closestPoint = null;
    let minDistance = Infinity;

    data.forEach((item, index) => {
      const pointX = padding + (chartWidth / (data.length - 1)) * index;
      const pointY = padding + chartHeight - ((item.value - minValue) / range) * chartHeight;
      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = { x: pointX, y: pointY, data: item };
      }
    });

    setHoveredPoint(closestPoint);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredPoint(null);
        }}
        className="cursor-pointer"
      />
      
      {/* Trend Indicator */}
      {showTrend && data.length > 1 && (
        <div className={`absolute -top-1 -right-1 text-xs font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
        </div>
      )}

      {/* Tooltip */}
      {isHovered && hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bg-gray-900 text-white text-xs rounded-lg px-2 py-1 shadow-lg z-10 pointer-events-none"
          style={{
            left: hoveredPoint.x,
            top: hoveredPoint.y - 30,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-medium">{hoveredPoint.data.value.toLocaleString()}</div>
          {hoveredPoint.data.label && (
            <div className="text-gray-300">{hoveredPoint.data.label}</div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Predefined sparkline variants
export function RevenueSparkline({ data, className }: { data: SparklineData[]; className?: string }) {
  return (
    <Sparkline
      data={data}
      type="area"
      color="#10b981"
      showDots={true}
      showTrend={true}
      className={className}
    />
  );
}

export function UsersSparkline({ data, className }: { data: SparklineData[]; className?: string }) {
  return (
    <Sparkline
      data={data}
      type="line"
      color="#3b82f6"
      showDots={false}
      showTrend={true}
      className={className}
    />
  );
}

export function PerformanceSparkline({ data, className }: { data: SparklineData[]; className?: string }) {
  return (
    <Sparkline
      data={data}
      type="bar"
      color="#8b5cf6"
      showDots={false}
      showTrend={true}
      className={className}
    />
  );
}

// Sparkline with value display
export function SparklineWithValue({ 
  data, 
  value, 
  label, 
  trend, 
  className 
}: { 
  data: SparklineData[];
  value: string | number;
  label?: string;
  trend?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1">
        <div className="text-lg font-semibold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {label && (
          <div className="text-sm text-gray-500">{label}</div>
        )}
        {trend !== undefined && (
          <div className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="w-20">
        <Sparkline
          data={data}
          type="line"
          color={trend && trend > 0 ? '#10b981' : trend && trend < 0 ? '#ef4444' : '#6b7280'}
          showTrend={false}
        />
      </div>
    </div>
  );
}

