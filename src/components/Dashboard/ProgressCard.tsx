'use client';

import React from 'react';
import Card from '../Common/Card';

interface ProgressCardProps {
  title: string;
  completed: number;
  total: number;
}

export default function ProgressCard({ title, completed, total }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <Card>
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {completed}/{total}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {percentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}