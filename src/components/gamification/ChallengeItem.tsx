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
    weekly: 'bg-blue dark:bg-dark-blue text-blue dark:text-blue',
    monthly: 'bg-green dark:bg-dark-green text-green dark:text-green',
    seasonal: 'bg-purple dark:bg-dark-purple text-purple dark:text-purple',
    special: 'bg-orange dark:bg-dark-orange text-orange dark:text-orange'
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{challenge.title}</h3>
            <p className="text-sm text-gray">{challenge.description}</p>
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
          <span className="text-sm text-gray">
            参加者: {challenge.participants}人
          </span>
          {!isJoined && onJoin && (
            <button 
              onClick={() => onJoin(challenge.id)}
              className="px-3 py-1 bg-blue dark:bg-dark-blue text-blue dark:text-blue text-sm rounded hover:bg-blue dark:hover:bg-dark-blue"
            >
              参加
            </button>
          )}
          {isJoined && !isCompleted && onLeave && (
            <button 
              onClick={() => onLeave(challenge.id)}
              className="px-3 py-1 bg-gray dark:bg-dark-gray text-gray dark:text-gray text-sm rounded hover:bg-gray dark:hover:bg-dark-gray"
            >
              脱退
            </button>
          )}
          {isCompleted && (
            <span className="text-sm text-green dark:text-green font-medium">完了</span>
          )}
        </div>
      </div>
    </Card>
  );
}