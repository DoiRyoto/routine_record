'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isDarkMode?: boolean;
}

export default function Card({ children, className = '', isDarkMode = false }: CardProps) {
  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } ${className}`}>
      {children}
    </div>
  );
}