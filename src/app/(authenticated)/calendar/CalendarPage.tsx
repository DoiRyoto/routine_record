'use client';

import { useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/lib/db/schema';

import Calendar from './_components/Calendar';

interface CalendarPageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function CalendarPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
}: CalendarPageProps) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple/5 to-indigo/10 dark:from-black dark:via-purple/5 dark:to-indigo/10">
      <div className="container mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple/90 to-indigo/90 text-white rounded-2xl p-6 shadow-xl backdrop-blur-md border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  カレンダー
                </h1>
                <p className="text-white/80">
                  ルーチンの実行状況を確認しましょう
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* カレンダーコンテンツ */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
          <div className="p-6">
            <Calendar
              routines={routines}
              executionRecords={executionRecords}
              userSettings={userSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}