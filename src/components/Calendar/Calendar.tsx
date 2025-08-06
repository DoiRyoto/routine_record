'use client';

import { useEffect, useMemo, useState } from 'react';

import { useUserSettings } from '@/hooks/useUserSettings';
import type { CalendarData, ExecutionRecord, Routine } from '@/types/routine';
import { getUserTimezone, isSameDayInUserTimezone } from '@/utils/timezone';

import Button from '../Common/Button';
import Card from '../Common/Card';

interface Props {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
}

export default function Calendar({ routines, executionRecords }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const { userSettings } = useUserSettings();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calendarData = useMemo(() => {
    if (!isMounted) {
      return [];
    } // マウント前は空配列を返す

    const timezone = getUserTimezone(userSettings?.timezone);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar: CalendarData[] = [];
    const current = new Date(startDate);

    // 今日の日付をユーザーのタイムゾーンで取得
    const todayInTz = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    for (let i = 0; i < 42; i++) {
      const [dateStr] = current.toISOString().split('T');

      const dayRecords = executionRecords.filter((record) =>
        isSameDayInUserTimezone(record.executedAt, current, timezone)
      );

      const dayRoutines = routines.map((routine) => {
        const isCompleted = dayRecords.some(
          (record) => record.routineId === routine.id && record.isCompleted
        );
        return {
          routineId: routine.id,
          routineName: routine.name,
          isCompleted,
        };
      });

      // ユーザーのタイムゾーンでの今日の日付と比較
      const currentDateInTz = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(current);

      calendar.push({
        date: dateStr,
        dayNumber: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: currentDateInTz === todayInTz,
        routines: dayRoutines,
      });

      current.setDate(current.getDate() + 1);
    }

    return calendar;
  }, [currentDate, routines, executionRecords, isMounted, userSettings?.timezone]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">カレンダー</h1>
        <div className="text-center py-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">カレンダー</h1>

        <div className="flex items-center space-x-4">
          <Button onClick={() => navigateMonth('prev')} variant="secondary" size="sm">
            ←
          </Button>

          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>

          <Button onClick={() => navigateMonth('next')} variant="secondary" size="sm">
            →
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              {day}
            </div>
          ))}

          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`min-h-[80px] p-1 border rounded ${
                day.isCurrentMonth ? 'border-gray-200 dark:border-gray-700' : 'opacity-50'
              } ${
                day.isToday
                  ? 'bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  day.isToday
                    ? 'text-blue-600 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {day.dayNumber}
              </div>

              <div className="space-y-1">
                {day.routines
                  .filter((routine) => routine.isCompleted)
                  .slice(0, 3)
                  .map((routine, routineIndex) => (
                    <div
                      key={routineIndex}
                      className="text-xs px-1 py-0.5 rounded truncate bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      title={routine.routineName}
                    >
                      {routine.routineName}
                    </div>
                  ))}

                {day.routines.filter((routine) => routine.isCompleted).length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{day.routines.filter((routine) => routine.isCompleted).length - 3}件
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
