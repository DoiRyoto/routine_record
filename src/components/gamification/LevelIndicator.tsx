'use client';

import React from 'react';

import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/ui-utils';

interface LevelIndicatorProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP?: number;
  showXPNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelIndicator({
  level,
  currentXP,
  nextLevelXP,
  totalXP,
  showXPNumbers = true,
  size = 'md',
  className
}: LevelIndicatorProps) {
  const xpProgress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 100;
  const remainingXP = Math.max(nextLevelXP - currentXP, 0);

  const sizeConfig = {
    sm: {
      levelSize: 'w-8 h-8 text-sm',
      textSize: 'text-xs',
      spacing: 'gap-2'
    },
    md: {
      levelSize: 'w-12 h-12 text-lg',
      textSize: 'text-sm',
      spacing: 'gap-3'
    },
    lg: {
      levelSize: 'w-16 h-16 text-xl',
      textSize: 'text-base',
      spacing: 'gap-4'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center', config.spacing, className)}>
      {/* レベル表示 */}
      <div className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold shadow-lg',
        config.levelSize
      )}>
        <span>{level}</span>
        {/* 光る効果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
      </div>

      {/* XP情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn('font-medium text-text-primary', config.textSize)}>
            レベル {level}
          </span>
          {showXPNumbers && (
            <span className={cn('text-text-secondary', config.textSize)}>
              {currentXP} / {nextLevelXP} XP
            </span>
          )}
        </div>

        {/* XPプログレスバー */}
        <ProgressBar
          value={currentXP}
          max={nextLevelXP}
          color="xp"
          size={size === 'lg' ? 'md' : 'sm'}
          showAnimation={true}
        />

        {/* 追加情報 */}
        {showXPNumbers && (
          <div className="flex items-center justify-between mt-1">
            {remainingXP > 0 ? (
              <span className={cn('text-text-light', config.textSize)}>
                レベルアップまで {remainingXP} XP
              </span>
            ) : (
              <span className={cn('text-xp-600 font-medium', config.textSize)}>
                レベルアップ可能！
              </span>
            )}
            {totalXP && (
              <span className={cn('text-text-light', config.textSize)}>
                総XP: {totalXP}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}