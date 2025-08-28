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
      <span className={`font-medium ${className}`} data-testid="xp-counter">
        {value.toLocaleString()} XP
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center bg-blue-100 text-blue-800 rounded-full font-medium ${sizeClasses[size]} ${className}`} data-testid="xp-counter">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      {value.toLocaleString()} XP
    </div>
  );
}