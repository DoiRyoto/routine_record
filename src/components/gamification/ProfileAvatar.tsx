'use client';

import React from 'react';

import type { UserProfile } from '@/types/gamification';

import { cn } from '@/lib/ui-utils';

interface ProfileAvatarProps {
  userProfile: UserProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  showXP?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ProfileAvatar({
  userProfile,
  size = 'md',
  showLevel = true,
  showXP = false,
  onClick,
  className
}: ProfileAvatarProps) {
  const sizeConfig = {
    sm: {
      avatar: 'w-8 h-8',
      level: 'w-5 h-5 text-xs',
      levelOffset: '-bottom-1 -right-1',
      text: 'text-xs'
    },
    md: {
      avatar: 'w-12 h-12',
      level: 'w-6 h-6 text-xs',
      levelOffset: '-bottom-1 -right-1',
      text: 'text-sm'
    },
    lg: {
      avatar: 'w-16 h-16',
      level: 'w-8 h-8 text-sm',
      levelOffset: '-bottom-1 -right-1',
      text: 'text-base'
    },
    xl: {
      avatar: 'w-24 h-24',
      level: 'w-10 h-10 text-base',
      levelOffset: '-bottom-2 -right-2',
      text: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  const getLevelColor = (level: number) => {
    if (level < 10) return 'bg-gradient-to-br from-gray-400 to-gray-600';
    if (level < 25) return 'bg-gradient-to-br from-primary-400 to-primary-600';
    if (level < 50) return 'bg-gradient-to-br from-rarity-rare to-primary-600';
    if (level < 100) return 'bg-gradient-to-br from-rarity-epic to-purple-600';
    return 'bg-gradient-to-br from-rarity-legendary to-orange-600';
  };

  const getAvatarContent = () => {
    if (userProfile.profileAvatar) {
      return (
        <img
          src={userProfile.profileAvatar}
          alt="Profile"
          className={cn('w-full h-full object-cover', config.avatar)}
        />
      );
    }

    // デフォルトアバター（レベルに基づく）
    const { level } = userProfile;
    let emoji = '🧑';
    if (level >= 100) emoji = '👑';
    else if (level >= 50) emoji = '🌟';
    else if (level >= 25) emoji = '🚀';
    else if (level >= 10) emoji = '⭐';

    return (
      <div className={cn(
        'flex items-center justify-center text-white font-bold',
        getLevelColor(level),
        config.avatar
      )}>
        <span className={cn('text-xl', size === 'sm' && 'text-lg', size === 'xl' && 'text-3xl')}>
          {emoji}
        </span>
      </div>
    );
  };

  return (
    <div 
      className={cn('relative inline-block', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {/* アバター */}
      <div className={cn(
        'rounded-full overflow-hidden border-2 border-white shadow-lg',
        config.avatar,
        onClick && 'hover:shadow-xl transition-shadow duration-200'
      )}>
        {getAvatarContent()}
      </div>

      {/* レベルバッジ */}
      {showLevel && (
        <div className={cn(
          'absolute flex items-center justify-center rounded-full text-white font-bold shadow-lg',
          config.level,
          config.levelOffset,
          getLevelColor(userProfile.level)
        )}>
          {userProfile.level}
        </div>
      )}

      {/* XP表示（オプション） */}
      {showXP && (
        <div className={cn(
          'absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-xp-500 text-white rounded-full text-xs font-medium whitespace-nowrap',
          config.text
        )}>
          {userProfile.totalXP.toLocaleString()} XP
        </div>
      )}

      {/* オンライン/アクティブインジケーター */}
      {userProfile.lastActiveAt && 
       new Date().getTime() - userProfile.lastActiveAt.getTime() < 5 * 60 * 1000 && (
        <div className={cn(
          'absolute top-0 right-0 w-3 h-3 bg-xp-500 border-2 border-white rounded-full',
          size === 'sm' && 'w-2 h-2',
          size === 'xl' && 'w-4 h-4'
        )} />
      )}
    </div>
  );
}