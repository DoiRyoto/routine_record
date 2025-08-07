'use client';

import { useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/types/routine';

import Calendar from './Calendar';

interface Props {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function CalendarClientPage({
  initialRoutines,
  initialExecutionRecords,
  userSettings,
}: Props) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return (
    <Calendar routines={routines} executionRecords={executionRecords} userSettings={userSettings} />
  );
}
