'use client';

import React, { useState } from 'react';

import type { Mission, UserMission, MissionType, MissionDifficulty } from '@/types/gamification';

import { MissionTracker, StatCard } from '@/components/gamification';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

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
  duration: '時間',
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
        <StatCard
          title="総ミッション数"
          value={stats.total}
          icon={<span className="text-lg">🎯</span>}
          variant="default"
        />
        <StatCard
          title="進行中"
          value={stats.active}
          icon={<span className="text-lg">⏳</span>}
          variant="primary"
        />
        <StatCard
          title="完了済み"
          value={stats.completed}
          icon={<span className="text-lg">✅</span>}
          variant="success"
        />
        <StatCard
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
            <select 
              value={filters.type || ''}
              onChange={(e) => handleFilterChange({ 
                ...filters, 
                type: e.target.value as MissionType | undefined || undefined 
              })}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">全て</option>
              {Object.entries(missionTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">難易度:</span>
            <select
              value={filters.difficulty || ''}
              onChange={(e) => handleFilterChange({
                ...filters,
                difficulty: e.target.value as MissionDifficulty | undefined || undefined
              })}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">全て</option>
              {Object.entries(difficultyLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  <span className={difficultyColors[key as MissionDifficulty]}>
                    {label}
                  </span>
                </option>
              ))}
            </select>
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
            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
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
          <MissionTracker
            missions={getFilteredMissions('all')}
            userMissions={userMissions}
            onClaimReward={onClaimReward}
            maxDisplay={20}
            variant="grid"
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <MissionTracker
            missions={getFilteredMissions('active')}
            userMissions={userMissions}
            onClaimReward={onClaimReward}
            maxDisplay={20}
            variant="grid"
          />
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <MissionTracker
            missions={getFilteredMissions('available')}
            userMissions={userMissions}
            onClaimReward={onClaimReward}
            maxDisplay={20}
            variant="grid"
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <MissionTracker
            missions={getFilteredMissions('completed')}
            userMissions={userMissions}
            onClaimReward={onClaimReward}
            maxDisplay={20}
            variant="grid"
          />
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