'use client';

import React, { useState } from 'react';

import type { Challenge, UserChallenge, ChallengeType } from '@/types/gamification';

import { ChallengeCard, StatCard } from '@/components/gamification';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/ui-utils';

interface ChallengesPageProps {
  challenges: Challenge[];
  userChallenges: UserChallenge[];
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
  onJoinChallenge,
  onLeaveChallenge
}: ChallengesPageProps) {
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">🚀 チャレンジ</h1>
          <p className="text-text-secondary">みんなと一緒に挑戦して特別な報酬を獲得しよう！</p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="総チャレンジ数"
          value={stats.total}
          icon={<span className="text-lg">🚀</span>}
          variant="default"
        />
        <StatCard
          title="アクティブ"
          value={stats.active}
          icon={<span className="text-lg">⚡</span>}
          variant="primary"
        />
        <StatCard
          title="参加中"
          value={stats.joined}
          icon={<span className="text-lg">🎯</span>}
          variant="warning"
        />
        <StatCard
          title="完了済み"
          value={stats.completed}
          icon={<span className="text-lg">🏆</span>}
          variant="success"
        />
      </div>

      {/* タイプフィルター */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedType === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <span className="ml-2 px-2 py-0.5 bg-primary-200 text-primary-700 rounded-full text-xs">
              {activeChallenges.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="available">
            利用可能
            <span className="ml-2 px-2 py-0.5 bg-warning-200 text-warning-700 rounded-full text-xs">
              {availableChallenges.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="joined">
            参加中
            <span className="ml-2 px-2 py-0.5 bg-accent-200 text-accent-700 rounded-full text-xs">
              {joinedChallenges.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            完了済み
            <span className="ml-2 px-2 py-0.5 bg-xp-200 text-xp-700 rounded-full text-xs">
              {completedChallenges.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges(selectedType)
              .filter(c => activeChallenges.includes(c))
              .map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  userChallenge={userChallengeMap.get(challenge.id)}
                  onJoin={onJoinChallenge}
                  onLeave={onLeaveChallenge}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges(selectedType)
              .filter(c => availableChallenges.includes(c))
              .map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={onJoinChallenge}
                  onLeave={onLeaveChallenge}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges(selectedType)
              .filter(c => joinedChallenges.includes(c))
              .map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  userChallenge={userChallengeMap.get(challenge.id)}
                  onJoin={onJoinChallenge}
                  onLeave={onLeaveChallenge}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges(selectedType)
              .filter(c => completedChallenges.includes(c))
              .map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  userChallenge={userChallengeMap.get(challenge.id)}
                  onJoin={onJoinChallenge}
                  onLeave={onLeaveChallenge}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 近日開催予定 */}
      {challenges.filter(c => !c.isActive && c.startDate > new Date()).length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">🔜 近日開催予定</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges
              .filter(c => !c.isActive && c.startDate > new Date())
              .slice(0, 3)
              .map((challenge) => (
                <div key={challenge.id} className="p-4 border border-gray-200 rounded-lg opacity-75">
                  <h3 className="font-semibold text-text-primary mb-2">{challenge.title}</h3>
                  <p className="text-sm text-text-secondary mb-2">{challenge.description}</p>
                  <p className="text-xs text-primary-600">
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
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            チャレンジが見つかりません
          </h3>
          <p className="text-text-secondary">
            新しいチャレンジをお待ちください！
          </p>
        </div>
      )}
    </div>
  );
}