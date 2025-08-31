import React from 'react';

import type { Mission, UserMission } from '@/lib/db/schema';

import { Card } from '@/common/components/ui/Card';
import { Progress } from '@/common/components/ui/Progress';


interface TaskCardProps {
  mission: Mission;
  userMission?: UserMission;
  onStart?: (missionId: string) => void;
  onClaim?: (missionId: string) => void;
  className?: string;
}

export function TaskCard({
  mission,
  userMission,
  onStart,
  onClaim,
  className = ''
}: TaskCardProps) {
  const progress = userMission ? (userMission.progress / mission.targetValue) * 100 : 0;
  const isCompleted = userMission?.isCompleted || false;
  const canClaim = isCompleted && !userMission?.claimedAt;

  const difficultyColors = {
    easy: 'text-text-success',
    medium: 'text-text-warning', 
    hard: 'text-text-error',
    extreme: 'text-text-primary'
  };

  return (
    <Card className={`bg-bg-primary p-4 ${className}`}>
      <div className="bg-bg-secondary space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-text-primary">{mission.title}</h3>
            <p className="text-sm text-text-muted">{mission.description}</p>
          </div>
          <span className={`text-xs font-medium ${difficultyColors[mission.difficulty]}`}>
            {mission.difficulty.toUpperCase()}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">進捗</span>
            <span className="text-text-primary">{userMission?.progress || 0} / {mission.targetValue}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-text-success">
            +{mission.xpReward} XP
          </span>
          {!userMission && onStart && (
            <button 
              onClick={() => onStart(mission.id)}
              className="px-3 py-1 bg-bg-primary text-text-primary text-sm rounded hover:bg-bg-secondary"
            >
              開始
            </button>
          )}
          {canClaim && onClaim && (
            <button 
              onClick={() => onClaim(mission.id)}
              className="px-3 py-1 bg-bg-success text-text-primary text-sm rounded hover:bg-bg-secondary"
            >
              報酬受取
            </button>
          )}
          {isCompleted && userMission?.claimedAt && (
            <span className="text-sm text-text-muted">完了</span>
          )}
        </div>
      </div>
    </Card>
  );
}