'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ExecutionTrendData {
  date: string;
  count: number;
}

interface ExecutionTrendChartProps {
  data: ExecutionTrendData[];
}

export function ExecutionTrendChart({ data }: ExecutionTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        aria-label="実行回数推移チャート。過去30日間の日別実行回数を表示。"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#2563eb" 
          strokeWidth={2}
          dot={{ fill: '#2563eb' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}