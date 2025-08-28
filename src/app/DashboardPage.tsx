'use client';

import { useState } from 'react';

import { ExperiencePoints, LevelProgressBar, StreakDisplay, UserAvatar } from '@/components/gamification';
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
      <div className="min-h-screen bg-gradient-to-br from-white via-red/5 to-orange/10 dark:from-black dark:via-red/5 dark:to-orange/10 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-red/20 dark:border-red/10 max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray dark:text-white mb-2">
              エラーが発生しました
            </h1>
            <p className="text-gray/70 dark:text-gray/90">
              ユーザープロフィールを読み込めませんでした
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-dark-red transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            再読み込み
          </button>
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue/5 to-purple/10 dark:from-black dark:via-blue/5 dark:to-purple/10">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* ゲーミフィケーションヘッダー */}
        <div 
          className="relative overflow-hidden bg-gradient-to-br from-blue/90 to-teal/90 text-white rounded-2xl p-8 shadow-2xl backdrop-blur-md border border-white/20 dark:border-white/10" 
          data-testid="gamification-header"
        >
          {/* 背景装飾 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue/20 via-transparent to-teal/20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <UserAvatar
                  userProfile={userProfile}
                  size="lg"
                  showLevel={true}
                />
              </div>

              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    おかえりなさい！
                  </h1>
                  <p className="text-white/80 text-lg">
                    今日も素晴らしい一日にしましょう ✨
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <LevelProgressBar
                    level={userProfile.level}
                    currentXP={userProfile.currentXP}
                    nextLevelXP={userProfile.nextLevelXP}
                    totalXP={userProfile.totalXP}
                    size="md"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <div className="bg-white/15 rounded-xl px-4 py-2 backdrop-blur-sm">
                    <ExperiencePoints
                      value={userProfile.totalXP}
                      variant="badge"
                      size="md"
                    />
                  </div>

                  <div className="bg-white/15 rounded-xl px-4 py-2 backdrop-blur-sm">
                    <StreakDisplay
                      streakData={streakData}
                      variant="compact"
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインダッシュボード */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
          <Dashboard
            routines={routines}
            executionRecords={executionRecords}
            userSettings={userSettings}
            userProfile={userProfile}
          />
        </div>
      </div>
    </div>
  );
}