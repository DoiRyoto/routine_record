'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg shadow-sm border p-6 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}