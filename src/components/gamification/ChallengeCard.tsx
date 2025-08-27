'use client';

import React from 'react';

import type { Challenge, UserChallenge } from '@/types/gamification';

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/ui-utils';

import { ProgressBar } from './ProgressBar';

interface ChallengeCardProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
  className?: string;
}

const typeColors = {
  weekly: 'border-primary-400 bg-primary-50',
  monthly: 'border-rarity-rare bg-blue-50',
  seasonal: 'border-rarity-epic bg-purple-50',
  special: 'border-rarity-legendary bg-yellow-50'
};

const typeLabels = {
  weekly: 'ウィークリー',
  monthly: 'マンスリー',
  seasonal: 'シーズナル',
  special: 'スペシャル'
};

export function ChallengeCard({
  challenge,
  userChallenge,
  onJoin,
  onLeave,
  className
}: ChallengeCardProps) {
  const isJoined = !!userChallenge;
  const isCompleted = userChallenge?.isCompleted || false;
  const progress = userChallenge?.progress || 0;
  const isActive = challenge.isActive && new Date() <= challenge.endDate;
  const daysRemaining = Math.max(0, Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleAction = () => {
    if (isJoined) {
      onLeave?.(challenge.id);
    } else {
      onJoin?.(challenge.id);
    }
  };

  const getStatusColor = () => {
    if (!isActive) return 'text-gray-500';
    if (isCompleted) return 'text-xp-600';
    if (isJoined) return 'text-primary-600';
    return 'text-text-secondary';
  };

  const getStatusText = () => {
    if (!isActive) return '終了済み';
    if (isCompleted) return '完了済み';
    if (isJoined) return '参加中';
    return `${challenge.participants}人参加中`;
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      typeColors[challenge.type],
      !isActive && 'opacity-75',
      className
    )}>
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-text-primary">{challenge.title}</h3>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
`${typeColors[challenge.type].replace('bg-', 'border-').replace('50', '200')} ${typeColors[challenge.type].replace('50', '700').replace('bg-', 'text-')}`
              )}>
                {typeLabels[challenge.type]}
              </span>
            </div>
            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
              {challenge.description}
            </p>
            <div className={cn('text-sm font-medium', getStatusColor())}>
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* 期間情報 */}
        <div className="flex items-center justify-between mb-4 text-sm text-text-secondary">
          <div>
            <span>開始: {challenge.startDate.toLocaleDateString()}</span>
          </div>
          <div className={cn(
            'font-medium',
            daysRemaining <= 1 ? 'text-error-600' : daysRemaining <= 3 ? 'text-warning-600' : 'text-text-secondary'
          )}>
            {isActive ? `残り${daysRemaining}日` : '終了'}
          </div>
        </div>

        {/* プログレス（参加中の場合） */}
        {isJoined && userChallenge && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">進捗</span>
              <span className="text-sm font-medium text-text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <ProgressBar
              value={progress}
              max={100}
              color={isCompleted ? 'xp' : 'primary'}
              size="sm"
            />
            {userChallenge.rank && (
              <div className="text-right mt-1">
                <span className="text-xs text-primary-600 font-medium">
                  順位: {userChallenge.rank}位
                </span>
              </div>
            )}
          </div>
        )}

        {/* 報酬セクション */}
        {challenge.rewards.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">報酬</h4>
            <div className="flex flex-wrap gap-2">
              {challenge.rewards.slice(0, 3).map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded-full text-xs"
                >
                  {reward.xpAmount ? (
                    <>
                      <div className="w-3 h-3 bg-xp-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold" style={{fontSize: '6px'}}>XP</span>
                      </div>
                      <span className="text-xp-600 font-medium">+{reward.xpAmount}</span>
                    </>
                  ) : (
                    <>
                      <span>🏆</span>
                      <span className="text-rarity-rare font-medium">バッジ</span>
                    </>
                  )}
                </div>
              ))}
              {challenge.rewards.length > 3 && (
                <span className="text-xs text-text-light">
                  +{challenge.rewards.length - 3}個
                </span>
              )}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-light">
            {challenge.maxParticipants ? (
              `${challenge.participants} / ${challenge.maxParticipants} 人`
            ) : (
              `${challenge.participants} 人参加`
            )}
          </div>

          {isActive && (
            <button
              onClick={handleAction}
              disabled={!isActive || Boolean(challenge.maxParticipants && challenge.participants >= challenge.maxParticipants && !isJoined)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                isCompleted
                  ? 'bg-xp-500 text-white cursor-default'
                  : isJoined
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  : 'bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isCompleted ? '完了済み' : isJoined ? '退出' : '参加'}
            </button>
          )}
        </div>
      </div>

      {/* 完了時のエフェクト */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-xp-50 to-primary-50 opacity-20 pointer-events-none" />
      )}

      {/* 期限切れ間近の警告 */}
      {isActive && daysRemaining <= 1 && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-error-500 rounded-full animate-ping" />
        </div>
      )}
    </Card>
  );
}