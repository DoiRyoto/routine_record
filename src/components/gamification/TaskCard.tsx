import React from 'react';

import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import type { Mission, UserMission } from '@/lib/db/schema';

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
    easy: 'text-green-600',
    medium: 'text-yellow-600', 
    hard: 'text-red-600',
    extreme: 'text-purple-600'
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{mission.title}</h3>
            <p className="text-sm text-gray-600">{mission.description}</p>
          </div>
          <span className={`text-xs font-medium ${difficultyColors[mission.difficulty]}`}>
            {mission.difficulty.toUpperCase()}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>進捗</span>
            <span>{userMission?.progress || 0} / {mission.targetValue}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-blue-600">
            +{mission.xpReward} XP
          </span>
          {!userMission && onStart && (
            <button 
              onClick={() => onStart(mission.id)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              開始
            </button>
          )}
          {canClaim && onClaim && (
            <button 
              onClick={() => onClaim(mission.id)}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              報酬受取
            </button>
          )}
          {isCompleted && userMission?.claimedAt && (
            <span className="text-sm text-gray-500">完了</span>
          )}
        </div>
      </div>
    </Card>
  );
}