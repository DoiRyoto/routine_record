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

  // ゲーミフィケーション用のモックデータ
  const mockUserProfile: UserProfile = userProfile || {
    userId: 'user1',
    level: 8,
    totalXP: 1650,
    currentXP: 150,
    nextLevelXP: 300,
    streak: 12,
    longestStreak: 28,
    totalRoutines: routines.length,
    totalExecutions: executionRecords.length,
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastActiveAt: new Date(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };


  const mockStreakData = {
    current: 12,
    longest: 28,
    freezeCount: 1,
    lastActiveDate: new Date(),
  };

  return (
    <div className="space-y-6">
      {/* ゲーミフィケーションヘッダー */}
      <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 rounded-xl p-6 border border-primary-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <UserAvatar 
            userProfile={mockUserProfile}
            size="lg"
            showLevel={true}
          />
          
          <div className="flex-1 space-y-4">
            <LevelProgressBar
              level={mockUserProfile.level}
              currentXP={mockUserProfile.currentXP}
              nextLevelXP={mockUserProfile.nextLevelXP}
              totalXP={mockUserProfile.totalXP}
              size="md"
            />
            
            <div className="flex items-center gap-6">
              <ExperiencePoints 
                value={mockUserProfile.totalXP}
                variant="badge"
                size="md"
              />
              
              <StreakDisplay
                streakData={mockStreakData}
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
        userProfile={mockUserProfile}
      />
    </div>
  );
}