import React from 'react';

import { Card } from '@/components/ui/Card';
import type { Challenge, UserChallenge } from '@/lib/db/schema';

interface ChallengeItemProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
  className?: string;
}

export function ChallengeItem({
  challenge,
  userChallenge,
  onJoin,
  onLeave,
  className = ''
}: ChallengeItemProps) {
  const isJoined = !!userChallenge;
  const isCompleted = userChallenge?.isCompleted || false;

  const typeColors = {
    weekly: 'bg-blue-100 text-blue-800',
    monthly: 'bg-green-100 text-green-800',
    seasonal: 'bg-purple-100 text-purple-800',
    special: 'bg-orange-100 text-orange-800'
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{challenge.title}</h3>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[challenge.type]}`}>
            {challenge.type}
          </span>
        </div>
        
        {userChallenge && (
          <div className="text-sm">
            <div className="flex justify-between">
              <span>進捗</span>
              <span>{userChallenge.progress}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            参加者: {challenge.participants}人
          </span>
          {!isJoined && onJoin && (
            <button 
              onClick={() => onJoin(challenge.id)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              参加
            </button>
          )}
          {isJoined && !isCompleted && onLeave && (
            <button 
              onClick={() => onLeave(challenge.id)}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              脱退
            </button>
          )}
          {isCompleted && (
            <span className="text-sm text-green-600 font-medium">完了</span>
          )}
        </div>
      </div>
    </Card>
  );
}