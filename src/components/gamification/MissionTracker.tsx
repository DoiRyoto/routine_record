'use client';

import React from 'react';

import { MissionCard } from './MissionCard';
import type { Mission, UserMission } from '@/types/gamification';
import { cn } from '@/lib/ui-utils';

interface MissionTrackerProps {
  missions: Mission[];
  userMissions: UserMission[];
  onClaimReward?: (missionId: string) => void;
  maxDisplay?: number;
  variant?: 'grid' | 'list';
  className?: string;
}

export function MissionTracker({
  missions,
  userMissions,
  onClaimReward,
  maxDisplay = 6,
  variant = 'grid',
  className
}: MissionTrackerProps) {
  // ユーザーミッションをマップ化
  const userMissionMap = new Map(
    userMissions.map(um => [um.missionId, um])
  );

  // アクティブなミッションを優先度順にソート
  const sortedMissions = [...missions]
    .filter(mission => mission.isActive)
    .sort((a, b) => {
      const aUserMission = userMissionMap.get(a.id);
      const bUserMission = userMissionMap.get(b.id);
      
      // 完了済みミッション（報酬未受取）を最優先
      const aCompleted = aUserMission?.isCompleted && !aUserMission.completedAt;
      const bCompleted = bUserMission?.isCompleted && !bUserMission.completedAt;
      
      if (aCompleted && !bCompleted) return -1;
      if (!aCompleted && bCompleted) return 1;
      
      // 進捗率の高いものを次に優先
      const aProgress = aUserMission ? (aUserMission.progress / a.targetValue) : 0;
      const bProgress = bUserMission ? (bUserMission.progress / b.targetValue) : 0;
      
      if (aProgress !== bProgress) return bProgress - aProgress;
      
      // 難易度順
      const difficultyOrder = { easy: 1, medium: 2, hard: 3, legendary: 4 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    })
    .slice(0, maxDisplay);

  if (sortedMissions.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-gray-400 text-lg mb-2">🎯</div>
        <p className="text-text-secondary">利用可能なミッションがありません</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {sortedMissions.map((mission) => {
          const userMission = userMissionMap.get(mission.id);
          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              userMission={userMission}
              onClaim={onClaimReward}
            />
          );
        })}
      </div>
    );
  }

  // grid variant (default)
  return (
    <div className={cn(
      'grid gap-4',
      maxDisplay <= 2 ? 'grid-cols-1 md:grid-cols-2' :
      maxDisplay <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' :
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      className
    )}>
      {sortedMissions.map((mission) => {
        const userMission = userMissionMap.get(mission.id);
        return (
          <MissionCard
            key={mission.id}
            mission={mission}
            userMission={userMission}
            onClaim={onClaimReward}
          />
        );
      })}
    </div>
  );
}