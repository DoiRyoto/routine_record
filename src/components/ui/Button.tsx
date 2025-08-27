'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-500 text-white shadow-sm hover:bg-blue-600 focus-visible:ring-blue-500',
        secondary:
          'bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 focus-visible:ring-gray-500',
        success:
          'bg-green-500 text-white shadow-sm hover:bg-green-600 focus-visible:ring-green-500',
        warning:
          'bg-orange-500 text-white shadow-sm hover:bg-orange-600 focus-visible:ring-orange-500',
        danger:
          'bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-500',
        ghost:
          'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';