'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface ModernInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  floating?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    icon, 
    iconPosition = 'left',
    floating = false,
    variant = 'default',
    type,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const baseInputClasses = cn(
      'peer w-full transition-all duration-200',
      'placeholder:text-transparent',
      variant === 'default' && 'rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      variant === 'filled' && 'rounded-lg border-0 bg-neutral-100 px-4 py-3 text-neutral-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20',
      variant === 'outlined' && 'rounded-lg border-2 border-neutral-300 bg-transparent px-4 py-3 text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
      icon && iconPosition === 'left' && 'pl-10',
      icon && iconPosition === 'right' && 'pr-10',
      isPassword && 'pr-10',
      className
    );

    const floatingLabelClasses = cn(
      'absolute left-4 transition-all duration-200 pointer-events-none',
      'text-neutral-500',
      (isFocused || hasValue) && 'top-1 text-xs text-primary-600',
      !isFocused && !hasValue && 'top-3 text-sm',
      error && 'text-error-500',
      icon && iconPosition === 'left' && 'left-10'
    );

    return (
      <div className="relative w-full">
        {floating && label && (
          <label 
            htmlFor={inputId}
            className={floatingLabelClasses}
          >
            {label}
          </label>
        )}
        
        {!floating && label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-neutral-700 mb-2',
              error && 'text-error-600'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={baseInputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {icon && iconPosition === 'right' && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={cn(
            'mt-1.5 text-sm',
            error ? 'text-error-600' : 'text-neutral-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
ModernInput.displayName = 'ModernInput';

export { ModernInput };

