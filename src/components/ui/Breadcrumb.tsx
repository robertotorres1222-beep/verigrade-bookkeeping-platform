'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, separator, showHome = true, ...props }, ref) => {
    const allItems = showHome 
      ? [{ label: 'Home', href: '/', icon: <HomeIcon className="h-4 w-4" /> }, ...items]
      : items;

    return (
      <nav
        ref={ref}
        className={cn('flex items-center space-x-1 text-sm', className)}
        aria-label="Breadcrumb"
        {...props}
      >
        {allItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <div className="mx-2 text-gray-400">
                {separator || <ChevronRightIcon className="h-4 w-4" />}
              </div>
            )}
            <div className="flex items-center">
              {item.icon && (
                <span className="mr-1 text-gray-500">{item.icon}</span>
              )}
              {item.href ? (
                <a
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </div>
          </div>
        ))}
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };

