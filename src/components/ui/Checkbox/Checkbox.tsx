'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { clsx } from 'clsx';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={clsx(
      'peer h-4 w-4 shrink-0 rounded-sm border border-border-light ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary-500 data-[state=checked]:text-white data-[state=checked]:border-primary-500',
      'data-[state=indeterminate]:bg-primary-500 data-[state=indeterminate]:text-white data-[state=indeterminate]:border-primary-500',
      'hover:border-primary-300 transition-colors',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={clsx('flex items-center justify-center text-current')}
    >
      <CheckIcon className="h-3 w-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const CheckIcon = ({ className, ...props }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export { Checkbox };