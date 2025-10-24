'use client';

import { HTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, position = 'top', delay = 200, disabled = false, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const showTooltip = () => {
      if (disabled) return;
      
      timeoutRef.current = setTimeout(() => {
        if (triggerRef.current && tooltipRef.current) {
          const triggerRect = triggerRef.current.getBoundingClientRect();
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          
          let top = 0;
          let left = 0;

          switch (position) {
            case 'top':
              top = triggerRect.top - tooltipRect.height - 8;
              left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
              break;
            case 'bottom':
              top = triggerRect.bottom + 8;
              left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
              break;
            case 'left':
              top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
              left = triggerRect.left - tooltipRect.width - 8;
              break;
            case 'right':
              top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
              left = triggerRect.right + 8;
              break;
          }

          setTooltipPosition({ top, left });
          setIsVisible(true);
        }
      }, delay);
    };

    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const tooltipContent = isVisible && (
      <div
        ref={tooltipRef}
        className={cn(
          'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          position === 'top' && 'mb-1',
          position === 'bottom' && 'mt-1',
          position === 'left' && 'mr-1',
          position === 'right' && 'ml-1'
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {content}
        <div
          className={cn(
            'absolute w-0 h-0 border-4 border-transparent',
            position === 'top' && 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
            position === 'bottom' && 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
            position === 'left' && 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
            position === 'right' && 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900'
          )}
        />
      </div>
    );

    return (
      <>
        <div
          ref={triggerRef}
          className={cn('inline-block', className)}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
          {...props}
        >
          {children}
        </div>
        {isVisible && createPortal(tooltipContent, document.body)}
      </>
    );
  }
);
Tooltip.displayName = 'Tooltip';

export { Tooltip };

