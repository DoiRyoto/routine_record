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
    <div className={`relative ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
          U
        </div>
      </Avatar>
      {showLevel && (
        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center">
          {userProfile.level}
        </div>
      )}
    </div>
  );
}