'use client';

import { useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/types/routine';

import Dashboard from './Dashboard';

interface Props {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function DashboardClientPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
}: Props) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return (
    <Dashboard
      routines={routines}
      executionRecords={executionRecords}
      userSettings={userSettings}
    />
  );
}
