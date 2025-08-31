'use client';

import React, { useState } from 'react';


import type { Mission, UserMission } from '@/lib/db/schema';

import { StatsCard } from '@/common/components/charts/StatsCard';
import { Card } from '@/common/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/Tabs';

import { TaskCard } from '@/model/mission/components/TaskCard';


type MissionType = 'streak' | 'count' | 'duration' | 'variety' | 'consistency';
type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

interface MissionsPageProps {
  missions: Mission[];
  userMissions: UserMission[];
  onClaimReward?: (missionId: string) => void;
  onFilterChange?: (filters: MissionFilters) => void;
}

interface MissionFilters {
  type?: MissionType;
  difficulty?: MissionDifficulty;
  status?: 'all' | 'active' | 'completed' | 'available';
}

const missionTypeLabels = {
  streak: 'ストリーク',
  count: '回数',
  value: '時間',
  variety: '多様性',
  consistency: '継続性'
};

const difficultyLabels = {
  easy: '簡単',
  medium: '普通', 
  hard: '困難',
  legendary: '伝説'
};

const difficultyColors = {
  easy: 'text-rarity-common',
  medium: 'text-rarity-rare',
  hard: 'text-rarity-epic', 
  legendary: 'text-rarity-legendary'
};

export function MissionsPage({ 
  missions, 
  userMissions, 
  onClaimReward,
  onFilterChange 
}: MissionsPageProps) {
  const [filters, setFilters] = useState<MissionFilters>({});
  const [activeTab, setActiveTab] = useState('all');

  // 統計データの計算
  const stats = {
    total: missions.length,
    active: userMissions.filter(um => !um.isCompleted).length,
    completed: userMissions.filter(um => um.isCompleted).length,
    available: missions.filter(m => !userMissions.some(um => um.missionId === m.id)).length
  };

  // フィルタリングされたミッション
  const getFilteredMissions = (status: string) => {
    let filtered = [...missions];

    // ステータスフィルター
    if (status !== 'all') {
      const userMissionMap = new Map(userMissions.map(um => [um.missionId, um]));
      
      filtered = filtered.filter(mission => {
        const userMission = userMissionMap.get(mission.id);
        
        switch (status) {
          case 'active':
            return userMission && !userMission.isCompleted;
          case 'completed':
            return userMission && userMission.isCompleted;
          case 'available':
            return !userMission && mission.isActive;
          default:
            return true;
        }
      });
    }

    // その他のフィルター
    if (filters.type) {
      filtered = filtered.filter(m => m.type === filters.type);
    }
    if (filters.difficulty) {
      filtered = filtered.filter(m => m.difficulty === filters.difficulty);
    }

    return filtered;
  };

  const handleFilterChange = (newFilters: MissionFilters) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">🎯 ミッション</h1>
          <p className="text-text-secondary">チャレンジを完了してXPとバッジを獲得しよう！</p>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="総ミッション数"
          value={stats.total}
          icon={<span className="text-lg">🎯</span>}
          variant="default"
        />
        <StatsCard
          title="進行中"
          value={stats.active}
          icon={<span className="text-lg">⏳</span>}
          variant="primary"
        />
        <StatsCard
          title="完了済み"
          value={stats.completed}
          icon={<span className="text-lg">✅</span>}
          variant="success"
        />
        <StatsCard
          title="利用可能"
          value={stats.available}
          icon={<span className="text-lg">🆕</span>}
          variant="warning"
        />
      </div>

      {/* フィルターセクション */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">種類:</span>
            <Select
              value={filters.type || ''}
              onValueChange={(value) => handleFilterChange({ 
                ...filters, 
                type: value as MissionType | undefined || undefined 
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全て" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全て</SelectItem>
                {Object.entries(missionTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">難易度:</span>
            <Select
              value={filters.difficulty || ''}
              onValueChange={(value) => handleFilterChange({
                ...filters,
                difficulty: value as MissionDifficulty | undefined || undefined
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="全て" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全て</SelectItem>
                {Object.entries(difficultyLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <span className={difficultyColors[key as MissionDifficulty]}>
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(filters.type || filters.difficulty) && (
            <button
              onClick={() => handleFilterChange({})}
              className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 underline"
            >
              フィルターをリセット
            </button>
          )}
        </div>
      </Card>

      {/* ミッションタブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="relative">
            全て
            <span className="ml-2 px-2 py-0.5 bg-gray text-gray rounded-full text-xs">
              {stats.total}
            </span>
          </TabsTrigger>
          <TabsTrigger value="active" className="relative">
            進行中
            <span className="ml-2 px-2 py-0.5 bg-primary-200 text-primary-700 rounded-full text-xs">
              {stats.active}
            </span>
          </TabsTrigger>
          <TabsTrigger value="available" className="relative">
            利用可能
            <span className="ml-2 px-2 py-0.5 bg-warning-200 text-warning-700 rounded-full text-xs">
              {stats.available}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            完了済み
            <span className="ml-2 px-2 py-0.5 bg-xp-200 text-xp-700 rounded-full text-xs">
              {stats.completed}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredMissions('all').slice(0, 20).map((mission) => (
              <TaskCard
                key={mission.id}
                mission={mission}
                userMission={userMissions.find(um => um.missionId === mission.id)}
                onClaim={onClaimReward}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredMissions('active').slice(0, 20).map((mission) => (
              <TaskCard
                key={mission.id}
                mission={mission}
                userMission={userMissions.find(um => um.missionId === mission.id)}
                onClaim={onClaimReward}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredMissions('available').slice(0, 20).map((mission) => (
              <TaskCard
                key={mission.id}
                mission={mission}
                userMission={userMissions.find(um => um.missionId === mission.id)}
                onClaim={onClaimReward}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredMissions('completed').slice(0, 20).map((mission) => (
              <TaskCard
                key={mission.id}
                mission={mission}
                userMission={userMissions.find(um => um.missionId === mission.id)}
                onClaim={onClaimReward}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 空の状態 */}
      {getFilteredMissions(activeTab).length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {activeTab === 'completed' ? '完了したミッションがありません' :
             activeTab === 'active' ? '進行中のミッションがありません' :
             activeTab === 'available' ? '利用可能なミッションがありません' :
             'ミッションが見つかりません'}
          </h3>
          <p className="text-text-secondary">
            {activeTab === 'available' ? '新しいミッションをお待ちください' :
             'ルーティンを実行してミッションを進めましょう！'}
          </p>
        </div>
      )}
    </div>
  );
}