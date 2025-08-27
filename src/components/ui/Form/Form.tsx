'use client';

import * as FormPrimitive from '@radix-ui/react-form';
import * as React from 'react';

import { cn } from '@/lib/ui-utils';

const Form = FormPrimitive.Root;

const FormField = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Field>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Field>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Field
    ref={ref}
    className={cn('space-y-2', className)}
    {...props}
  />
));
FormField.displayName = FormPrimitive.Field.displayName;

const FormLabel = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Label
    ref={ref}
    className={cn(
      'text-sm font-medium text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
));
FormLabel.displayName = FormPrimitive.Label.displayName;

const FormControl = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Control>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Control>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Control
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
FormControl.displayName = FormPrimitive.Control.displayName;

const FormMessage = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Message>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, children, ...props }, ref) => (
  <FormPrimitive.Message
    ref={ref}
    className={cn('text-sm font-medium text-red-600', className)}
    {...props}
  >
    {children}
  </FormPrimitive.Message>
));
FormMessage.displayName = FormPrimitive.Message.displayName;

const FormValidityState = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.ValidityState>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.ValidityState>
>((props, ref) => (
  <FormPrimitive.ValidityState
    ref={ref}
    {...props}
  />
));
FormValidityState.displayName = FormPrimitive.ValidityState.displayName;

const FormSubmit = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Submit>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Submit>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Submit
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2',
      className
    )}
    {...props}
  />
));
FormSubmit.displayName = FormPrimitive.Submit.displayName;

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormValidityState,
  FormSubmit,
};