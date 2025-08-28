import React from 'react';

import type { StreakData } from './index';

interface StreakDisplayProps {
  streakData: StreakData;
  variant?: 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakDisplay({
  streakData,
  variant = 'compact',
  size = 'md',
  className = ''
}: StreakDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1', 
    lg: 'text-base px-4 py-2'
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center bg-orange-100 text-orange-800 rounded-full font-medium ${sizeClasses[size]} ${className}`} data-testid="streak-counter">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
        </svg>
        {streakData.current}日連続
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`} data-testid="streak-counter">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
        </svg>
        <span className="font-medium">{streakData.current}日連続</span>
      </div>
      <div className="text-sm text-gray-600">
        最長: {streakData.longest}日
      </div>
    </div>
  );
}