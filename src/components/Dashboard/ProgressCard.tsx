'use client';

import React from 'react';
import Card from '../Common/Card';

interface ProgressCardProps {
  title: string;
  completed: number;
  total: number;
  isDarkMode?: boolean;
}

export default function ProgressCard({ title, completed, total, isDarkMode = false }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <Card isDarkMode={isDarkMode}>
      <div className="space-y-3">
        <h3 className={`text-lg font-medium ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {completed}/{total}
          </span>
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {percentage}%
          </span>
        </div>
        
        <div className={`w-full bg-gray-200 rounded-full h-2.5 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}