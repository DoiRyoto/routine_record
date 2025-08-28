'use client';

import { useState } from 'react';

import { UserAvatar, LevelProgressBar, ExperiencePoints, StreakDisplay } from '@/components/gamification';
import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine, UserProfile } from '@/lib/db/schema';

import Dashboard from './_components/Dashboard';

interface DashboardPageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
  userProfile?: UserProfile;
}

export default function DashboardPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
  userProfile,
}: DashboardPageProps) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            ユーザープロフィールを読み込めませんでした
          </p>
        </div>
      </div>
    );
  }


  const streakData = {
    current: userProfile.streak,
    longest: userProfile.longestStreak,
    freezeCount: 1, // この値はスキーマに存在しないため、後で追加またはハードコード
    lastActiveDate: userProfile.lastActiveAt,
  };

  return (
    <div className="space-y-6">
      {/* ゲーミフィケーションヘッダー */}
      <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 rounded-xl p-6 border border-primary-200" data-testid="gamification-header">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <UserAvatar 
            userProfile={userProfile}
            size="lg"
            showLevel={true}
          />
          
          <div className="flex-1 space-y-4">
            <LevelProgressBar
              level={userProfile.level}
              currentXP={userProfile.currentXP}
              nextLevelXP={userProfile.nextLevelXP}
              totalXP={userProfile.totalXP}
              size="md"
            />
            
            <div className="flex items-center gap-6">
              <ExperiencePoints 
                value={userProfile.totalXP}
                variant="badge"
                size="md"
              />
              
              <StreakDisplay
                streakData={streakData}
                variant="compact"
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* メインダッシュボード */}
      <Dashboard
        routines={routines}
        executionRecords={executionRecords}
        userSettings={userSettings}
        userProfile={userProfile}
      />
    </div>
  );
}