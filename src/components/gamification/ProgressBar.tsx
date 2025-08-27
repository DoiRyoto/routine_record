'use client';

import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/ui-utils';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  showAnimation?: boolean;
  color?: 'primary' | 'xp' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  barClassName?: string;
}

const colorClasses = {
  primary: 'bg-primary-500',
  xp: 'bg-xp-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = false,
  showAnimation = true,
  color = 'primary',
  size = 'md',
  className,
  barClassName
}: ProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, showAnimation]);

  return (
    <div className={cn('w-full', className)}>
      {/* ラベルと数値 */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-sm text-text-secondary">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-text-primary">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* プログレスバー */}
      <div className={cn('relative bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
            barClassName
          )}
          style={{ width: `${animatedValue}%` }}
        />
        
        {/* キラキラエフェクト（完了時） */}
        {percentage >= 100 && showAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
        )}
      </div>

      {/* 数値表示 */}
      {!showPercentage && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-text-light">{value}</span>
          <span className="text-xs text-text-light">{max}</span>
        </div>
      )}
    </div>
  );
}