'use client';

import { useEffect, useMemo, useState } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { CalendarData, ExecutionRecord, Routine } from '@/types/routine';
import { getUserTimezone, isSameDayInUserTimezone } from '@/utils/timezone';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

interface Props {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function Calendar({ routines, executionRecords, userSettings }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDayClick = (day: CalendarData) => {
    if (!day.isCurrentMonth) return; // 現在の月の日付のみクリック可能
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
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
              onClick={() => handleDayClick(day)}
              className={`min-h-[80px] p-1 border rounded cursor-pointer transition-colors ${
                day.isCurrentMonth ? 'border-gray-200 dark:border-gray-700' : 'opacity-50'
              } ${
                day.isToday
                  ? 'bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${day.isCurrentMonth ? 'hover:shadow-md' : ''}`}
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

      {/* 日付詳細モーダル */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDay ? `${selectedDay.dayNumber}日の実行記録` : ''}</DialogTitle>
          </DialogHeader>
        {selectedDay && (
          <div className="space-y-4">
            {selectedDay.routines.filter((routine) => routine.isCompleted).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                この日には実行されたミッションがありません
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  実行されたミッション（
                  {selectedDay.routines.filter((routine) => routine.isCompleted).length}件）
                </p>
                {selectedDay.routines
                  .filter((routine) => routine.isCompleted)
                  .map((routine, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          {routine.routineName}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
