'use client';

import React, { useState } from 'react';

import { cn } from '@/lib/ui-utils';

interface GameTooltipProps {
  content: React.ReactNode;
  title?: string;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error' | 'rare' | 'epic' | 'legendary';
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-gray-900',
    border: 'border-gray-700',
    text: 'text-white',
    arrow: 'border-gray-900'
  },
  info: {
    bg: 'bg-primary-600',
    border: 'border-primary-500',
    text: 'text-white',
    arrow: 'border-primary-600'
  },
  success: {
    bg: 'bg-xp-600',
    border: 'border-xp-500',
    text: 'text-white',
    arrow: 'border-xp-600'
  },
  warning: {
    bg: 'bg-warning-600',
    border: 'border-warning-500',
    text: 'text-white',
    arrow: 'border-warning-600'
  },
  error: {
    bg: 'bg-error-600',
    border: 'border-error-500',
    text: 'text-white',
    arrow: 'border-error-600'
  },
  rare: {
    bg: 'bg-gradient-to-br from-rarity-rare to-blue-600',
    border: 'border-rarity-rare',
    text: 'text-white',
    arrow: 'border-rarity-rare'
  },
  epic: {
    bg: 'bg-gradient-to-br from-rarity-epic to-purple-600',
    border: 'border-rarity-epic',
    text: 'text-white',
    arrow: 'border-rarity-epic'
  },
  legendary: {
    bg: 'bg-gradient-to-br from-rarity-legendary to-orange-600',
    border: 'border-rarity-legendary',
    text: 'text-white',
    arrow: 'border-rarity-legendary'
  }
};

const positionStyles = {
  top: {
    tooltip: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent'
  },
  bottom: {
    tooltip: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent'
  },
  left: {
    tooltip: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent'
  },
  right: {
    tooltip: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  }
};

export function GameTooltip({
  content,
  title,
  variant = 'default',
  position = 'top',
  delay = 300,
  children,
  className
}: GameTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const variantStyle = variantStyles[variant];
  const positionStyle = positionStyles[position];

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div 
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div className={cn(
          'absolute z-50 px-3 py-2 text-sm rounded-lg border shadow-lg backdrop-blur-sm min-w-max max-w-xs',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          variantStyle.bg,
          variantStyle.border,
          variantStyle.text,
          positionStyle.tooltip
        )}>
          {/* タイトル */}
          {title && (
            <div className="font-semibold mb-1 border-b border-white/20 pb-1">
              {title}
            </div>
          )}
          
          {/* コンテンツ */}
          <div className="whitespace-pre-wrap">
            {content}
          </div>
          
          {/* 矢印 */}
          <div className={cn(
            'absolute w-0 h-0 border-4',
            positionStyle.arrow,
            variantStyle.arrow
          )} />
          
          {/* レア度の輝きエフェクト */}
          {(variant === 'rare' || variant === 'epic' || variant === 'legendary') && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-lg animate-shimmer pointer-events-none" />
          )}
        </div>
      )}
    </div>
  );
}

// ゲーム要素用の特別なツールチップバリエーション
interface BadgeTooltipProps {
  badge: {
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category?: string;
    unlockedAt?: Date;
  };
  children: React.ReactNode;
}

export function BadgeTooltip({ badge, children }: BadgeTooltipProps) {
  const rarityVariant = badge.rarity === 'common' ? 'default' : badge.rarity;
  
  return (
    <GameTooltip
      title={badge.name}
      variant={rarityVariant}
      content={
        <div>
          <p className="mb-2">{badge.description}</p>
          {badge.category && (
            <p className="text-xs opacity-75 mb-1">カテゴリ: {badge.category}</p>
          )}
          {badge.unlockedAt && (
            <p className="text-xs opacity-75">
              取得日: {badge.unlockedAt.toLocaleDateString()}
            </p>
          )}
        </div>
      }
    >
      {children}
    </GameTooltip>
  );
}

interface MissionTooltipProps {
  mission: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    xpReward: number;
    progress?: number;
    targetValue?: number;
  };
  children: React.ReactNode;
}

export function MissionTooltip({ mission, children }: MissionTooltipProps) {
  const variant = mission.difficulty === 'legendary' ? 'legendary' : 
                 mission.difficulty === 'hard' ? 'epic' :
                 mission.difficulty === 'medium' ? 'rare' : 'info';
  
  return (
    <GameTooltip
      title={mission.title}
      variant={variant}
      content={
        <div>
          <p className="mb-2">{mission.description}</p>
          <p className="text-xs opacity-75 mb-1">
            報酬: {mission.xpReward} XP
          </p>
          {mission.progress !== undefined && mission.targetValue !== undefined && (
            <p className="text-xs opacity-75">
              進捗: {mission.progress} / {mission.targetValue}
            </p>
          )}
        </div>
      }
    >
      {children}
    </GameTooltip>
  );
}