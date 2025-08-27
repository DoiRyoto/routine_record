'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const calloutVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        info: 'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600',
        warning: 'border-orange-200 bg-orange-50 text-orange-900 [&>svg]:text-orange-600',
        error: 'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
        success: 'border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  children: React.ReactNode;
}

export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={calloutVariants({ variant, className })}
      {...props}
    />
  )
);
Callout.displayName = 'Callout';