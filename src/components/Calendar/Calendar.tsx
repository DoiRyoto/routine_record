'use client';

import React, { useState, useMemo } from 'react';
import { useRoutine } from '@/context/RoutineContext';
import { CalendarData } from '@/types/routine';
import Card from '../Common/Card';
import Button from '../Common/Button';

export default function Calendar() {
  const { routines, executionRecords, isDarkMode } = useRoutine();
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar: CalendarData[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const dayStart = new Date(current);
      const dayEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      
      const dayRecords = executionRecords.filter(record => 
        record.executedAt >= dayStart && 
        record.executedAt < dayEnd &&
        record.isCompleted
      );
      
      const routineData = dayRecords.map(record => {
        const routine = routines.find(r => r.id === record.routineId);
        return {
          routineId: record.routineId,
          routineName: routine?.name || '不明なルーチン',
          isCompleted: record.isCompleted,
          duration: record.duration,
        };
      });
      
      calendar.push({
        date: dateStr,
        routines: routineData,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return calendar;
  }, [currentDate, routines, executionRecords]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isCurrentMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          カレンダー
        </h1>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigateMonth('prev')}
            variant="secondary"
            size="sm"
            isDarkMode={isDarkMode}
          >
            ←
          </Button>
          
          <h2 className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>
          
          <Button
            onClick={() => navigateMonth('next')}
            variant="secondary"
            size="sm"
            isDarkMode={isDarkMode}
          >
            →
          </Button>
        </div>
      </div>

      <Card isDarkMode={isDarkMode}>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
          
          {calendarData.map((day, index) => {
            const date = new Date(day.date);
            const dayNumber = date.getDate();
            const isCurrentMonthDay = isCurrentMonth(day.date);
            const isTodayDay = isToday(day.date);
            
            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 border rounded ${
                  isDarkMode 
                    ? 'border-gray-700' 
                    : 'border-gray-200'
                } ${
                  !isCurrentMonthDay 
                    ? 'opacity-30' 
                    : ''
                } ${
                  isTodayDay
                    ? isDarkMode
                      ? 'bg-blue-900 border-blue-600'
                      : 'bg-blue-50 border-blue-300'
                    : isDarkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isTodayDay
                    ? isDarkMode
                      ? 'text-blue-200'
                      : 'text-blue-600'
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-700'
                }`}>
                  {dayNumber}
                </div>
                
                <div className="space-y-1">
                  {day.routines.slice(0, 3).map((routine, routineIndex) => (
                    <div
                      key={routineIndex}
                      className={`text-xs px-1 py-0.5 rounded truncate ${
                        isDarkMode
                          ? 'bg-green-900 text-green-200'
                          : 'bg-green-100 text-green-800'
                      }`}
                      title={routine.routineName}
                    >
                      {routine.routineName}
                    </div>
                  ))}
                  
                  {day.routines.length > 3 && (
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      +{day.routines.length - 3}件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}