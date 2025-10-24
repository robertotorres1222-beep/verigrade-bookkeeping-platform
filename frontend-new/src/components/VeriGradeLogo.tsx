import React from 'react';

interface VeriGradeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

export default function VeriGradeLogo({ 
  className = '', 
  size = 'md', 
  variant = 'full' 
}: VeriGradeLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="w-3/4 h-3/4 text-white"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Clean V Shape */}
        <path
          d="M3 21L12 3L21 21H17.5L12 8.5L6.5 21H3Z"
          fill="currentColor"
          className="opacity-95"
        />
        {/* Simple Checkmark */}
        <path
          d="M8 15L11 18L16 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
      </svg>
    </div>
  );

  const LogoText = () => (
    <span className={`font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent ${textSizeClasses[size]} ${className}`}>
      VeriGrade
    </span>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return <LogoText />;
  }

  return (
    <div className="flex items-center space-x-3">
      <LogoIcon />
      <LogoText />
    </div>
  );
}

// Alternative SVG Logo Component
export function VeriGradeSVGLogo({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1F2937" />
          <stop offset="50%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      
      {/* Background Circle */}
      <circle cx="16" cy="16" r="15" fill="url(#logoGradient)" />
      
      {/* Clean V Shape */}
      <path
        d="M8 24L16 8L24 24H20.5L16 14L11.5 24H8Z"
        fill="white"
        opacity="0.95"
      />
      
      {/* Simple Checkmark */}
      <path
        d="M10 20L13 23L18 15"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      
      {/* Text */}
      <text
        x="16"
        y="30"
        textAnchor="middle"
        className="text-xs font-bold"
        fill="url(#textGradient)"
      >
        VeriGrade
      </text>
    </svg>
  );
}

// Modern Logo with Animation
export function VeriGradeAnimatedLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 animate-pulse"></div>
      <div className="relative bg-white rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 21L12 3L21 21H17.5L12 8.5L6.5 21H3Z"
                fill="currentColor"
              />
              <path
                d="M8 15L11 18L16 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              VeriGrade
            </div>
            <div className="text-xs text-gray-500 font-medium">
              AI Bookkeeping
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
