'use client';

import { useState } from 'react';
import type { ExecutionRecord, Routine } from '@/types/routine';
import type { UserSettings } from '@/types/user-settings';
import Statistics from './_components/Statistics';

interface StatisticsPageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettings;
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