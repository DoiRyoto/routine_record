'use client';

import React from 'react';

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/ui-utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    period?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-white',
    border: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
    value: 'text-text-primary',
    title: 'text-text-secondary'
  },
  primary: {
    bg: 'bg-gradient-to-br from-primary-50 to-primary-100',
    border: 'border-primary-200',
    iconBg: 'bg-primary-500',
    iconText: 'text-white',
    value: 'text-primary-800',
    title: 'text-primary-700'
  },
  success: {
    bg: 'bg-gradient-to-br from-xp-50 to-xp-100',
    border: 'border-xp-200',
    iconBg: 'bg-xp-500',
    iconText: 'text-white',
    value: 'text-xp-800',
    title: 'text-xp-700'
  },
  warning: {
    bg: 'bg-gradient-to-br from-warning-50 to-warning-100',
    border: 'border-warning-200',
    iconBg: 'bg-warning-500',
    iconText: 'text-white',
    value: 'text-warning-800',
    title: 'text-warning-700'
  },
  error: {
    bg: 'bg-gradient-to-br from-error-50 to-error-100',
    border: 'border-error-200',
    iconBg: 'bg-error-500',
    iconText: 'text-white',
    value: 'text-error-800',
    title: 'text-error-700'
  }
};

const sizeStyles = {
  sm: {
    padding: 'p-3',
    icon: 'w-8 h-8 p-1.5',
    value: 'text-lg',
    title: 'text-xs',
    subtitle: 'text-xs',
    trend: 'text-xs'
  },
  md: {
    padding: 'p-4',
    icon: 'w-10 h-10 p-2',
    value: 'text-2xl',
    title: 'text-sm',
    subtitle: 'text-sm',
    trend: 'text-sm'
  },
  lg: {
    padding: 'p-6',
    icon: 'w-12 h-12 p-2.5',
    value: 'text-3xl',
    title: 'text-base',
    subtitle: 'text-base',
    trend: 'text-base'
  }
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  className
}: StatCardProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      variantStyle.bg,
      variantStyle.border,
      className
    )}>
      <div className={sizeStyle.padding}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* タイトル */}
            <p className={cn(
              'font-medium truncate mb-1',
              variantStyle.title,
              sizeStyle.title
            )}>
              {title}
            </p>

            {/* メイン値 */}
            <p className={cn(
              'font-bold mb-1',
              variantStyle.value,
              sizeStyle.value
            )}>
              {formatValue(value)}
            </p>

            {/* サブタイトル */}
            {subtitle && (
              <p className={cn(
                'text-text-light truncate',
                sizeStyle.subtitle
              )}>
                {subtitle}
              </p>
            )}

            {/* トレンド表示 */}
            {trend && (
              <div className={cn('flex items-center gap-1 mt-2', sizeStyle.trend)}>
                <span className={cn(
                  'font-medium',
                  trend.isPositive !== false ? 'text-xp-600' : 'text-error-600'
                )}>
                  {trend.isPositive !== false ? '↗' : '↘'} {Math.abs(trend.value)}%
                </span>
                {trend.period && (
                  <span className="text-text-light">
                    {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* アイコン */}
          {icon && (
            <div className={cn(
              'flex items-center justify-center rounded-lg flex-shrink-0',
              variantStyle.iconBg,
              variantStyle.iconText,
              sizeStyle.icon
            )}>
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* 装飾的なグラデーション */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
    </Card>
  );
}