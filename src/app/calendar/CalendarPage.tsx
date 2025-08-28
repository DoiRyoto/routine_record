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
    <Calendar
      routines={routines}
      executionRecords={executionRecords}
      userSettings={userSettings}
    />
  );
}