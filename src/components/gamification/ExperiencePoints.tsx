import React from 'react';

interface ExperiencePointsProps {
  value: number;
  variant?: 'badge' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ExperiencePoints({
  value,
  variant = 'badge',
  size = 'md',
  className = ''
}: ExperiencePointsProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  if (variant === 'text') {
    return (
      <span className={`font-medium ${className}`}>
        {value.toLocaleString()} XP
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center bg-blue-100 text-blue-800 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
      <span className="mr-1">⭐</span>
      {value.toLocaleString()} XP
    </div>
  );
}