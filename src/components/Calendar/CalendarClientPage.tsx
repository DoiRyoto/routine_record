'use client';

import React, { useState } from 'react';

import type { Routine, ExecutionRecord } from '@/types/routine';

import Calendar from './Calendar';

interface Props {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
}

export default function CalendarClientPage({ initialRoutines, initialExecutionRecords }: Props) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return <Calendar routines={routines} executionRecords={executionRecords} />;
}
