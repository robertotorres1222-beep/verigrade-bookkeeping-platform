'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'gradient' | 'glass' | 'filled';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  description?: string;
}

const colorVariants = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-600',
    iconBg: 'bg-primary-500',
    border: 'border-primary-200',
    gradient: 'from-primary-500 to-primary-600',
  },
  success: {
    bg: 'bg-success-50',
    text: 'text-success-600',
    iconBg: 'bg-success-500',
    border: 'border-success-200',
    gradient: 'from-success-500 to-success-600',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    iconBg: 'bg-warning-500',
    border: 'border-warning-200',
    gradient: 'from-warning-500 to-warning-600',
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-600',
    iconBg: 'bg-error-500',
    border: 'border-error-200',
    gradient: 'from-error-500 to-error-600',
  },
  secondary: {
    bg: 'bg-secondary-50',
    text: 'text-secondary-600',
    iconBg: 'bg-secondary-500',
    border: 'border-secondary-200',
    gradient: 'from-secondary-500 to-secondary-600',
  },
};

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  variant = 'default',
  color = 'primary',
  size = 'md',
  loading = false,
  description,
  className,
  ...props
}: StatCardProps) {
  const colors = colorVariants[color];
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: cn('bg-white border border-neutral-200 shadow-card', colors.border),
    gradient: cn('bg-gradient-to-br text-white border-0 shadow-lg', `from-${color}-500 to-${color}-600`),
    glass: 'backdrop-blur-md bg-white/80 border border-white/20 shadow-glass',
    filled: cn('border border-neutral-200 shadow-sm', colors.bg),
  };

  if (loading) {
    return (
      <div className={cn('rounded-xl animate-pulse', sizeClasses[size], className)}>
        <div className="space-y-3">
          <div className="h-4 bg-neutral-200 rounded w-24" />
          <div className="h-8 bg-neutral-200 rounded w-32" />
          <div className="h-3 bg-neutral-200 rounded w-20" />
        </div>
      </div>
    );
  }

  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  const changeValue = change !== undefined ? Math.abs(change) : null;
  const changeTrend = trend || (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={cn(
          'text-sm font-medium',
          variant === 'gradient' ? 'text-white/90' : 'text-neutral-600'
        )}>
          {title}
        </h3>
        {icon && (
          <div className={cn(
            'p-2.5 rounded-lg',
            variant === 'gradient' 
              ? 'bg-white/20 text-white' 
              : `${colors.iconBg} ${colors.text.replace('text-', 'text-white')}`
          )}>
            {icon}
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className={cn(
          'text-3xl font-bold mb-1',
          variant === 'gradient' ? 'text-white' : 'text-neutral-900'
        )}>
          {displayValue}
        </div>
        {description && (
          <p className={cn(
            'text-sm',
            variant === 'gradient' ? 'text-white/80' : 'text-neutral-500'
          )}>
            {description}
          </p>
        )}
      </div>

      {changeValue !== null && changeTrend !== 'neutral' && (
        <div className="flex items-center gap-1.5">
          {changeTrend === 'up' ? (
            <TrendingUp className={cn('w-4 h-4', variant === 'gradient' ? 'text-white' : colors.text)} />
          ) : (
            <TrendingDown className={cn('w-4 h-4', variant === 'gradient' ? 'text-white' : colors.text)} />
          )}
          <span className={cn(
            'text-sm font-semibold',
            variant === 'gradient' ? 'text-white' : colors.text
          )}>
            {changeTrend === 'up' ? '+' : '-'}{changeValue}%
          </span>
          {changeLabel && (
            <span className={cn(
              'text-xs',
              variant === 'gradient' ? 'text-white/70' : 'text-neutral-500'
            )}>
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

