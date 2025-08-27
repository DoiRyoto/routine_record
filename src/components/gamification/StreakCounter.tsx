'use client';

import React from 'react';

import type { StreakData } from '@/types/gamification';
import { cn } from '@/lib/ui-utils';

interface StreakCounterProps {
  streakData: StreakData;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'detailed' | 'card';
  showFreeze?: boolean;
  onUseFreeze?: () => void;
  className?: string;
}

export function StreakCounter({
  streakData,
  size = 'md',
  variant = 'compact',
  showFreeze = true,
  onUseFreeze,
  className
}: StreakCounterProps) {
  const { current, longest, lastExecutionDate, freezesUsed, freezesAvailable } = streakData;

  const sizeConfig = {
    sm: {
      flame: 'text-lg',
      count: 'text-sm',
      label: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      flame: 'text-2xl',
      count: 'text-lg',
      label: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      flame: 'text-3xl',
      count: 'text-xl',
      label: 'text-base',
      gap: 'gap-3'
    }
  };

  const config = sizeConfig[size];

  const getFlameColor = (streak: number) => {
    if (streak === 0) return 'text-gray-400';
    if (streak < 7) return 'text-orange-500';
    if (streak < 30) return 'text-orange-600';
    if (streak < 100) return 'text-red-500';
    return 'text-red-600';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return '今日から始めよう！';
    if (streak < 7) return '良いペース！';
    if (streak < 30) return '素晴らしい継続！';
    if (streak < 100) return '驚異的な継続力！';
    return '伝説の継続者！';
  };

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center', config.gap, className)}>
        <span className={cn(config.flame, getFlameColor(current))}>
          🔥
        </span>
        <div>
          <span className={cn('font-bold text-text-primary', config.count)}>{current}</span>
          <span className={cn('text-text-secondary ml-1', config.label)}>日連続</span>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200', className)}>
        <div className={cn('flex items-center', config.gap)}>
          <div className="relative">
            <span className={cn(config.flame, getFlameColor(current))}>🔥</span>
            {current > 0 && (
              <div className="absolute -inset-1 bg-orange-400/20 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <div className={cn('font-bold text-text-primary', config.count)}>
              {current} 日連続
            </div>
            <div className={cn('text-text-secondary', config.label)}>
              最長: {longest} 日
            </div>
          </div>
        </div>

        {showFreeze && freezesAvailable > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className={cn('text-blue-600 font-medium', config.label)}>
                フリーズ {freezesAvailable}
              </div>
              <button
                onClick={onUseFreeze}
                className={cn(
                  'px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs transition-colors',
                  config.label
                )}
              >
                使用
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // card variant
  return (
    <div className={cn('p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-xl border border-orange-200 shadow-sm', className)}>
      <div className="text-center mb-3">
        <div className="relative inline-block">
          <span className={cn(config.flame, getFlameColor(current), 'drop-shadow-lg')}>
            🔥
          </span>
          {current > 0 && (
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400/30 to-red-400/30 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      <div className="text-center mb-3">
        <div className={cn('font-bold text-text-primary mb-1', config.count)}>
          {current} 日連続
        </div>
        <div className={cn('text-text-secondary', config.label)}>
          {getStreakMessage(current)}
        </div>
      </div>

      <div className="flex justify-between items-center text-center">
        <div>
          <div className={cn('font-semibold text-text-primary', config.label)}>
            {longest}
          </div>
          <div className={cn('text-text-light text-xs', size === 'lg' ? 'text-sm' : 'text-xs')}>
            最長記録
          </div>
        </div>

        {lastExecutionDate && (
          <div>
            <div className={cn('font-semibold text-text-primary', config.label)}>
              {lastExecutionDate.toLocaleDateString()}
            </div>
            <div className={cn('text-text-light text-xs', size === 'lg' ? 'text-sm' : 'text-xs')}>
              最終実行
            </div>
          </div>
        )}

        {showFreeze && (
          <div>
            <div className={cn('font-semibold text-blue-600', config.label)}>
              {freezesAvailable}
            </div>
            <div className={cn('text-text-light text-xs', size === 'lg' ? 'text-sm' : 'text-xs')}>
              フリーズ
            </div>
          </div>
        )}
      </div>

      {showFreeze && freezesAvailable > 0 && onUseFreeze && (
        <button
          onClick={onUseFreeze}
          className="w-full mt-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          ストリークフリーズを使用
        </button>
      )}
    </div>
  );
}