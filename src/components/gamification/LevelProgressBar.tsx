import React from 'react';

import { Progress } from '@/components/ui/Progress';

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelProgressBar({
  level,
  currentXP,
  nextLevelXP,
  totalXP,
  size = 'md',
  className = ''
}: LevelProgressBarProps) {
  const progress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 100;
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Level {level}</span>
        <span className="text-xs text-gray-500">
          {currentXP} / {nextLevelXP} XP
        </span>
      </div>
      <Progress 
        value={progress} 
        className={sizeClasses[size]}
      />
      <div className="text-xs text-gray-500">
        Total XP: {totalXP.toLocaleString()}
      </div>
    </div>
  );
}