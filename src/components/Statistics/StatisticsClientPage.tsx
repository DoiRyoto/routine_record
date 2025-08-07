'use client';

import { useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/types/routine';

import Statistics from './Statistics';

interface Props {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function StatisticsClientPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
}: Props) {
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
