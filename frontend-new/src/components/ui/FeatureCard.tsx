'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: ReactNode;
  image?: string;
  gradient?: boolean;
  variant?: 'default' | 'hover-lift' | 'border-glow' | 'glass';
  href?: string;
  onClick?: () => void;
}

export function FeatureCard({
  title,
  description,
  icon,
  image,
  gradient = false,
  variant = 'default',
  href,
  onClick,
  className,
  ...props
}: FeatureCardProps) {
  const isInteractive = Boolean(href || onClick);
  
  const variantClasses = {
    default: 'bg-white border border-neutral-200 shadow-card hover:shadow-card-hover',
    'hover-lift': 'bg-white border border-neutral-200 shadow-card hover:shadow-card-hover hover:-translate-y-2',
    'border-glow': 'bg-white border border-neutral-200 shadow-card hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/20',
    glass: 'backdrop-blur-md bg-white/80 border border-white/20 shadow-glass',
  };

  const content = (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300 p-8',
        gradient && 'bg-gradient-to-br from-primary-50 via-white to-secondary-50',
        variantClasses[variant],
        isInteractive && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex flex-col items-start">
        {/* Icon/Image Section */}
        <div className="mb-4">
          {icon && (
            <div className="p-3 rounded-xl bg-gradient-primary text-white shadow-lg">
              {icon}
            </div>
          )}
          {image && !icon && (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100">
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 w-full">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            {title}
          </h3>
          <p className="text-neutral-600 leading-relaxed mb-4">
            {description}
          </p>
          
          {isInteractive && (
            <div className="flex items-center text-primary-600 font-medium group">
              <span className="text-sm">Learn more</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

