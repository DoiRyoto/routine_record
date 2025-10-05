'use client';

import * as React from 'react';

import { cn } from '@/lib/ui-utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition-all duration-200 focus:border-black focus:shadow-lg focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white dark:bg-black dark:text-white',
          'file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-black dark:file:text-white',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };