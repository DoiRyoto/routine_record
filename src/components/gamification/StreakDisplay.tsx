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
      <div className={`inline-flex items-center bg-orange-100 text-orange-800 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
        <span className="mr-1">🔥</span>
        {streakData.current} Day Streak
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">🔥</span>
        <span className="font-medium">Current Streak: {streakData.current} days</span>
      </div>
      <div className="text-sm text-gray-600">
        Best: {streakData.longest} days
      </div>
    </div>
  );
}