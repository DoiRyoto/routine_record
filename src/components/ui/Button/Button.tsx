'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/ui-utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-60 disabled:saturate-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue text-white shadow-lg hover:shadow-xl hover:bg-deep-blue hover:-translate-y-0.5',
        secondary: 'bg-green text-white shadow-lg hover:shadow-xl hover:bg-deep-green hover:-translate-y-0.5',
        outline: 'border-2 border-blue bg-transparent text-blue hover:bg-blue hover:text-white shadow-md hover:shadow-lg',
        ghost: 'bg-transparent text-gray hover:bg-gray hover:text-white',
        danger: 'bg-red text-white shadow-lg hover:shadow-xl hover:bg-deep-red hover:-translate-y-0.5',
        success: 'bg-green text-white shadow-lg hover:shadow-xl hover:bg-deep-green hover:-translate-y-0.5',
        warning: 'bg-orange text-white shadow-lg hover:shadow-xl hover:bg-deep-orange hover:-translate-y-0.5',
        info: 'bg-teal text-white shadow-lg hover:shadow-xl hover:bg-deep-teal hover:-translate-y-0.5',
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm rounded-md',
        default: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0 rounded-md',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
