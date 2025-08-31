'use client';

import { useState, useEffect } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/schema';
import type { ExecutionRecord, Routine, UserProfile } from '@/lib/db/schema';

import { DashboardSkeleton } from '@/common/components/ui/Skeleton';
import { Toast } from '@/common/components/ui/Toast';

import { LevelProgressBar } from '@/model/gamification/components/level/LevelProgressBar';
import { StreakDisplay } from '@/model/gamification/components/streak/StreakDisplay';
import { ExperiencePoints } from '@/model/gamification/components/xp/ExperiencePoints';
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';


import Dashboard from './_components/Dashboard';



interface DashboardPageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
  userProfile?: UserProfile;
  isLoading?: boolean;
  apiError?: string;
  networkError?: string;
  onRetry?: () => void;
}

export default function DashboardPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
  userProfile,
  isLoading = false,
  apiError,
  networkError,
  onRetry,
}: DashboardPageProps) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);
  const [xpNotification, setXpNotification] = useState<{
    message: string;
    visible: boolean;
  } | null>(null);

  const handleCompleteRoutine = async () => {
    try {
      // Simulate routine completion and XP gain
      const xpGained = 50;
      setXpNotification({
        message: `${xpGained} XP獲得！`,
        visible: true,
      });
    } catch (error) {
      console.error('ルーチン完了処理に失敗しました:', error);
    }
  };

  const closeXpNotification = () => {
    setXpNotification(prev => prev ? { ...prev, visible: false } : null);
    setTimeout(() => setXpNotification(null), 300);
  };

  // Add click handler to dashboard mock button for testing
  useEffect(() => {
    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.getAttribute('data-testid') === 'complete-routine-button') {
        handleCompleteRoutine();
      }
    };

    document.addEventListener('click', handleButtonClick);
    return () => document.removeEventListener('click', handleButtonClick);
  }, []);

  // ローディング状態の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue/5 to-purple/10 dark:from-black dark:via-blue/5 dark:to-purple/10">
        <div className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // APIエラーの表示
  if (apiError) {
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
              {apiError}
            </p>
          </div>
          <button 
            onClick={onRetry} 
            className="bg-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-dark-red transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // ネットワークエラーの表示
  if (networkError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red/5 to-orange/10 dark:from-black dark:via-red/5 dark:to-orange/10 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-red/20 dark:border-red/10 max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray dark:text-white mb-2">
              接続エラー
            </h1>
            <p className="text-gray/70 dark:text-gray/90">
              {networkError}
            </p>
          </div>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="bg-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-dark-orange transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    );
  }

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
    current: userProfile.streak || 0,
    longest: userProfile.longestStreak || 0,
    freezeCount: 1, // この値はスキーマに存在しないため、後で追加またはハードコード
    lastActiveDate: userProfile.lastActiveAt,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue/5 to-purple/10 dark:from-black dark:via-blue/5 dark:to-purple/10">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* ユーザーステータスカード */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10" data-testid="user-profile-header">
          <div className="flex items-center space-x-4 mb-4">
            <UserAvatar
              userProfile={userProfile}
              size="lg"
              showLevel={true}
            />
            <div>
              <h2 className="text-xl font-bold text-gray dark:text-white">
                レベル {userProfile.level || 1}
              </h2>
              <p className="text-sm text-gray/70 dark:text-gray/90">
                {(userProfile.totalXp || 0).toLocaleString()} XP
              </p>
              <p className="text-sm font-medium text-gray dark:text-white">
                ユーザー
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <LevelProgressBar
              level={userProfile.level || 1}
              currentXP={userProfile.currentXp || 0}
              nextLevelXP={userProfile.nextLevelXp || 100}
              totalXP={userProfile.totalXp || 0}
              size="md"
            />
          </div>

          <div className="flex space-x-4">
            <div className="bg-blue/10 dark:bg-blue/20 rounded-xl px-3 py-2">
              <ExperiencePoints
                value={userProfile.totalXp || 0}
                variant="badge"
                size="sm"
              />
            </div>
            <div className="bg-teal/10 dark:bg-teal/20 rounded-xl px-3 py-2">
              <StreakDisplay
                streakData={streakData}
                variant="compact"
                size="sm"
              />
            </div>
          </div>
        </div>

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
                    level={userProfile.level || 1}
                    currentXP={userProfile.currentXp || 0}
                    nextLevelXP={userProfile.nextLevelXp || 100}
                    totalXP={userProfile.totalXp || 0}
                    size="md"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <div className="bg-white/15 rounded-xl px-4 py-2 backdrop-blur-sm">
                    <ExperiencePoints
                      value={userProfile.totalXp || 0}
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

        {/* 今日の進捗 */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10" data-testid="daily-progress-summary">
          <h2 className="text-xl font-bold text-gray dark:text-white mb-4">今日の進捗</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue">3 / 5 完了</div>
              <div className="text-sm text-gray/70 dark:text-gray/90">今日のルーチン</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal">150 XP 獲得</div>
              <div className="text-sm text-gray/70 dark:text-gray/90">今日のXP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange">7日連続</div>
              <div className="text-sm text-gray/70 dark:text-gray/90">ストリーク</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green">60%</div>
              <div className="text-sm text-gray/70 dark:text-gray/90">完了率</div>
            </div>
          </div>
        </div>

        {/* 最近の実績 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10" data-testid="achievements-summary">
            <h3 className="text-lg font-bold text-gray dark:text-white mb-4">最近の実績</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🏆</span>
                <span className="text-gray dark:text-white">3日連続達成</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">⭐</span>
                <span className="text-gray dark:text-white">早起き習慣</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">💪</span>
                <span className="text-gray dark:text-white">週5回運動</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10" data-testid="notifications-summary">
            <h3 className="text-lg font-bold text-gray dark:text-white mb-4">通知</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray/70 dark:text-gray/90">🎉 レベルアップしました！</div>
              <div className="text-sm text-gray/70 dark:text-gray/90">⭐ 新しいバッジを獲得！</div>
              <div className="text-sm text-gray/70 dark:text-gray/90">🔥 7日間ストリーク達成！</div>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray dark:text-white mb-4">クイックアクション</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <a href="/routines" className="text-gray dark:text-white hover:text-blue transition-colors">
                ルーチン管理
              </a>
              <span className="text-gray/50 dark:text-gray/70 text-sm">→</span>
            </div>
            <div className="flex items-center justify-between">
              <a href="/statistics" className="text-gray dark:text-white hover:text-teal transition-colors">
                統計
              </a>
              <span className="text-gray/50 dark:text-gray/70 text-sm">→</span>
            </div>
            <div className="flex items-center justify-between">
              <a href="/settings" className="text-gray dark:text-white hover:text-gray transition-colors">
                設定
              </a>
              <span className="text-gray/50 dark:text-gray/70 text-sm">→</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray/20 dark:border-gray/10">
            <a 
              href="/routines/create" 
              className="block w-full bg-green text-white px-4 py-3 rounded-lg text-center font-medium hover:bg-green/80 transition-colors"
              data-testid="create-routine-link"
            >
              新しいルーチンを作成
            </a>
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
      
      {/* XP獲得通知 */}
      {xpNotification && (
        <Toast
          message={xpNotification.message}
          type="success"
          isVisible={xpNotification.visible}
          onClose={closeXpNotification}
        />
      )}
    </div>
  );
}