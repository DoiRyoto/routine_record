'use client';

import React from 'react';

import type { UserBadge } from '@/types/gamification';

import { cn } from '@/lib/ui-utils';

interface BadgeGridProps {
  badges: UserBadge[];
  maxDisplay?: number;
  showEmpty?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onBadgeClick?: (badge: UserBadge) => void;
  className?: string;
}

const rarityColors = {
  common: 'border-rarity-common bg-rarity-common/10',
  rare: 'border-rarity-rare bg-rarity-rare/10',
  epic: 'border-rarity-epic bg-rarity-epic/10',
  legendary: 'border-rarity-legendary bg-rarity-legendary/10',
};

const rarityGlow = {
  common: 'shadow-rarity-common/20',
  rare: 'shadow-rarity-rare/30 shadow-lg',
  epic: 'shadow-rarity-epic/40 shadow-lg',
  legendary: 'shadow-rarity-legendary/50 shadow-xl',
};

const sizeConfig = {
  sm: {
    badge: 'w-12 h-12',
    text: 'text-xs',
    grid: 'grid-cols-6 gap-2',
  },
  md: {
    badge: 'w-16 h-16',
    text: 'text-sm',
    grid: 'grid-cols-5 gap-3',
  },
  lg: {
    badge: 'w-20 h-20',
    text: 'text-base',
    grid: 'grid-cols-4 gap-4',
  }
};

function BadgeItem({ 
  badge, 
  size = 'md', 
  isEmpty = false, 
  onClick 
}: { 
  badge?: UserBadge; 
  size?: 'sm' | 'md' | 'lg'; 
  isEmpty?: boolean;
  onClick?: (badge: UserBadge) => void;
}) {
  const config = sizeConfig[size];
  
  if (isEmpty || !badge?.badge) {
    return (
      <div className={cn(
        'flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl',
        config.badge
      )}>
        <div className="w-4 h-4 bg-gray-300 rounded-full opacity-50" />
      </div>
    );
  }

  const rarity = badge.badge.rarity;
  const isNew = badge.isNew;

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105',
        config.badge,
        rarityColors[rarity],
        rarityGlow[rarity],
        isNew && 'animate-pulse',
        onClick && 'hover:opacity-80'
      )}
      onClick={() => onClick && onClick(badge)}
      title={`${badge.badge.name} - ${badge.badge.description}`}
    >
      {/* バッジアイコン */}
      <div className="relative">
        {badge.badge.iconUrl ? (
          <img 
            src={badge.badge.iconUrl} 
            alt={badge.badge.name}
            className="w-8 h-8 object-cover rounded"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded flex items-center justify-center text-white font-bold">
            🏆
          </div>
        )}
        
        {/* 新規バッジインジケーター */}
        {isNew && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full animate-ping" />
        )}
      </div>

      {/* レアリティエフェクト */}
      {(rarity === 'epic' || rarity === 'legendary') && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl pointer-events-none" />
      )}
    </div>
  );
}

export function BadgeGrid({ 
  badges, 
  maxDisplay = 20,
  showEmpty = true,
  size = 'md',
  onBadgeClick,
  className 
}: BadgeGridProps) {
  const config = sizeConfig[size];
  const displayedBadges = badges.slice(0, maxDisplay);
  const emptySlots = showEmpty ? Math.max(0, maxDisplay - displayedBadges.length) : 0;

  return (
    <div className={cn('grid', config.grid, className)}>
      {/* 獲得済みバッジ */}
      {displayedBadges.map((badge) => (
        <BadgeItem
          key={badge.id}
          badge={badge}
          size={size}
          onClick={onBadgeClick}
        />
      ))}

      {/* 空のスロット */}
      {Array.from({ length: emptySlots }, (_, index) => (
        <BadgeItem
          key={`empty-${index}`}
          size={size}
          isEmpty={true}
        />
      ))}

      {/* もっと表示ボタン（必要な場合） */}
      {badges.length > maxDisplay && (
        <div className={cn(
          'flex items-center justify-center border-2 border-dashed border-primary-300 bg-primary-50 rounded-xl cursor-pointer transition-colors hover:bg-primary-100',
          config.badge
        )}>
          <span className={cn('text-primary-600 font-medium', config.text)}>
            +{badges.length - maxDisplay}
          </span>
        </div>
      )}
    </div>
  );
}