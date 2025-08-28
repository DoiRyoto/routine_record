import React from 'react';

import { Avatar } from '@/components/ui/Avatar';
import type { UserProfile } from '@/lib/db/schema';

interface UserAvatarProps {
  userProfile: UserProfile;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  className?: string;
}

export function UserAvatar({
  userProfile,
  size = 'md',
  showLevel = false,
  className = ''
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`relative ${className}`} data-testid="profile-avatar">
      <Avatar className={sizeClasses[size]}>
        <div className="w-full h-full bg-blue dark:bg-dark-blue flex items-center justify-center text-blue dark:text-blue font-bold">
          U
        </div>
      </Avatar>
      {showLevel && (
        <div 
          className="absolute -bottom-1 -right-1 bg-yellow dark:bg-dark-yellow text-yellow dark:text-yellow text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center"
          data-testid="user-level"
        >
          Lv.{userProfile.level}
        </div>
      )}
    </div>
  );
}