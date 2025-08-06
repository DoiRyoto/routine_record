'use client';

import React, { useState } from 'react';

import type { Routine, ExecutionRecord } from '@/types/routine';

import Dashboard from './Dashboard';

interface Props {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
}

export default function DashboardClientPage({ initialRoutines, initialExecutionRecords }: Props) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return <Dashboard routines={routines} executionRecords={executionRecords} />;
}
