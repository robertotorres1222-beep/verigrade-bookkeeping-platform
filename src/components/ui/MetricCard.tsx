'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Activity,
  Target,
  Award,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: number[];
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  subtitle,
  trend,
  color = 'blue',
  size = 'md',
  loading = false,
  className = ''
}: MetricCardProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        icon: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        icon: 'text-green-600'
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        icon: 'text-red-600'
      },
      yellow: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        icon: 'text-yellow-600'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        icon: 'text-purple-600'
      },
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        icon: 'text-indigo-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="w-4 h-4" />;
    if (changeType === 'negative') return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    return sizes[size];
  };

  const colorClasses = getColorClasses(color);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${getSizeClasses()} ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${getSizeClasses()} ${className}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <motion.div
          className="text-2xl font-bold text-gray-900"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </motion.div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Change Indicator */}
      {change !== undefined && (
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}

      {/* Trend Line */}
      {trend && trend.length > 0 && (
        <div className="mt-4">
          <div className="flex items-end space-x-1 h-8">
            {trend.map((value, index) => {
              const maxValue = Math.max(...trend);
              const height = (value / maxValue) * 100;
              return (
                <motion.div
                  key={index}
                  className={`w-1 rounded-full ${colorClasses.bg}`}
                  style={{ height: `${height}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Predefined metric card variants
export function RevenueCard({ value, change, trend }: { value: number; change?: number; trend?: number[] }) {
  return (
    <MetricCard
      title="Total Revenue"
      value={`$${value.toLocaleString()}`}
      change={change}
      changeType={change && change > 0 ? 'positive' : 'negative'}
      icon={<DollarSign className="w-5 h-5" />}
      color="green"
      trend={trend}
    />
  );
}

export function UsersCard({ value, change, trend }: { value: number; change?: number; trend?: number[] }) {
  return (
    <MetricCard
      title="Active Users"
      value={value.toLocaleString()}
      change={change}
      changeType={change && change > 0 ? 'positive' : 'negative'}
      icon={<Users className="w-5 h-5" />}
      color="blue"
      trend={trend}
    />
  );
}

export function ConversionCard({ value, change, trend }: { value: number; change?: number; trend?: number[] }) {
  return (
    <MetricCard
      title="Conversion Rate"
      value={`${value}%`}
      change={change}
      changeType={change && change > 0 ? 'positive' : 'negative'}
      icon={<Target className="w-5 h-5" />}
      color="purple"
      trend={trend}
    />
  );
}

export function PerformanceCard({ value, change, trend }: { value: number; change?: number; trend?: number[] }) {
  return (
    <MetricCard
      title="Performance Score"
      value={`${value}/100`}
      change={change}
      changeType={change && change > 0 ? 'positive' : 'negative'}
      icon={<Award className="w-5 h-5" />}
      color="yellow"
      trend={trend}
    />
  );
}

export function StatusCard({ 
  status, 
  title, 
  description 
}: { 
  status: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'green' as const,
          text: 'All systems operational'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'yellow' as const,
          text: 'Minor issues detected'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'red' as const,
          text: 'Critical issues detected'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'blue' as const,
          text: 'System information'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <MetricCard
      title={title}
      value={config.text}
      icon={config.icon}
      color={config.color}
      subtitle={description}
    />
  );
}

