import React from 'react';

import type { UserChallenge } from '@/lib/db/schema';

import { Avatar, AvatarImage, AvatarFallback } from '@/common/components/ui/Avatar';
import { Card } from '@/common/components/ui/Card';
import { cn } from '@/common/lib/ui-utils';


interface LeaderboardEntry extends UserChallenge {
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

const getRankColor = (rank: number | null) => {
  switch (rank) {
    case 1:
      return 'text-yellow-500'; // 金
    case 2:
      return 'text-gray-400'; // 銀
    case 3:
      return 'text-yellow-700'; // 銅
    default:
      return 'text-text-muted';
  }
};

const getRankIcon = (rank: number | null) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `${rank}位`;
  }
};

export function Leaderboard({
  leaderboard,
  currentUserId,
  className
}: LeaderboardProps) {
  if (leaderboard.length === 0) {
    return (
      <Card className={cn('p-6', className)} data-testid="leaderboard">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            まだ参加者がいません
          </h3>
          <p className="text-text-muted">
            最初の挑戦者になりませんか？
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)} data-testid="leaderboard">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-text-primary">🏆 ランキング</h3>
          <span className="text-sm text-text-muted">({leaderboard.length}人参加)</span>
        </div>
        
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const displayRank = entry.rank || index + 1;
            const isCurrentUser = entry.userId === currentUserId;
            
            return (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg transition-colors',
                  isCurrentUser
                    ? 'bg-orange/10 border border-orange/20'
                    : 'bg-bg-secondary/50',
                  displayRank <= 3 && 'ring-1 ring-yellow/20'
                )}
                data-testid="ranking-item"
              >
                {/* 順位 */}
                <div className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg',
                  displayRank <= 3 
                    ? 'bg-gradient-to-br from-yellow/20 to-orange/20' 
                    : 'bg-bg-muted'
                )}>
                  <span className={getRankColor(displayRank)}>
                    {displayRank <= 3 ? getRankIcon(displayRank) : displayRank}
                  </span>
                </div>

                {/* ユーザー情報 */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10" data-testid="user-avatar">
                    <AvatarImage 
                      src={entry.user.avatarUrl || undefined}
                      alt={entry.user.displayName || 'ユーザー'}
                    />
                    <AvatarFallback>
                      {entry.user.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">
                      {entry.user.displayName || 'Anonymous'}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs px-2 py-1 bg-orange text-white rounded-full">
                          あなた
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-muted">
                      {entry.isCompleted ? (
                        <>完了 • {entry.completedAt?.toLocaleDateString()}</>
                      ) : (
                        <>進行中 • {entry.joinedAt.toLocaleDateString()}参加</>
                      )}
                    </div>
                  </div>
                </div>

                {/* 進捗 */}
                <div className="text-right">
                  <div className={cn(
                    'text-lg font-bold',
                    entry.isCompleted ? 'text-green' : 'text-orange'
                  )}>
                    {entry.progress}%
                  </div>
                  {entry.isCompleted && (
                    <div className="text-xs text-green">完了</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 現在のユーザーが範囲外の場合の表示 */}
        {currentUserId && !leaderboard.some(entry => entry.userId === currentUserId) && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-center text-text-muted">
              <div className="text-sm mb-2">あなたの順位</div>
              <div className="text-lg">参加していません</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}