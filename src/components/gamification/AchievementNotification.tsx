'use client';

import React, { useEffect, useState } from 'react';

import type { GameNotification } from '@/types/gamification';

import { cn } from '@/lib/ui-utils';

interface AchievementNotificationProps {
  notification: GameNotification;
  onClose?: (id: string) => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

const typeConfig = {
  level_up: {
    icon: '🎉',
    bgColor: 'bg-gradient-to-r from-primary-500 to-primary-600',
    borderColor: 'border-primary-400',
    textColor: 'text-white'
  },
  badge_unlocked: {
    icon: '🏆',
    bgColor: 'bg-gradient-to-r from-rarity-rare to-rarity-epic',
    borderColor: 'border-rarity-rare',
    textColor: 'text-white'
  },
  mission_completed: {
    icon: '✅',
    bgColor: 'bg-gradient-to-r from-xp-500 to-xp-600',
    borderColor: 'border-xp-400',
    textColor: 'text-white'
  },
  achievement_unlocked: {
    icon: '⭐',
    bgColor: 'bg-gradient-to-r from-rarity-legendary to-warning-500',
    borderColor: 'border-rarity-legendary',
    textColor: 'text-white'
  },
  challenge_joined: {
    icon: '🚀',
    bgColor: 'bg-gradient-to-r from-accent-600 to-primary-600',
    borderColor: 'border-accent-500',
    textColor: 'text-white'
  }
};

export function AchievementNotification({
  notification,
  onClose,
  duration = 5000,
  position = 'top-right'
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const config = typeConfig[notification.type];

  useEffect(() => {
    // エントランスアニメーション
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // 自動クローズ
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose?.(notification.id), 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [notification.id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose?.(notification.id), 300);
  };

  return (
    <div className={cn(
      'fixed z-50 max-w-sm transition-all duration-300 ease-out',
      positionClasses[position],
      isVisible && !isExiting 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 translate-y-2 scale-95'
    )}>
      <div className={cn(
        'relative p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm',
        config.bgColor,
        config.borderColor,
        'animate-pulse-once'
      )}>
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className={cn(
            'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity',
            config.textColor
          )}
        >
          ×
        </button>

        {/* メインコンテンツ */}
        <div className="flex items-start gap-3 pr-6">
          <div className="text-2xl flex-shrink-0">
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-bold text-sm mb-1', config.textColor)}>
              {notification.title}
            </h3>
            <p className={cn('text-sm opacity-90 leading-tight', config.textColor)}>
              {notification.message}
            </p>
            
            {/* 追加データ（XP、レベル情報など） */}
            {notification.data && (
              <div className="mt-2 flex items-center gap-2">
                {typeof notification.data.xp === 'number' && (
                  <div className={cn('px-2 py-1 rounded-full text-xs font-medium bg-white/20', config.textColor)}>
                    +{notification.data.xp} XP
                  </div>
                )}
                {typeof notification.data.level === 'number' && (
                  <div className={cn('px-2 py-1 rounded-full text-xs font-medium bg-white/20', config.textColor)}>
                    レベル {notification.data.level}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 輝きエフェクト */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-lg animate-shimmer pointer-events-none" />
      </div>
    </div>
  );
}

// 複数の通知を管理するコンポーネント
interface AchievementNotificationManagerProps {
  notifications: GameNotification[];
  onRemove?: (id: string) => void;
  maxDisplay?: number;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function AchievementNotificationManager({
  notifications,
  onRemove,
  maxDisplay = 3,
  position = 'top-right'
}: AchievementNotificationManagerProps) {
  const displayedNotifications = notifications
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, maxDisplay);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className={cn(
        'absolute space-y-2',
        positionClasses[position]
      )}>
        {displayedNotifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ 
              transform: `translateY(${index * (position.includes('top') ? 1 : -1) * 8}px)`,
              zIndex: 50 - index
            }}
          >
            <AchievementNotification
              notification={notification}
              onClose={onRemove}
              position={position}
            />
          </div>
        ))}
      </div>
    </div>
  );
}