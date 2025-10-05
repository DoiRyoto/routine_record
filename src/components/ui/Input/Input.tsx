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
          'border-gray/30 text-gray flex h-11 w-full rounded-lg border-2 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 placeholder:text-gray/50 focus:border-blue focus:shadow-blue/20 focus:shadow-lg focus:outline-none disabled:bg-gray/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray/20 dark:bg-black/20 dark:text-white dark:focus:border-blue dark:focus:shadow-blue/30 dark:placeholder:text-white/40',
          'file:text-blue file:border-0 file:bg-transparent file:text-sm file:font-semibold hover:border-gray/50 dark:hover:border-gray/40',
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