import React from 'react';

import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className = ''
}: StatsCardProps) {
  const variantClasses = {
    default: 'border-gray',
    primary: 'border-blue-200 bg-blue',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50'
  };

  return (
    <Card className={`p-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray">{title}</h3>
        {icon && <div className="text-lg">{icon}</div>}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {subtitle && (
        <p className="text-xs text-gray">{subtitle}</p>
      )}
    </Card>
  );
}