'use client';

import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/ui-utils';

interface XPCounterProps {
  value: number;
  increment?: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'badge' | 'card';
  className?: string;
}

export function XPCounter({ 
  value, 
  increment, 
  showAnimation = true,
  size = 'md',
  variant = 'inline',
  className 
}: XPCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeConfig = {
    sm: {
      text: 'text-sm',
      icon: 'w-3 h-3',
      padding: variant === 'badge' ? 'px-2 py-1' : '',
    },
    md: {
      text: 'text-base',
      icon: 'w-4 h-4',
      padding: variant === 'badge' ? 'px-3 py-1.5' : '',
    },
    lg: {
      text: 'text-lg',
      icon: 'w-5 h-5',
      padding: variant === 'badge' ? 'px-4 py-2' : '',
    }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (showAnimation && increment && increment > 0) {
      setIsAnimating(true);
      
      // カウントアップアニメーション
      const duration = 1000;
      const steps = 20;
      const stepValue = increment / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setDisplayValue(value - increment + Math.round(stepValue * currentStep));
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setDisplayValue(value);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, increment, showAnimation]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const baseClasses = cn(
    'flex items-center gap-1 font-medium transition-all duration-300',
    config.text,
    isAnimating && 'scale-110 text-xp-600',
    className
  );

  const XPIcon = () => (
    <div className={cn(
      'bg-xp-500 rounded-full flex items-center justify-center text-white font-bold text-xs',
      config.icon
    )}>
      <span style={{ fontSize: '0.5em' }}>XP</span>
    </div>
  );

  if (variant === 'badge') {
    return (
      <div className={cn(
        'inline-flex items-center gap-1 bg-xp-50 border border-xp-200 rounded-full text-xp-700',
        config.padding,
        baseClasses
      )}>
        <XPIcon />
        <span>{formatNumber(displayValue)}</span>
        {increment && increment > 0 && showAnimation && (
          <span className="text-xp-600 animate-bounce">+{increment}</span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('p-4 bg-gradient-to-br from-xp-50 to-xp-100 rounded-lg border border-xp-200', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XPIcon />
            <span className="text-sm text-xp-700 font-medium">経験値</span>
          </div>
          <div className={cn('font-bold text-xp-800', config.text)}>
            {formatNumber(displayValue)}
          </div>
        </div>
        {increment && increment > 0 && (
          <div className={cn(
            'mt-2 text-right text-xp-600',
            isAnimating ? 'animate-bounce' : 'opacity-75',
            config.text
          )}>
            +{increment} XP
          </div>
        )}
      </div>
    );
  }

  // inline variant (default)
  return (
    <div className={baseClasses}>
      <XPIcon />
      <span className="text-xp-700">{formatNumber(displayValue)}</span>
      {increment && increment > 0 && showAnimation && (
        <span className="text-xp-600 animate-bounce text-sm">+{increment}</span>
      )}
    </div>
  );
}