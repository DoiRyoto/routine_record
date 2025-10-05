'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { cn } from '@/lib/ui-utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'bg-gray/20 relative h-3 w-full overflow-hidden rounded-full shadow-inner dark:bg-gray/10',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="from-blue to-teal h-full w-full flex-1 rounded-full bg-gradient-to-r shadow-sm transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };