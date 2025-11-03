'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const enhancedCardVariants = cva(
  'rounded-xl border bg-white transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 shadow-card hover:shadow-card-hover hover:border-neutral-300',
        elevated: 'border-neutral-200 shadow-lg hover:shadow-xl hover:-translate-y-1',
        glass: 'backdrop-blur-md bg-white/80 border-white/20 shadow-glass',
        gradient: 'border-transparent bg-gradient-to-br from-white to-neutral-50 hover:from-neutral-50 hover:to-neutral-100',
        interactive: 'border-neutral-200 shadow-card hover:shadow-card-hover hover:border-primary-300 cursor-pointer hover:-translate-y-1',
        filled: 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 shadow-sm',
        outlined: 'border-2 border-neutral-300 hover:border-primary-500 bg-transparent shadow-none hover:shadow-md',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        true: 'hover:-translate-y-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      hover: true,
    },
  }
);

export interface EnhancedCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  asChild?: boolean;
  glow?: boolean;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, padding, hover, glow, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          enhancedCardVariants({ variant, padding, hover, className }),
          glow && 'relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-primary before:opacity-0 before:blur-xl before:transition-opacity before:duration-300 hover:before:opacity-20',
          glow && 'after:absolute after:inset-[1px] after:rounded-xl after:bg-white'
        )}
        {...props}
      />
    );
  }
);
EnhancedCard.displayName = 'EnhancedCard';

const EnhancedCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 pb-4', className)}
      {...props}
    />
  )
);
EnhancedCardHeader.displayName = 'EnhancedCardHeader';

const EnhancedCardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold leading-tight tracking-tight text-neutral-900', className)}
      {...props}
    />
  )
);
EnhancedCardTitle.displayName = 'EnhancedCardTitle';

const EnhancedCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-600 leading-relaxed', className)}
      {...props}
    />
  )
);
EnhancedCardDescription.displayName = 'EnhancedCardDescription';

const EnhancedCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
EnhancedCardContent.displayName = 'EnhancedCardContent';

const EnhancedCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 border-t border-neutral-200', className)}
      {...props}
    />
  )
);
EnhancedCardFooter.displayName = 'EnhancedCardFooter';

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardFooter, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent 
};

