'use client';

import React from 'react';

import { subWeeks, subMonths, subYears } from 'date-fns';

import { Button } from '@/common/components/ui/Button';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset: '1week' | '1month' | '3months' | '1year' | 'custom';
}

interface DateRangePickerProps {
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const handlePresetClick = (preset: DateRange['preset']) => {
    const endDate = new Date();
    let startDate: Date;

    switch (preset) {
      case '1week':
        startDate = subWeeks(endDate, 1);
        break;
      case '1month':
        startDate = subMonths(endDate, 1);
        break;
      case '3months':
        startDate = subMonths(endDate, 3);
        break;
      case '1year':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subMonths(endDate, 1);
    }

    onChange({
      startDate,
      endDate,
      preset
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePresetClick('1week')}
      >
        1週間
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePresetClick('1month')}
      >
        1ヶ月
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePresetClick('3months')}
      >
        3ヶ月
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePresetClick('1year')}
      >
        1年
      </Button>
    </div>
  );
}