import React from 'react';

import type { UserBadge, Badge } from '@/lib/db/schema';

import { Card } from '@/common/components/ui/Card';


// UserBadge with related Badge data
type UserBadgeWithBadge = UserBadge & {
  badge: Badge;
};

interface BadgeCollectionProps {
  badges: UserBadgeWithBadge[];
  title?: string;
  maxDisplay?: number;
  className?: string;
  showEmpty?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onBadgeClick?: (badge: UserBadgeWithBadge) => void;
}

export function BadgeCollection({
  badges,
  title = 'バッジコレクション',
  maxDisplay = 12,
  className = '',
  showEmpty = true,
  size = 'md',
  onBadgeClick
}: BadgeCollectionProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const rarityColors = {
    common: 'border-gray bg-gray',
    rare: 'border-blue bg-blue',
    epic: 'border-purple bg-purple',
    legendary: 'border-yellow bg-yellow'
  };

  // 実際のsize使用例（将来的に実装予定）
  const badgeSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
  const shouldShowEmpty = showEmpty && badges.length === 0;

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-medium mb-4">{title}</h3>
      {shouldShowEmpty ? (
        <div className="text-center py-8 text-gray">
          <div className="text-4xl mb-2">🏆</div>
          <p>まだバッジを獲得していません</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {displayBadges.map((userBadge) => (
              <div 
                key={userBadge.id}
                className={`aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-80 ${
                  rarityColors[userBadge.badge.rarity] || rarityColors.common
                }`}
                title={userBadge.badge.name}
                onClick={() => onBadgeClick?.(userBadge)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onBadgeClick?.(userBadge);
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <div className={`${badgeSize} mb-1`}>🏅</div>
                <div className="text-xs font-medium truncate w-full">
                  {userBadge.badge.name}
                </div>
                {userBadge.isNew && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red dark:bg-dark-red rounded-full" />
                )}
              </div>
            ))}
          </div>
          {remainingCount > 0 && (
            <div className="text-center text-sm text-gray">
              他 {remainingCount} 個のバッジ
            </div>
          )}
        </div>
      )}
    </Card>
  );
}