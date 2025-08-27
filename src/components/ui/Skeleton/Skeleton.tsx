'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'animate-pulse rounded-md bg-gray-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-200',
        text: 'bg-gray-200',
        avatar: 'rounded-full bg-gray-200',
        button: 'bg-gray-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={skeletonVariants({ variant, className })}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';