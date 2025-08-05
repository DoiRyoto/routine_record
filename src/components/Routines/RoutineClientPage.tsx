'use client';

import React, { useState } from 'react';
import type { Routine } from '@/types/routine';
import { useApiActions } from '@/hooks/useApi';
import RoutineList from './RoutineList';

interface Props {
  initialRoutines: Routine[];
}

export default function RoutineClientPage({ initialRoutines }: Props) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const { routines: routineApi } = useApiActions();

  const handleAddRoutine = async (routine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRoutine = await routineApi.create(routine);
      setRoutines(prev => [...prev, newRoutine]);
    } catch (error) {
      console.error('ルーチンの作成に失敗しました:', error);
    }
  };

  const handleUpdateRoutine = async (id: string, updates: Partial<Routine>) => {
    try {
      const updatedRoutine = await routineApi.update(id, updates);
      if (updatedRoutine) {
        setRoutines(prev => prev.map(r => r.id === id ? updatedRoutine : r));
      }
    } catch (error) {
      console.error('ルーチンの更新に失敗しました:', error);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    try {
      await routineApi.delete(id);
      setRoutines(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('ルーチンの削除に失敗しました:', error);
    }
  };

  return (
    <div className="space-y-6">
      <RoutineList 
        routines={routines} 
        onEdit={(routine) => handleUpdateRoutine(routine.id, routine)}
        onDelete={handleDeleteRoutine}
        onAdd={handleAddRoutine}
      />
    </div>
  );
}