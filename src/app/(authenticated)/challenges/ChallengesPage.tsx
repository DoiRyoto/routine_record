'use client';

import React, { useState } from 'react';

import type { Challenge, UserChallenge } from '@/lib/db/schema';

import { Card } from '@/common/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/Tabs';
import { cn } from '@/common/lib/ui-utils';

import { ChallengeItem } from '@/model/challenge/components/item/ChallengeItem';



type ChallengeType = 'weekly' | 'monthly' | 'seasonal' | 'special';

interface LeaderboardEntry extends UserChallenge {
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface ChallengesPageProps {
  challenges: Challenge[];
  userChallenges: UserChallenge[];
  currentUserId?: string;
  onJoinChallenge?: (challengeId: string) => void;
  onLeaveChallenge?: (challengeId: string) => void;
}

const typeLabels = {
  weekly: 'ウィークリー',
  monthly: 'マンスリー',
  seasonal: 'シーズナル',
  special: 'スペシャル'
};

export function ChallengesPage({
  challenges,
  userChallenges,
  currentUserId,
  onJoinChallenge,
  onLeaveChallenge
}: ChallengesPageProps) {
  const handleJoinChallenge = (challengeId: string) => {
    if (onJoinChallenge) {
      onJoinChallenge(challengeId);
    } else {
      console.warn('Joining challenge:', challengeId);
    }
  };

  const handleLeaveChallenge = (challengeId: string) => {
    if (onLeaveChallenge) {
      onLeaveChallenge(challengeId);
    } else {
      console.warn('Leaving challenge:', challengeId);
    }
  };

  const handleShowLeaderboard = async (challengeId: string): Promise<LeaderboardEntry[]> => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}?action=leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  };
  const [selectedType, setSelectedType] = useState<ChallengeType | 'all'>('all');

  // 統計データ
  const userChallengeMap = new Map(userChallenges.map(uc => [uc.challengeId, uc]));
  const stats = {
    total: challenges.length,
    active: challenges.filter(c => c.isActive && new Date() <= c.endDate).length,
    joined: userChallenges.length,
    completed: userChallenges.filter(uc => uc.isCompleted).length
  };

  // フィルタリング
  const getFilteredChallenges = (type: ChallengeType | 'all') => {
    if (type === 'all') return challenges;
    return challenges.filter(c => c.type === type);
  };

  // タブごとのチャレンジ
  const activeChallenges = challenges.filter(c => 
    c.isActive && new Date() <= c.endDate
  );
  
  const joinedChallenges = challenges.filter(c =>
    userChallenges.some(uc => uc.challengeId === c.id)
  );

  const availableChallenges = challenges.filter(c =>
    c.isActive && 
    new Date() <= c.endDate &&
    !userChallenges.some(uc => uc.challengeId === c.id) &&
    (!c.maxParticipants || c.participants < c.maxParticipants)
  );

  const completedChallenges = challenges.filter(c =>
    userChallenges.some(uc => uc.challengeId === c.id && uc.isCompleted)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange/5 to-yellow/10 dark:from-black dark:via-orange/5 dark:to-yellow/10">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* ページヘッダー */}
        <div className="bg-gradient-to-r from-orange/90 to-yellow/90 text-white rounded-2xl p-8 shadow-xl backdrop-blur-md border border-white/20 dark:border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
              🚀
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">チャレンジ</h1>
              <p className="text-white/80 text-lg">
                みんなと一緒に挑戦して特別な報酬を獲得しよう！
              </p>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue/20 rounded-lg flex items-center justify-center text-2xl">🚀</div>
              <div>
                <p className="text-sm font-medium text-gray/70 dark:text-gray/90">総チャレンジ数</p>
                <p className="text-2xl font-bold text-gray dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green/20 rounded-lg flex items-center justify-center text-2xl">⚡</div>
              <div>
                <p className="text-sm font-medium text-gray/70 dark:text-gray/90">アクティブ</p>
                <p className="text-2xl font-bold text-gray dark:text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange/20 rounded-lg flex items-center justify-center text-2xl">🎯</div>
              <div>
                <p className="text-sm font-medium text-gray/70 dark:text-gray/90">参加中</p>
                <p className="text-2xl font-bold text-gray dark:text-white">{stats.joined}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow/20 rounded-lg flex items-center justify-center text-2xl">🏆</div>
              <div>
                <p className="text-sm font-medium text-gray/70 dark:text-gray/90">完了済み</p>
                <p className="text-2xl font-bold text-gray dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* タイプフィルター */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedType === 'all'
                  ? 'bg-blue text-white'
                  : 'bg-gray text-gray hover:bg-gray'
              )}
            >
              全て
            </button>
            {Object.entries(typeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key as ChallengeType)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedType === key
                    ? 'bg-blue text-white'
                    : 'bg-gray text-gray hover:bg-gray'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* チャレンジタブ */}
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">
              アクティブ
              <span className="ml-2 px-2 py-0.5 bg-blue/20 text-blue rounded-full text-xs">
                {activeChallenges.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="available">
              利用可能
              <span className="ml-2 px-2 py-0.5 bg-green/20 text-green rounded-full text-xs">
                {availableChallenges.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="joined">
              参加中
              <span className="ml-2 px-2 py-0.5 bg-orange/20 text-orange rounded-full text-xs">
                {joinedChallenges.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              完了済み
              <span className="ml-2 px-2 py-0.5 bg-yellow/20 text-yellow rounded-full text-xs">
                {completedChallenges.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredChallenges(selectedType)
                .filter(c => activeChallenges.includes(c))
                .map((challenge) => (
                  <ChallengeItem
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={userChallengeMap.get(challenge.id)}
                    currentUserId={currentUserId}
                    onJoin={handleJoinChallenge}
                    onLeave={handleLeaveChallenge}
                    onShowLeaderboard={handleShowLeaderboard}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="available" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredChallenges(selectedType)
                .filter(c => availableChallenges.includes(c))
                .map((challenge) => (
                  <ChallengeItem
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={handleJoinChallenge}
                    onLeave={handleLeaveChallenge}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="joined" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredChallenges(selectedType)
                .filter(c => joinedChallenges.includes(c))
                .map((challenge) => (
                  <ChallengeItem
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={userChallengeMap.get(challenge.id)}
                    currentUserId={currentUserId}
                    onJoin={handleJoinChallenge}
                    onLeave={handleLeaveChallenge}
                    onShowLeaderboard={handleShowLeaderboard}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredChallenges(selectedType)
                .filter(c => completedChallenges.includes(c))
                .map((challenge) => (
                  <ChallengeItem
                    key={challenge.id}
                    challenge={challenge}
                    userChallenge={userChallengeMap.get(challenge.id)}
                    currentUserId={currentUserId}
                    onJoin={handleJoinChallenge}
                    onLeave={handleLeaveChallenge}
                    onShowLeaderboard={handleShowLeaderboard}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* 近日開催予定 */}
        {challenges.filter(c => !c.isActive && c.startDate > new Date()).length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray dark:text-white mb-4">🔜 近日開催予定</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges
                .filter(c => !c.isActive && c.startDate > new Date())
                .slice(0, 3)
                .map((challenge) => (
                  <div key={challenge.id} className="p-4 border border-gray rounded-lg opacity-75">
                    <h3 className="font-semibold text-gray dark:text-white mb-2">{challenge.title}</h3>
                    <p className="text-sm text-gray/70 dark:text-gray/90 mb-2">{challenge.description}</p>
                    <p className="text-xs text-blue">
                      開始予定: {challenge.startDate.toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* 空の状態メッセージ */}
        {getFilteredChallenges(selectedType).length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray dark:text-white mb-2">
              チャレンジが見つかりません
            </h3>
            <p className="text-gray/70 dark:text-gray/90">
              新しいチャレンジをお待ちください！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}