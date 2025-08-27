'use client';

import React from 'react';

import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import type { Mission, UserMission } from '@/types/gamification';
import { cn } from '@/lib/ui-utils';

interface MissionCardProps {
  mission: Mission;
  userMission?: UserMission;
  onClaim?: (missionId: string) => void;
  className?: string;
}

const difficultyColors = {
  easy: 'border-rarity-common text-rarity-common',
  medium: 'border-rarity-rare text-rarity-rare',
  hard: 'border-rarity-epic text-rarity-epic',
  legendary: 'border-rarity-legendary text-rarity-legendary',
};

const difficultyLabels = {
  easy: '簡単',
  medium: '普通',
  hard: '困難',
  legendary: '伝説',
};

export function MissionCard({ mission, userMission, onClaim, className }: MissionCardProps) {
  const progress = userMission?.progress || 0;
  const isCompleted = userMission?.isCompleted || false;
  const progressPercentage = Math.min((progress / mission.targetValue) * 100, 100);

  const handleClaim = () => {
    if (isCompleted && onClaim) {
      onClaim(mission.id);
    }
  };

  return (
    <Card className={cn('relative overflow-hidden transition-all duration-300 hover:shadow-lg', className)}>
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-1">{mission.title}</h3>
            <p className="text-sm text-text-secondary line-clamp-2">{mission.description}</p>
          </div>
          <div className={cn('px-2 py-1 rounded-full text-xs font-medium border', difficultyColors[mission.difficulty])}>
            {difficultyLabels[mission.difficulty]}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">進捗</span>
            <span className="text-sm font-medium text-text-primary">
              {progress} / {mission.targetValue}
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>

        {/* 報酬セクション */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-xp-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">XP</span>
              </div>
              <span className="text-sm font-medium text-xp-600">+{mission.xpReward}</span>
            </div>
            {mission.badgeId && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-rarity-rare rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">🏆</span>
                </div>
                <span className="text-sm text-rarity-rare">バッジ</span>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="px-4 py-2 bg-xp-500 hover:bg-xp-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              報酬を受け取る
            </button>
          ) : (
            <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
              {Math.ceil(progressPercentage)}% 完了
            </div>
          )}
        </div>

        {/* 期限表示 */}
        {mission.expiresAt && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <span>⏰</span>
              <span>期限: {mission.expiresAt.toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* 完了時のエフェクト */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-xp-50 to-primary-50 opacity-20 pointer-events-none" />
      )}
    </Card>
  );
}