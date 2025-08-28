'use client';

import { useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/lib/db/schema';

import Statistics from './_components/Statistics';

interface StatisticsPageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function StatisticsPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
}: StatisticsPageProps) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return (
    <Statistics
      routines={routines}
      executionRecords={executionRecords}
      userSettings={userSettings}
    />
  );
}