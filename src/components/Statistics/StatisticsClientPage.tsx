'use client';

import React, { useState } from 'react';

import type { Routine, ExecutionRecord } from '@/types/routine';

import Statistics from './Statistics';

interface Props {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
}

export default function StatisticsClientPage({ initialRoutines, initialExecutionRecords }: Props) {
  const [routines] = useState(initialRoutines);
  const [executionRecords] = useState(initialExecutionRecords);

  return <Statistics routines={routines} executionRecords={executionRecords} />;
}
