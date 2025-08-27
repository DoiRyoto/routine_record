'use client';

import { useState } from 'react';

import type { ExecutionRecord, Routine } from '@/types/routine';
import type { UserSettings } from '@/types/user-settings';

import Dashboard from './_components/Dashboard';

interface DashboardPageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettings;
}

export default function DashboardPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
}: DashboardPageProps) {
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