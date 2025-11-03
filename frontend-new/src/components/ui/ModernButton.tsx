'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const modernButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        destructive: 'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        outline: 'border-2 border-neutral-300 bg-white text-neutral-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 shadow-sm',
        ghost: 'text-neutral-700 hover:bg-neutral-100',
        link: 'text-primary-600 underline-offset-4 hover:underline p-0',
        gradient: 'bg-gradient-modern text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        success: 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        glass: 'backdrop-blur-md bg-white/20 text-white border border-white/30 hover:bg-white/30',
        subtle: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
      },
      size: {
        default: 'h-11 px-6 py-2.5 text-sm',
        sm: 'h-9 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ModernButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant, size, fullWidth, loading, icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    const iconElement = icon && !loading && (
      <span className={cn(
        iconPosition === 'left' ? 'mr-2' : 'ml-2',
        'flex-shrink-0'
      )}>
        {icon}
      </span>
    );

    return (
      <button
        className={cn(modernButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shine effect on hover */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-white/20" />
        
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {iconPosition === 'left' && iconElement}
        <span className="relative z-10">{children}</span>
        {iconPosition === 'right' && iconElement}
      </button>
    );
  }
);
ModernButton.displayName = 'ModernButton';

export { ModernButton, modernButtonVariants };

