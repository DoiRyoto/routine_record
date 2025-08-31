import React, { useState } from 'react';

import type { Challenge, UserChallenge } from '@/lib/db/schema';

import { Card } from '@/common/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/Tabs';

import { Leaderboard } from '@/components/gamification/Leaderboard';



interface LeaderboardEntry extends UserChallenge {
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface ChallengeItemProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  leaderboard?: LeaderboardEntry[];
  currentUserId?: string;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
  onShowLeaderboard?: (challengeId: string) => Promise<LeaderboardEntry[]>;
  className?: string;
}

export function ChallengeItem({
  challenge,
  userChallenge,
  leaderboard,
  currentUserId,
  onJoin,
  onLeave,
  onShowLeaderboard,
  className = ''
}: ChallengeItemProps) {
  const [currentLeaderboard, setCurrentLeaderboard] = useState<LeaderboardEntry[]>(leaderboard || []);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  const isJoined = !!userChallenge;
  const isCompleted = userChallenge?.isCompleted || false;

  const typeColors = {
    weekly: 'bg-blue/20 text-blue',
    monthly: 'bg-green/20 text-green',
    seasonal: 'bg-purple/20 text-purple',
    special: 'bg-orange/20 text-orange'
  };

  const handleShowLeaderboard = async () => {
    if (onShowLeaderboard && currentLeaderboard.length === 0) {
      setLoadingLeaderboard(true);
      try {
        const data = await onShowLeaderboard(challenge.id);
        setCurrentLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      }
      setLoadingLeaderboard(false);
    }
  };

  return (
    <Card className={`${className}`} data-testid="challenge-card">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="ranking" onClick={handleShowLeaderboard}>ランキング</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-text-primary">{challenge.title}</h3>
                <p className="text-sm text-text-muted">{challenge.description}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[challenge.type]}`}>
                {challenge.type}
              </span>
            </div>
            
            {userChallenge && (
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">進捗</span>
                  <span className="font-medium text-text-primary">{userChallenge.progress}%</span>
                </div>
                {userChallenge.rank && (
                  <div className="flex justify-between mt-1">
                    <span className="text-text-muted">あなたの順位</span>
                    <span className="font-medium text-orange">{userChallenge.rank}位</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">
                参加者: {challenge.participants}人
              </span>
              {!isJoined && onJoin && (
                <button 
                  onClick={() => onJoin(challenge.id)}
                  className="px-3 py-1 bg-blue/20 text-blue text-sm rounded hover:bg-blue/30 transition-colors"
                >
                  参加
                </button>
              )}
              {isJoined && !isCompleted && onLeave && (
                <button 
                  onClick={() => onLeave(challenge.id)}
                  className="px-3 py-1 bg-red/20 text-red text-sm rounded hover:bg-red/30 transition-colors"
                >
                  脱退
                </button>
              )}
              {isCompleted && (
                <span className="text-sm text-green font-medium">完了</span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="p-0">
          {loadingLeaderboard ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-orange border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-text-muted">リーダーボードを読み込み中...</p>
            </div>
          ) : (
            <Leaderboard
              leaderboard={currentLeaderboard}
              currentUserId={currentUserId}
              className="border-0 shadow-none"
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}