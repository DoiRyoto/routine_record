'use client';

import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white text-gray-900',
        success: 'border-green-200 bg-green-50 text-green-900',
        error: 'border-red-200 bg-red-50 text-red-900',
        warning: 'border-orange-200 bg-orange-50 text-orange-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={`fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] ${className}`}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={toastVariants({ variant, className })}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={`absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 ${className}`}
    toast-close=""
    {...props}
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={`text-sm font-semibold ${className}`}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className = '', ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={`text-sm opacity-90 ${className}`}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;