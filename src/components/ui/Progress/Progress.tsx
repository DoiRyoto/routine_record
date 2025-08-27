'use client';

import React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className = '', value = 0, max = 100, variant = 'default', ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const indicatorColors = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500',
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={`h-full w-full flex-1 transition-all duration-300 ease-in-out ${indicatorColors[variant]}`}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;