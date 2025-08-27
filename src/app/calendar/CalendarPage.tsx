'use client';

import { useState } from 'react';

import type { ExecutionRecord, Routine } from '@/types/routine';
import type { UserSettings } from '@/types/user-settings';

import Calendar from './_components/Calendar';

interface CalendarPageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettings;
}

export default function CalendarPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
}: CalendarPageProps) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return (
    <Calendar
      routines={routines}
      executionRecords={executionRecords}
      userSettings={userSettings}
    />
  );
}