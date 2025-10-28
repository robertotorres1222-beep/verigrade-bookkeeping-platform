'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid border-current',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        default: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-2',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'border-gray-300 border-t-blue-600',
        primary: 'border-blue-200 border-t-blue-600',
        secondary: 'border-gray-200 border-t-gray-600',
        success: 'border-green-200 border-t-green-600',
        warning: 'border-yellow-200 border-t-yellow-600',
        error: 'border-red-200 border-t-red-600',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div className="flex items-center justify-center">
        <div
          ref={ref}
          className={cn(spinnerVariants({ size, variant }), className)}
          role="status"
          aria-label={label || 'Loading'}
          {...props}
        >
          <span className="sr-only">{label || 'Loading'}</span>
        </div>
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };

