import React from 'react';

import { Card } from '@/common/components/ui/Card';

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
    default: 'bg-bg-secondary',
    primary: 'bg-bg-primary',
    success: 'bg-bg-success',
    warning: 'bg-bg-warning',
    danger: 'bg-bg-error'
  };

  return (
    <Card className={`bg-bg-primary p-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        {icon && <div className="text-lg text-text-primary">{icon}</div>}
      </div>
      <div className="text-2xl font-bold mb-1 text-text-primary">{value}</div>
      {subtitle && (
        <p className="text-xs text-text-muted">{subtitle}</p>
      )}
    </Card>
  );
}